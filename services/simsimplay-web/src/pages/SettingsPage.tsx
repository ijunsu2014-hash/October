import {
  Button,
  Divider,
  Switch,
  Text,
  Title2,
  makeStyles,
} from "@fluentui/react-components";
import { SignOutRegular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useThemeMode } from "../theme/ThemeModeProvider";

const useStyles = makeStyles({
  page: {
    display: "grid",
    gap: "24px",
    maxWidth: "720px",
  },
  section: {
    display: "grid",
    gap: "16px",
    padding: "4px 0 20px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
});

export function SettingsPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, setMode } = useThemeMode();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className={styles.page}>
      <Title2 as="h1">설정</Title2>
      <section className={styles.section} aria-labelledby="appearance-heading">
        <Text id="appearance-heading" weight="semibold">화면</Text>
        <div className={styles.row}>
          <Text>다크 모드</Text>
          <Switch
            checked={mode === "dark"}
            onChange={(_, data) => setMode(data.checked ? "dark" : "light")}
            aria-label="다크 모드"
          />
        </div>
      </section>
      <Divider />
      <section className={styles.section} aria-labelledby="account-heading">
        <Text id="account-heading" weight="semibold">계정</Text>
        {user ? (
          <div className={styles.row}>
            <Text>{user.nickname}</Text>
            <Button appearance="secondary" icon={<SignOutRegular />} onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        ) : (
          <Button appearance="secondary" onClick={() => navigate("/auth?mode=login")}>
            로그인
          </Button>
        )}
      </section>
    </div>
  );
}