import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { InstallContext, type InstallStatus } from "./context";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
}
type StandaloneNavigator = Navigator & { standalone?: boolean };

// 安装提示是浏览器提供的一次性能力，仅在用户点击后使用。
function isInstallPrompt(event: Event): event is InstallPromptEvent {
  return "prompt" in event && typeof event.prompt === "function";
}

export function InstallProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<InstallStatus>("manual");
  const prompt = useRef<InstallPromptEvent | null>(null);
  const mounted = useRef(false);
  const installed = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const standalone = matchMedia("(display-mode: standalone)");
    const syncDisplay = () => {
      if (standalone.matches || (navigator as StandaloneNavigator).standalone) {
        installed.current = true;
        prompt.current = null;
        setStatus("installed");
      }
    };
    const onPrompt = (event: Event) => {
      if (!isInstallPrompt(event) || installed.current) return;
      event.preventDefault();
      prompt.current = event;
      setStatus("available");
    };
    const onInstalled = () => {
      installed.current = true;
      prompt.current = null;
      setStatus("installed");
    };
    syncDisplay();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    standalone.addEventListener("change", syncDisplay);
    return () => {
      mounted.current = false;
      prompt.current = null;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      standalone.removeEventListener("change", syncDisplay);
    };
  }, []);

  const install = useCallback(async () => {
    const current = prompt.current;
    if (!current) return;
    prompt.current = null;
    setStatus("pending");
    try {
      const choice = await current.prompt();
      if (mounted.current && !installed.current) {
        setStatus(choice.outcome === "accepted" ? "requested" : "manual");
      }
    } catch {
      if (mounted.current && !installed.current) setStatus("failed");
    }
  }, []);
  const value = useMemo(() => ({ status, install }), [status, install]);
  return <InstallContext.Provider value={value}>{children}</InstallContext.Provider>;
}
