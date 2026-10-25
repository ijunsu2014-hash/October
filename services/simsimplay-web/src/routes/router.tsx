import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { LobbyPage } from "../pages/LobbyPage";
import { OmokPage } from "../pages/OmokPage";
import { ProfilePage } from "../pages/ProfilePage";
import { AuthPage } from "../pages/AuthPage";
import { SettingsPage } from "../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <LobbyPage /> },
      { path: "/lobby", element: <LobbyPage /> },
      { path: "/omok", element: <OmokPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
