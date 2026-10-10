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
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { OmokGameState } from "@simsimplay/shared";
import { api } from "../api";

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "24px",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(15, 1fr)",
    gap: "2px",
    backgroundColor: tokens.colorNeutralStroke1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "4px",
  },
  cell: {
    aspectRatio: "1 / 1",
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  stone: {
    width: "78%",
    height: "78%",
    borderRadius: "50%",
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
          {game.board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={styles.cell}
                onClick={() => handleCellClick(r, c)}
                aria-label={`row ${r + 1} column ${c + 1}`}
              >
                {cell !== 0 && (
                  <span
                    className={styles.stone}
                    style={{ backgroundColor: cell === 1 ? "#173B3A" : "#F7F4ED", border: `1px solid ${tokens.colorNeutralStroke1}` }}
                  />
                )}
              </button>
            )),
          )}
        </div>
      </div>
      <div>
        <Card>
          <CardHeader header={<Text weight="semibold">현재 대국</Text>} />
          <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <Caption1>상대: AI 중급 · 흑돌</Caption1>
            <Caption1>내 돌: 백돌</Caption1>
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
