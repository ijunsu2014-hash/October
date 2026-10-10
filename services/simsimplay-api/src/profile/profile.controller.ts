import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { AuthGuard } from "../auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("users/me")
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get("profile")
  async getProfile(@Req() req: { userId: string }) {
    const profile = await this.profile.getProfile(req.userId);
    return { profile, ratings: { current: profile.rating } };
  }

  @Get("matches")
  async getMatches(@Req() req: { userId: string }, @Query("limit") limit?: string) {
    const matches = await this.profile.getRecentMatches(req.userId, Number(limit ?? 20));
    return { matches };
  }
}
