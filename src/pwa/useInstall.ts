import { useContext } from "react";
import { InstallContext } from "./context";

export function useInstall() {
  const value = useContext(InstallContext);
  if (!value) throw new Error("InstallProvider is required.");
  return value;
}
