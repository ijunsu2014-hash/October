import { useEffect, useState } from "react";
import {
  Badge,
  Body1,
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Caption1,
  Text,
  Title1,
  Title3,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { PlayRegular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { GameSummary } from "@simsimplay/shared";

const useStyles = makeStyles({
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: tokens.borderRadiusXLarge,
    padding: "40px",
    marginBottom: "24px",
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground}, #E76F51)`,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: "12px",
    opacity: 0.9,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
  },
  preview: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },
});

export function LobbyPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameSummary[] | null>(null);

  useEffect(() => {
    api.getGames().then(setGames);
  }, []);

  return (
    <div>
      <section className={styles.hero}>
        <svg
          aria-hidden="true"
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }}
        >
          <defs>
            <radialGradient id="heroGlow" cx="100%" cy="0%" r="80%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="400" fill="url(#heroGlow)" />
        </svg>
        <div className={styles.eyebrow}>• 오늘의 추천</div>
        <Title1 as="h1" style={{ color: "inherit" }}>
          심심할 때, 짧고 굵게 한 판
        </Title1>
        <Body1 style={{ color: "inherit", opacity: 0.92, maxWidth: "60ch", display: "block", marginTop: "8px" }}>
          오목 AI 대전과 온라인 1:1 매칭을 바로 즐겨보세요.
        </Body1>
        <Button appearance="primary" icon={<PlayRegular />} style={{ marginTop: "16px" }} onClick={() => navigate("/omok")}>
          오목 바로 시작
        </Button>
      </section>

      <Title3 as="h2" style={{ marginBottom: "12px" }}>
        게임 목록
      </Title3>
      <div className={styles.grid}>
        {(games ?? []).map((game) => (
          <Card key={game.id}>
            <CardPreview className={styles.preview}>{game.id === "omok" ? "⚫⚪" : game.id === "chess" ? "♟" : "❓"}</CardPreview>
            <CardHeader
              header={<Text weight="semibold">{game.name}</Text>}
              description={<Caption1>{game.modes.join(" · ")}</Caption1>}
              action={<Badge appearance={game.status === "available" ? "filled" : "outline"} color={game.status === "available" ? "success" : "informative"}>{game.status === "available" ? "플레이 가능" : "잠금"}</Badge>}
            />
            <Body1 style={{ padding: "0 12px 12px" }}>{game.description}</Body1>
            <CardFooter>
              <Button appearance={game.status === "available" ? "primary" : "secondary"} disabled={game.status !== "available"} onClick={() => navigate(`/${game.id}`)}>
                {game.status === "available" ? "플레이" : "준비 중"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
