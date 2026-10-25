import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Caption1,
  Text,
  Title1,
  Title3,
  mergeClasses,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { LockClosedRegular, PlayRegular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { GameSummary } from "@simsimplay/shared";

const useStyles = makeStyles({
  hero: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "16px",
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
  lockedCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  lockedPreview: {
    backgroundColor: tokens.colorNeutralBackground3,
    filter: "grayscale(1)",
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
        <Title1 as="h1" style={{ color: "inherit", margin: 0 }}>
          심심할 때, 짧고 굵게 한 판
        </Title1>
        <Button appearance="primary" icon={<PlayRegular />} onClick={() => navigate("/omok")}>
          오목 바로 시작
        </Button>
      </section>

      <Title3 as="h2" style={{ marginBottom: "12px" }}>
        게임 목록
      </Title3>
      <div className={styles.grid}>
        {(games ?? []).map((game) => (
          <Card key={game.id} className={game.status === "locked" ? styles.lockedCard : undefined}>
            <CardPreview className={mergeClasses(styles.preview, game.status === "locked" && styles.lockedPreview)}>
              {game.id === "omok" ? "⚫⚪" : game.id === "chess" ? "♟" : "❓"}
            </CardPreview>
            <CardHeader
              header={(
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", width: "100%" }}>
                  <Text weight="semibold">{game.name}</Text>
                  {game.status === "available" ? (
                    <Badge appearance="filled" color="success" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                      플레이 가능
                    </Badge>
                  ) : (
                    <Badge appearance="filled" color="informative" icon={<LockClosedRegular />} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                      잠금
                    </Badge>
                  )}
                </div>
              )}
              description={<Caption1>{game.modes.join(" · ")}</Caption1>}
            />
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
