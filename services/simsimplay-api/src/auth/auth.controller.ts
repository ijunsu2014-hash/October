import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { loginSchema, registerSchema } from "@simsimplay/shared";
import { AppError } from "../common/errors/app-error";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  async register(@Body() body: unknown) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid registration payload", 422, parsed.error.flatten());
    }
    return this.auth.register(parsed.data.email, parsed.data.password, parsed.data.nickname);
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
