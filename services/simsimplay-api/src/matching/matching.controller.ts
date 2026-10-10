import { Body, Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { MatchingService } from "./matching.service";
import { queueSchema } from "@simsimplay/shared";
import { AppError } from "../common/errors/app-error";
import { AuthGuard } from "../auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("matches")
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Post("queue")
  enqueue(@Body() body: unknown) {
    const parsed = queueSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid queue payload", 422, parsed.error.flatten());
    }
    return this.matching.enqueue(parsed.data.rating);
  }

  @Delete("queue/:queueId")
  cancel(@Param("queueId") queueId: string) {
    this.matching.cancel(queueId);
    return { cancelled: true };
  }
}
