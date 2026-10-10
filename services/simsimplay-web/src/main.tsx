import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider } from "@fluentui/react-components";
import { RouterProvider } from "react-router-dom";
import { simsimplayTheme } from "./theme";
import { router } from "./routes/router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FluentProvider theme={simsimplayTheme} style={{ minHeight: "100vh" }}>
      <RouterProvider router={router} />
    </FluentProvider>
  </StrictMode>,
);
