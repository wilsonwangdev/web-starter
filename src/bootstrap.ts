import { showStartupError } from "./startup-recovery.ts";

// 应用到达后立即启动；失败时保留 HTML 已提供的可恢复界面。
void import("./main.tsx").catch((error: unknown) => {
  console.error("The application could not start.", error);
  showStartupError();
});
