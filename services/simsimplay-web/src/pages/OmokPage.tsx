import { useEffect, useState } from "react";
import {
  Button,
  Caption1,
  Card,
  CardHeader,
  MessageBar,
  MessageBarBody,
  Skeleton,
  SkeletonItem,
  Tab,
  TabList,
  Text,
  Title3,
  mergeClasses,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { OmokGameState } from "@simsimplay/shared";
import { api } from "../api";

const REFERENCE_POINTS = [
  { row: 4, column: 4 },
  { row: 4, column: 12 },
  { row: 8, column: 8 },
  { row: 12, column: 4 },
  { row: 12, column: 12 },
] as const;
const BOARD_LINES = Array.from({ length: 15 }, (_, index) =>
  `M${index} 0V14 M0 ${index}H14`,
).join(" ");

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "24px",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  board: {
    position: "relative",
    width: "100%",
    maxWidth: "900px",
    aspectRatio: "1 / 1",
    boxSizing: "border-box",
    overflow: "hidden",
    backgroundColor: "#D2A45F",
    backgroundImage: "repeating-linear-gradient(3deg, rgba(107, 70, 31, 0.035) 0 2px, transparent 2px 9px), linear-gradient(145deg, #E4C589 0%, #D8AE6C 48%, #C8914D 100%)",
    border: "1px solid #9A6B36",
    borderRadius: "8px",
    boxShadow: "0 12px 28px rgba(68, 45, 19, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.55)",
  },
  gridLines: {
    position: "absolute",
    left: "4%",
    top: "4%",
    width: "92%",
    height: "92%",
    overflow: "visible",
    pointerEvents: "none",
  },
  cell: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "7%",
    height: "7%",
    transform: "translate(-50%, -50%)",
    padding: 0,
    border: 0,
    backgroundColor: "transparent",
    zIndex: 1,
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(255, 248, 226, 0.16)",
    },
    ":focus-visible": {
      zIndex: 1,
      outline: "2px solid #0F766E",
      outlineOffset: "-2px",
    },
  },
  stone: {
    display: "block",
    width: "74%",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  blackStone: {
    background: "radial-gradient(circle at 32% 27%, #656763 0%, #292B29 35%, #111312 76%, #050606 100%)",
    border: "1px solid #090A09",
    boxShadow: "0 2px 4px rgba(23, 18, 13, 0.58), inset 0 1px 2px rgba(255, 255, 255, 0.23)",
  },
  whiteStone: {
    background: "radial-gradient(circle at 32% 27%, #FFFFFF 0%, #F8F5E9 48%, #D9D4C5 100%)",
    border: "1px solid #AAA493",
    boxShadow: "0 2px 4px rgba(66, 52, 35, 0.38), inset 0 1px 2px rgba(255, 255, 255, 0.95)",
  },
});

export function OmokPage() {
  const styles = useStyles();
  const [game, setGame] = useState<OmokGameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .createOmokGame()
      .then(setGame)
      .catch(() => setError("게임을 불러오지 못했습니다."));
  }, []);

  async function handleCellClick(row: number, column: number) {
    if (!game || game.status !== "in_progress" || game.board[row][column] !== 0) return;
    try {
      const next = await api.submitOmokMove(game.gameId, row, column);
      setGame(next);
    } catch {
      setError("수를 적용하지 못했습니다.");
    }
  }

  if (error) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>{error}</MessageBarBody>
      </MessageBar>
    );
  }

  if (!game) {
    return (
      <Skeleton>
        <SkeletonItem style={{ height: "480px" }} />
      </Skeleton>
    );
  }

  return (
    <div className={styles.layout}>
      <div>
        <Title3 as="h1" style={{ marginBottom: "12px" }}>
          오목 대전
        </Title3>
        <div className={styles.board}>
          <svg className={styles.gridLines} viewBox="0 0 14 14" aria-hidden="true">
            <path d={BOARD_LINES} fill="none" stroke="rgba(94, 61, 28, 0.68)" strokeWidth="0.025" />
            {REFERENCE_POINTS.map(({ row, column }) => (
              <circle key={`${row}-${column}`} cx={column - 1} cy={row - 1} r="0.085" fill="#684A29" />
            ))}
          </svg>
          {game.board.map((row, r) =>
            row.map((cell, c) => {
              const isStarPoint = REFERENCE_POINTS.some(({ row, column }) => row === r + 1 && column === c + 1);
              return (
                <button
                  key={`${r}-${c}`}
                  className={styles.cell}
                  style={{ left: `${4 + (c / 14) * 92}%`, top: `${4 + (r / 14) * 92}%` }}
                  onClick={() => handleCellClick(r, c)}
                  aria-label={`${r + 1}행 ${c + 1}열${cell === 0 ? isStarPoint ? ", 화점" : "" : cell === 1 ? ", 흑돌" : ", 백돌"}`}
                >
                  {cell !== 0 && (
                    <span className={mergeClasses(styles.stone, cell === 1 ? styles.blackStone : styles.whiteStone)} />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <div>
        <Card>
          <CardHeader header={<Text weight="semibold">현재 대국</Text>} />
          <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <Caption1>상대: AI · 백돌</Caption1>
            <Caption1>내 돌: 흑돌</Caption1>
            <Caption1>
              상태:{" "}
              {game.status === "in_progress" ? "진행 중" : game.status === "won" ? (game.winner === 2 ? "AI 승리" : "승리") : "무승부"}
            </Caption1>
          </div>
        </Card>
        <TabList selectedValue="ai" style={{ marginTop: "16px" }}>
          <Tab value="ai">AI 대전</Tab>
          <Tab value="online">온라인 1:1</Tab>
        </TabList>
        <Button appearance="secondary" style={{ marginTop: "12px" }} onClick={() => api.createOmokGame().then(setGame)}>
          새 게임
        </Button>
      </div>
    </div>
  );
}
