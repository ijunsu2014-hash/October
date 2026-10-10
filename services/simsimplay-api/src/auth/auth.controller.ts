import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { loginSchema } from "@simsimplay/shared";
import { AppError } from "../common/errors/app-error";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  async register(@Body() body: { email: string; password: string; nickname: string }) {
    const parsed = loginSchema.safeParse({ email: body.email, password: body.password });
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid registration payload", 422, parsed.error.flatten());
    }
    return this.auth.register(body.email, body.password, body.nickname ?? body.email.split("@")[0]);
  }

  @Post("login")
  async login(@Body() body: unknown) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid login payload", 422, parsed.error.flatten());
    }
    return this.auth.login(parsed.data);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async me(@Req() req: { userId: string }) {
    return this.auth.getCurrentUser(req.userId);
  }
}
