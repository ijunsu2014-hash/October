import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { OmokService } from "./omok.service";
import { omokMoveSchema, uuidSchema } from "@simsimplay/shared";
import { AppError } from "../common/errors/app-error";
import { AuthGuard } from "../auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("omok")
export class OmokController {
  constructor(private readonly omok: OmokService) {}

  @Post("games")
  createGame() {
    return this.omok.createAiGame();
  }

  @Get("games/:gameId")
  getGame(@Param("gameId") gameId: string) {
    const parsed = uuidSchema.safeParse(gameId);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", "Invalid game id", 422);
    return this.omok.getGame(gameId);
  }

  @Post("games/:gameId/moves")
  move(@Param("gameId") gameId: string, @Body() body: unknown) {
    const idCheck = uuidSchema.safeParse(gameId);
    if (!idCheck.success) throw new AppError("VALIDATION_ERROR", "Invalid game id", 422);
    const parsed = omokMoveSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "Invalid move payload", 422, parsed.error.flatten());
    }
    const game = this.omok.applyPlayerMove(gameId, parsed.data.row, parsed.data.column);
    return { game, move: parsed.data, nextTurn: game.nextTurn };
  }
}
