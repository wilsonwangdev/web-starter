interface StartupCopy {
  loading: string;
  title: string;
  description: string;
  reload: string;
}

// 同时供 HTML 的入口失败处理和已下载应用的未捕获错误复用。
export function showStartupError() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showStartupError, { once: true });
    return;
  }
  document.getElementById("root")?.setAttribute("hidden", "");
  document.querySelector("[data-startup-error]")?.removeAttribute("hidden");
}

// 构建时写入 HTML，不能依赖随后才会下载的应用模块。
export function installStartupRecovery(
  showError: () => void,
  copies: { "zh-CN": StartupCopy; en: StartupCopy },
  preferenceKey: string,
  defaultLocale: string,
) {
  let locale = navigator.languages.find((value) => /^(zh|en)(?:-|$)/i.test(value)) ?? defaultLocale;
  try {
    const raw = localStorage.getItem(preferenceKey);
    const saved: unknown = raw ? JSON.parse(raw) : undefined;
    if (
      typeof saved === "object" &&
      saved !== null &&
      "version" in saved &&
      saved.version === 1 &&
      "locale" in saved &&
      (saved.locale === "en" || saved.locale === "zh-CN")
    )
      locale = saved.locale;
  } catch {
    // 存储无法读取时，仍可按浏览器语言提供恢复入口。
  }
  const language = locale.toLowerCase().startsWith("en") ? "en" : "zh-CN";
  const copy = copies[language];
  document.documentElement.lang = language;
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      document.querySelector("[data-startup-shell]")?.setAttribute("aria-label", copy.loading);
      const fields = [
        ["[data-startup-error-title]", copy.title],
        ["[data-startup-error-description]", copy.description],
        ["[data-startup-reload]", copy.reload],
      ];
      for (const [selector, text] of fields) {
        if (!selector || !text) continue;
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
      }
      const reload = document.querySelector("[data-startup-reload]");
      if (reload instanceof HTMLButtonElement)
        reload.addEventListener("click", () => location.reload());
    },
    { once: true },
  );
  window.addEventListener(
    "error",
    (event) => {
      if (event.target instanceof HTMLScriptElement && event.target.type === "module") showError();
    },
    true,
  );
}
