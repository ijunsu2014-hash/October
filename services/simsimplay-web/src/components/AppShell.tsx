import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Tab, TabList, Subtitle1, makeStyles, tokens } from "@fluentui/react-components";
import { AppsRegular, GridRegular, PersonRegular } from "@fluentui/react-icons";

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

  return (
    <div>
      <header className={styles.header}>
        <Subtitle1>심심풀이</Subtitle1>
        <Avatar name="플레이어" color="colorful" />
      </header>
      <nav className={styles.nav}>
        <TabList selectedValue={location.pathname} onTabSelect={(_, data) => navigate(String(data.value))}>
          <Tab value="/" icon={<AppsRegular />}>
            로비
          </Tab>
          <Tab value="/omok" icon={<GridRegular />}>
            오목 대전
          </Tab>
          <Tab value="/profile" icon={<PersonRegular />}>
            프로필
          </Tab>
        </TabList>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
