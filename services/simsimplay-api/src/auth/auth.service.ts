import { Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Inject } from "@nestjs/common";
import { DB_CLIENT } from "../services/services.module";
import { DbClient } from "../services/interfaces/db-client.interface";
import { AppConfig } from "../config/config";
import { AppError } from "../common/errors/app-error";
import type { LoginRequest, LoginResponse, User } from "@simsimplay/shared";

interface UserRow {
  id: string;
  email: string;
  nickname: string;
  password_hash: string;
}

@Injectable()
export class AuthService {
  constructor(@Inject(DB_CLIENT) private readonly db: DbClient) {}

  async register(email: string, password: string, nickname: string): Promise<User> {
    const normalizedNickname = nickname.trim();
    const existing = await this.db.query<UserRow>("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.length > 0) {
      throw new AppError("CONFLICT", "An account with this email already exists", 409);
    }
    const existingNickname = await this.db.query<UserRow>(
      "SELECT id FROM users WHERE LOWER(BTRIM(nickname)) = LOWER($1)",
      [normalizedNickname],
    );
    if (existingNickname.length > 0) {
      throw new AppError("CONFLICT", "This nickname is already taken", 409);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    let rows: UserRow[];
    try {
      rows = await this.db.query<UserRow>(
        "INSERT INTO users (email, nickname, password_hash) VALUES ($1, $2, $3) RETURNING id, email, nickname, password_hash",
        [email, normalizedNickname, passwordHash],
      );
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        throw new AppError("CONFLICT", "An account with this email or nickname already exists", 409);
      }
      throw error;
    }
    const row = rows[0];
    return { id: row.id, email: row.email, nickname: row.nickname };
  }

  async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    const rows = await this.db.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);
    const row = rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      throw new AppError("UNAUTHORIZED", "Invalid email or password", 401);
    }
    const token = jwt.sign({ sub: row.id, email: row.email }, AppConfig.jwtSecret || "dev-only-secret-change-me", {
      expiresIn: AppConfig.jwtExpiresIn,
    } as jwt.SignOptions);
    return {
      user: { id: row.id, email: row.email, nickname: row.nickname },
      session: { token, expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
    };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const rows = await this.db.query<UserRow>("SELECT id, email, nickname FROM users WHERE id = $1", [userId]);
    const row = rows[0];
    if (!row) throw new AppError("NOT_FOUND", "User not found", 404);
    return { id: row.id, email: row.email, nickname: row.nickname };
  }

  verifyToken(token: string): { sub: string; email: string } {
    try {
      return jwt.verify(token, AppConfig.jwtSecret || "dev-only-secret-change-me") as { sub: string; email: string };
    } catch {
      throw new AppError("UNAUTHORIZED", "Invalid or expired token", 401);
    }
  }
}
