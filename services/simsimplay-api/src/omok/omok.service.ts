import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { applyMove, checkWinner, createEmptyBoard, pickAiMove } from "./omok.engine";
import { AppError } from "../common/errors/app-error";
import type { OmokGameState } from "@simsimplay/shared";

@Injectable()
export class OmokService {
  // In-memory store; Redis/Postgres wiring happens during integration.
  private games = new Map<string, OmokGameState>();

  createAiGame(): OmokGameState {
    const game: OmokGameState = {
      gameId: randomUUID(),
      board: createEmptyBoard(),
      nextTurn: 1,
      status: "in_progress",
    };
    this.games.set(game.gameId, game);
    return game;
  }

  getGame(gameId: string): OmokGameState {
    const game = this.games.get(gameId);
    if (!game) throw new AppError("NOT_FOUND", "Game not found", 404);
    return game;
  }

  applyPlayerMove(gameId: string, row: number, column: number): OmokGameState {
    const game = this.getGame(gameId);
    if (game.status !== "in_progress") {
      throw new AppError("CONFLICT", "Game has already ended", 409);
    }
    const player = game.nextTurn;
    const board = applyMove(game.board, row, column, player);
    const won = checkWinner(board, row, column, player);
    let next: OmokGameState = { ...game, board, nextTurn: player === 1 ? 2 : 1 };

    if (won) {
      next = { ...next, status: "won", winner: player };
    } else if (board.every((r) => r.every((cell) => cell !== 0))) {
      next = { ...next, status: "draw" };
    } else if (next.nextTurn === 2) {
      const ai = pickAiMove(board);
      const aiBoard = applyMove(board, ai.row, ai.column, 2);
      const aiWon = checkWinner(aiBoard, ai.row, ai.column, 2);
      next = {
        ...next,
        board: aiBoard,
        nextTurn: 1,
        status: aiWon ? "won" : next.status,
        winner: aiWon ? 2 : undefined,
      };
    }

    this.games.set(gameId, next);
    return next;
  }
}
