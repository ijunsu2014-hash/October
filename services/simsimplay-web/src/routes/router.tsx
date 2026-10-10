import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { LobbyPage } from "../pages/LobbyPage";
import { OmokPage } from "../pages/OmokPage";
import { ProfilePage } from "../pages/ProfilePage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LobbyPage /> },
      { path: "/omok", element: <OmokPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
]);
