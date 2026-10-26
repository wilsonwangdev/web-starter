import { createContext } from "react";

export type InstallStatus =
  | "manual"
  | "available"
  | "pending"
  | "requested"
  | "installed"
  | "failed";
export const InstallContext = createContext<{
  status: InstallStatus;
  install: () => Promise<void>;
} | null>(null);
