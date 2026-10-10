import type {
  GameSummary,
  HealthResponse,
  LoginResponse,
  MatchRecord,
  OmokGameState,
  Profile,
  User,
} from "@simsimplay/shared";

export interface ApiClient {
  login(email: string, password: string): Promise<LoginResponse>;
  getCurrentUser(): Promise<User | null>;
  getGames(): Promise<GameSummary[]>;
  createOmokGame(): Promise<OmokGameState>;
  submitOmokMove(gameId: string, row: number, column: number): Promise<OmokGameState>;
  getProfile(): Promise<Profile>;
  getRecentMatches(): Promise<MatchRecord[]>;
  getHealth(): Promise<HealthResponse>;
}
