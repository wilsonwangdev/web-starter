import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router";
import App from "./App";
import { AppProviders } from "./preferences/Providers";
import { InstallProvider } from "./pwa/InstallProvider";
import { InstallSettings } from "./pwa/InstallSettings";
import "./index.css";
import { showStartupError } from "./startup-recovery.ts";

const pagesMode = import.meta.env.MODE === "pages";
const createRouter = pagesMode ? createHashRouter : createBrowserRouter;
const router = createRouter([{ path: "*", element: <App extraSettings={<InstallSettings />} /> }], {
  basename: pagesMode ? "/" : import.meta.env.BASE_URL,
});
const root = document.getElementById("root");
if (!root) throw new Error("The application root is missing.");
createRoot(root, {
  onUncaughtError: (error) => {
    console.error("The application stopped unexpectedly.", error);
    showStartupError();
  },
}).render(
  <StrictMode>
    <AppProviders>
      <InstallProvider>
        <RouterProvider router={router} />
      </InstallProvider>
    </AppProviders>
  </StrictMode>,
);
