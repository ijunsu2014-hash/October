import { Injectable, Inject } from "@nestjs/common";
import { DB_CLIENT } from "../services/services.module";
import { DbClient } from "../services/interfaces/db-client.interface";
import type { MatchRecord, Profile } from "@simsimplay/shared";

interface ProfileRow {
  user_id: string;
  nickname: string;
  rating: number;
}

@Injectable()
export class ProfileService {
  constructor(@Inject(DB_CLIENT) private readonly db: DbClient) {}

  async getProfile(userId: string): Promise<Profile> {
    const rows = await this.db.query<ProfileRow>(
      "SELECT user_id, nickname, rating FROM profiles WHERE user_id = $1",
      [userId],
    );
    const row = rows[0] ?? { user_id: userId, nickname: "플레이어", rating: 1000 };
    return { userId: row.user_id, nickname: row.nickname, rating: row.rating };
  }

  async getRecentMatches(userId: string, limit: number): Promise<MatchRecord[]> {
    return this.db.query<MatchRecord>(
      "SELECT opponent, mode, result, rating_change AS \"ratingChange\" FROM matches WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
      [userId, limit],
    );
  }
}
