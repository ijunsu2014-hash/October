export type GameType = "omok";

export interface User {
  id: string;
  email: string;
  nickname: string;
}

export interface GameSummary {
  id: string;
  name: string;
  modes: string[];
  status: "available" | "locked";
  description: string;
}

export interface MatchRecord {
  opponent: string;
  mode: string;
  result: "win" | "loss";
  ratingChange: number;
}

export interface Profile {
  userId: string;
  nickname: string;
  rating: number;
}

export interface OmokMove {
  row: number;
  column: number;
}

export interface OmokGameState {
  gameId: string;
  board: (0 | 1 | 2)[][];
  nextTurn: 1 | 2;
  status: "in_progress" | "won" | "draw";
  winner?: 1 | 2;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  session: { token: string; expiresAt: string };
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  services: Record<string, "healthy" | "unhealthy">;
}

export interface QueueRequest {
  gameType: GameType;
  rating: number;
}

export interface QueueResponse {
  queueId: string;
  status: "queued" | "matched";
}
