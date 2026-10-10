# Project Plan

**Status**: Integrated
**Created**: 2026-10-10
**Mode**: NEW

---

## 1. Project Overview

**Goal**: 심심할 때 짧게 즐기는 캐주얼 미니게임 서비스 '심심풀이'의 MVP를 구축한다. 오목 AI 대전과 온라인 1:1 대전을 먼저 제공하고, 로그인 사용자의 프로필과 전적을 기록한다. 모든 모듈은 독립적으로 테스트 가능하도록 설계한다.

**App Type**: SPA + API

**API Login**: Yes

**Mode**: NEW

**Deployment Plan**: No deployment plan found

---

## 2. Backend — Game API & Realtime Server

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript |
| **Runtime** | Node |
| **Package Manager** | npm |
| **Test Runner** | vitest |
| **Mocking Library** | vi.mock |
| **Test Command** | npm test |
| **Orchestration** | docker-compose |

NestJS 모듈을 `auth`, `omok`, `matching`, `profile`, `health`로 분리한다. REST API는 계정·전적·매칭을 담당하고 Socket.IO는 온라인 대전 룸의 서버 권위 상태를 전달한다. 오목 룰 검증과 Minimax + Alpha-Beta AI는 독립 도메인 서비스로 두며, 클라이언트는 수 입력만 전송한다. Redis는 매칭 큐와 진행 중인 룸 상태를 담당하고 PostgreSQL은 사용자·대국·수순·레이팅을 영속화한다.

## 3. Frontend — Web App

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript |
| **Framework** | React + Vite |
| **Package Manager** | npm |
| **Test Runner** | vitest |
| **Mocking Library** | vi.mock |
| **Test Command** | npm test |

React Router로 로비, 오목 대전, 프로필 화면을 나누고 `@fluentui/react-components`의 Button, Card, Badge, TabList, MessageBar, Avatar, Toolbar primitives를 사용한다. API 클라이언트와 Socket.IO 이벤트 타입은 shared 패키지에서 공유한다.

## 4. Services Required

| Azure Service | Role in App | Environment Variable | Default Value (Local) | Classification |
|---------------|------------|---------------------|----------------------|----------------|
| Azure Static Web Apps | React SPA 호스팅 및 정적 자산 배포 | `VITE_API_BASE_URL` | `http://localhost:3000` | Essential |
| Azure Container Apps | NestJS REST/WebSocket 서버 실행 | `PORT` | `3000` | Essential |
| Azure Database for PostgreSQL Flexible Server | 사용자, 오목 대국, 수순, 전적과 레이팅 저장 | `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/simsimplay` | Essential |
| Azure Cache for Redis | 매칭 큐, 온라인 룸 상태, 재접속 세션 캐시 | `REDIS_URL` | `redis://localhost:6379` | Essential |

## 5. Prerequisites

### Run

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| Node.js | * | ✅ | v24.15.0 |
| npm | * | ✅ | 11.12.1 |
| Docker Engine | backend, frontend | ✅ | 29.4.3 |
| Docker Compose | backend, frontend | ✅ | v5.1.3 |
| Git | * | ✅ | 2.53.0.windows.3 |

### Debug

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| VS Code | * | ✅ | 1.140.0 |
| Docker extension (`ms-azuretools.vscode-docker`) | backend, frontend | ❓ | Unknown |
| Azure Static Web Apps extension (`ms-azuretools.vscode-azurestaticwebapps`) | frontend | ❓ | Unknown |

설치 여부가 `❓`인 도구는 스캐너가 확인하지 못했으므로 scaffold 전에 확인해야 한다.

## 6. Design System & UI

**Component Library**: Fluent UI v9
**Style Direction**: 바둑판의 선과 돌에서 착안한 따뜻한 청록색 기반의 게임 라운지. 크림색 종이 질감의 밝은 표면, 짙은 잉크 텍스트, 산호색 액센트로 플레이 상태와 CTA를 선명하게 구분하며, 카드 모서리는 8px 이하로 절제한다.
**Typography**: Segoe UI Variable, Segoe UI

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0F766E` | 로비 활성 메뉴, 오목 시작 버튼, 선택된 게임 상태 |
| `accent` | `#E76F51` | 매칭 CTA, 승패 변화, 중요한 알림 강조 |
| `surface` | `#F7F4ED` | 게임 라운지의 기본 배경 |
| `text` | `#173B3A` | 로비·대전·프로필의 본문과 제목 |
| `muted` | `#6B7C78` | 보조 설명, 시간, 상대 상태 |
| `border` | `#D8DED6` | 카드, 입력, 보드 주변 구분선 |

### Pages

| Page | Route | Purpose | Layout |
|------|-------|---------|--------|
| 게임 로비 | `/` | 오늘의 게임과 빠른 시작 옵션을 보여준다 | `header, nav, hero, grid, card-list, footer` |
| 오목 대전 | `/omok` | AI 또는 온라인 상대와 15x15 오목을 플레이한다 | `header, nav, main, sidebar, two-column(board+actions), tabs` |
| 프로필과 전적 | `/profile` | 사용자 레이팅, 최근 대국, 승률을 확인한다 | `header, nav, main, two-column(card-list+table), action-bar` |

### Sample Content

게임 로비 — 게임 카드:
| 게임 | 모드 | 상태 | 설명 |
| 오목 | AI 대전 · 온라인 1:1 | 플레이 가능 | 15x15 보드에서 다음 수를 읽어보세요 |
| 체스 | 준비 중 | 잠금 | Stockfish 기반 대전은 다음 업데이트에서 공개 |
| 퀴즈 | 준비 중 | 잠금 | 짧은 지식 대결 모듈을 준비 중 |

오목 대전 — 현재 대국:
| 항목 | 값 | 상태 |
| 상대 | AI 중급 · 흑돌 | 진행 중 |
| 내 돌 | 백돌 | 차례 대기 |
| 최근 수 | H8 → H9 | 서버 동기화 완료 |
| 경과 시간 | 04:18 | 안정적 |

프로필과 전적 — 전적:
| 상대 | 모드 | 결과 | 레이팅 변화 |
| AI 중급 | 오목 AI | 승리 | +18 |
| 박서준 | 온라인 1:1 | 승리 | +24 |
| 김하늘 | 온라인 1:1 | 패배 | -16 |

## 7. Project Structure

```
project-root/
├── .azure/
│   ├── project-plan.md
│   └── .preview-temp/
├── package.json
├── docker-compose.yml
├── .env.example
├── services/
│   ├── simsimplay-api/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── omok/
│   │   │   ├── matching/
│   │   │   ├── profile/
│   │   │   ├── health/
│   │   │   ├── realtime/
│   │   │   └── main.ts
│   │   └── tests/
│   ├── simsimplay-web/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── game/
│   │   │   └── routes/
│   │   └── vite.config.ts
│   └── shared/
│       ├── types/
│       └── schemas/
└── infra/
    └── migrations/
```

## 8. Route Definitions

| # | Method | Path | Description | Request Body | Response Body | Status Codes |
|---|--------|------|-------------|-------------|--------------|--------------|
| 1 | GET | `/api/health` | API, PostgreSQL, Redis 상태 확인 | — | `{ status, services }` | 200, 503 |
| 2 | POST | `/api/auth/login` | 로그인 세션 생성 | `{ email, password }` | `{ user, session }` | 200, 401, 422 |
| 3 | GET | `/api/games` | 로비 게임 목록과 이용 가능 상태 조회 | — | `{ games }` | 200 |
| 4 | POST | `/api/matches/queue` | 오목 온라인 매칭 큐 등록 | `{ gameType, rating }` | `{ queueId, status }` | 201, 409, 422 |
| 5 | DELETE | `/api/matches/queue/:queueId` | 대기 중인 매칭 취소 | — | `{ cancelled }` | 200, 404 |
| 6 | POST | `/api/omok/games/:gameId/moves` | 서버 검증 후 오목 수 적용 | `{ row, column }` | `{ game, move, nextTurn }` | 200, 409, 422 |
| 7 | GET | `/api/users/me/profile` | 내 프로필과 레이팅 조회 | — | `{ profile, ratings }` | 200, 401 |
| 8 | GET | `/api/users/me/matches` | 최근 오목 전적 조회 | `?limit=20` | `{ matches }` | 200, 401 |
| 9 | WS | `/socket.io` | 매칭 룸 생성, 수 동기화, 재접속 처리 | `{ roomId, event, payload }` | `{ event, payload }` | 101, 400, 409 |

모든 REST 오류는 `{ error: { code, message, details } }` 형식을 따른다.

## 9. Next Steps

1. Run **azure-project-scaffold** to execute this plan
2. Run **azure-project-integrate** to wire the frontend to live data, smoke-test the backend, and create the migrations
3. Run **azure-debug-plan** → **azure-debug-generate** for Docker emulators and VS Code debugging
4. Run the **azure-deploy** agent when ready; it uses **azure-app-onboard** for architecture, cost estimation, IaC generation, provisioning, and health verification
