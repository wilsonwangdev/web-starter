// 由构建工具放入 HTML 头部，保持自包含；运行期切换交给主题库。
export function initializeAppearance(storageKey: string) {
  let mode = "system";
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") mode = saved;
    else if (saved !== null && saved !== "system") localStorage.setItem(storageKey, "system");
  } catch {
    // 存储不可用时仍能按系统外观打开页面。
  }
  const resolved =
    mode === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  document.documentElement.dataset.mode = resolved;
  document.documentElement.style.colorScheme = resolved;
}
