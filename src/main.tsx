import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import { AppProviders } from "./preferences/Providers";
import { InstallProvider } from "./pwa/InstallProvider";
import { InstallSettings } from "./pwa/InstallSettings";
import "./index.css";

const router = createBrowserRouter([
  { path: "*", element: <App extraSettings={<InstallSettings />} /> },
]);
const root = document.getElementById("root");
if (!root) throw new Error("The application root is missing.");
createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <InstallProvider>
        <RouterProvider router={router} />
      </InstallProvider>
    </AppProviders>
  </StrictMode>,
);
