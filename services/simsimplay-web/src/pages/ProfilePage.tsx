import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title3,
} from "@fluentui/react-components";
import type { MatchRecord, Profile } from "@simsimplay/shared";
import { api } from "../api";

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  useEffect(() => {
    api.getProfile().then(setProfile);
    api.getRecentMatches().then(setMatches);
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
      <Card>
        <CardHeader
          image={<Avatar name={profile?.nickname ?? "플레이어"} size={56} />}
          header={<Text weight="semibold">{profile?.nickname ?? "불러오는 중..."}</Text>}
          description={<Badge appearance="filled" color="brand">레이팅 {profile?.rating ?? "-"}</Badge>}
        />
      </Card>
      <div>
        <Title3 as="h1" style={{ marginBottom: "12px" }}>
          최근 전적
        </Title3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>상대</TableHeaderCell>
              <TableHeaderCell>모드</TableHeaderCell>
              <TableHeaderCell>결과</TableHeaderCell>
              <TableHeaderCell>레이팅 변화</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match, index) => (
              <TableRow key={index}>
                <TableCell>{match.opponent}</TableCell>
                <TableCell>{match.mode}</TableCell>
                <TableCell>
                  <Badge color={match.result === "win" ? "success" : "danger"}>{match.result === "win" ? "승리" : "패배"}</Badge>
                </TableCell>
                <TableCell>{match.ratingChange > 0 ? `+${match.ratingChange}` : match.ratingChange}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
