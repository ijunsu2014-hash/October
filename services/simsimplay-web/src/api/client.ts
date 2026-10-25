import type {
  ApiError,
  GameSummary,
  HealthResponse,
  LoginResponse,
  MatchRecord,
  OmokGameState,
  Profile,
  User,
} from "@simsimplay/shared";
import type { ApiClient } from "./ApiClient";

interface GamesResponse {
  games: GameSummary[];
}

interface ProfileResponse {
  profile: Profile;
}

interface MatchesResponse {
  matches: MatchRecord[];
}

interface MoveResponse {
  game: OmokGameState;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const tokenStorageKey = "simsimplay.auth-token";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem(tokenStorageKey);
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiBaseUrl}/api${path}`, { ...init, headers });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(body?.error?.message ?? `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export const liveClient: ApiClient = {
  async login(email, password): Promise<LoginResponse> {
    const result = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    window.localStorage.setItem(tokenStorageKey, result.session.token);
    return result;
  },
  async register(email, password, nickname): Promise<User> {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, nickname }),
    });
  },
  logout(): void {
    window.localStorage.removeItem(tokenStorageKey);
  },
  async getCurrentUser(): Promise<User | null> {
    if (!window.localStorage.getItem(tokenStorageKey)) return null;
    return request<User>("/auth/me");
  },
  async getGames(): Promise<GameSummary[]> {
    const result = await request<GamesResponse>("/games");
    return result.games;
  },
  async createOmokGame(): Promise<OmokGameState> {
    return request<OmokGameState>("/omok/games", { method: "POST" });
  },
  async submitOmokMove(gameId, row, column): Promise<OmokGameState> {
    const result = await request<MoveResponse>(`/omok/games/${gameId}/moves`, {
      method: "POST",
      body: JSON.stringify({ row, column }),
    });
    return result.game;
  },
  async getProfile(): Promise<Profile> {
    const result = await request<ProfileResponse>("/users/me/profile");
    return result.profile;
  },
  async getRecentMatches(): Promise<MatchRecord[]> {
    const result = await request<MatchesResponse>("/users/me/matches");
    return result.matches;
  },
  async getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>("/health");
  },
};