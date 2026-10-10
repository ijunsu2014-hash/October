import { Controller, Get } from "@nestjs/common";
import type { GameSummary } from "@simsimplay/shared";

@Controller("games")
export class GamesController {
  @Get()
  list(): { games: GameSummary[] } {
    return {
      games: [
        { id: "omok", name: "오목", modes: ["AI 대전", "온라인 1:1"], status: "available", description: "15x15 보드에서 다음 수를 읽어보세요" },
        { id: "chess", name: "체스", modes: ["준비 중"], status: "locked", description: "Stockfish 기반 대전은 다음 업데이트에서 공개" },
        { id: "quiz", name: "퀴즈", modes: ["준비 중"], status: "locked", description: "짧은 지식 대결 모듈을 준비 중" },
      ],
    };
  }
}
