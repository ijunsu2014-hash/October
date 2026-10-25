import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Tab, TabList, Subtitle1, Text, makeStyles, tokens } from "@fluentui/react-components";
import { useAuth } from "../auth/AuthProvider";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  nav: {
    padding: "0 24px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  main: {
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
});

export function AppShell() {
  const styles = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthPage = location.pathname === "/auth";

  return (
    <div>
      {!isAuthPage && (
        <header className={styles.header}>
          <Subtitle1>심심풀이</Subtitle1>
          <div className={styles.actions}>
            {user ? (
              <>
                <Avatar name={user.nickname} color="colorful" />
                <Text>{user.nickname}</Text>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    logout();
                    navigate("/auth?mode=login");
                  }}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button appearance="subtle" onClick={() => navigate("/auth?mode=login")}>로그인</Button>
                <Button appearance="primary" onClick={() => navigate("/auth?mode=signup")}>회원가입</Button>
              </>
            )}
          </div>
        </header>
      )}
      {!isAuthPage && <nav className={styles.nav}>
        <TabList
          selectedValue={location.pathname === "/lobby" ? "/" : location.pathname}
          onTabSelect={(_, data) => navigate(String(data.value))}
        >
          <Tab value="/">
            로비
          </Tab>
          <Tab value="/profile">
            프로필
          </Tab>
          <Tab value="/settings">
            설정
          </Tab>
        </TabList>
      </nav>}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
