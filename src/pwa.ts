import { registerSW } from "virtual:pwa-register";

const UPDATE_CHANNEL_NAME = "obra-dinn-pwa-update";
const UPDATE_BROADCAST_MESSAGE = "reload-all-tabs";
const UPDATED_FLAG_KEY = "obra-dinn-pwa-just-updated";
const BANNER_ID = "pwa-update-banner";

const channel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(UPDATE_CHANNEL_NAME)
    : null;

let isReloading = false;

const showBanner = (message: string, durationMs = 2400) => {
  if (typeof document === "undefined") return;

  const existing = document.getElementById(BANNER_ID);
  if (existing) existing.remove();

  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.textContent = message;
  banner.setAttribute("role", "status");
  banner.style.cssText = [
    "position: fixed",
    "top: max(12px, env(safe-area-inset-top))",
    "left: 50%",
    "transform: translateX(-50%) translateY(-8px)",
    "background-color: #ded5bc",
    "background-image: radial-gradient(circle at 18% 22%, rgba(60, 50, 28, 0.1) 0 1.2px, transparent 1.5px), radial-gradient(circle at 78% 64%, rgba(60, 50, 28, 0.08) 0 1px, transparent 1.3px), linear-gradient(180deg, #e7dfc9 0%, #d6ccb1 100%)",
    "color: #2b2518",
    "border: 2px solid #3a3424",
    "outline: 1px solid rgba(58, 52, 36, 0.35)",
    "outline-offset: -4px",
    "border-radius: 2px",
    "padding: 9px 16px 8px",
    "font-size: 13px",
    "font-weight: 600",
    "letter-spacing: 0.03em",
    "text-transform: uppercase",
    "text-shadow: 0 1px 0 rgba(255, 250, 236, 0.7)",
    "line-height: 1.4",
    "z-index: 9999",
    "box-shadow: 0 3px 0 rgba(43, 37, 24, 0.65), 0 10px 24px rgba(0, 0, 0, 0.32)",
    "background-size: 7px 7px, 9px 9px",
    "max-width: min(92vw, 480px)",
    "text-align: center",
    "opacity: 0",
    "transition: opacity 180ms ease, transform 180ms ease",
    "pointer-events: none",
    "font-family: 'Crimson Text', 'Times New Roman', serif",
  ].join(";");

  document.body.appendChild(banner);
  requestAnimationFrame(() => {
    banner.style.opacity = "1";
    banner.style.transform = "translateX(-50%) translateY(0)";
  });

  window.setTimeout(() => {
    banner.style.opacity = "0";
    banner.style.transform = "translateX(-50%) translateY(-8px)";
    window.setTimeout(() => banner.remove(), 220);
  }, durationMs);
};

const markUpdated = () => {
  try {
    sessionStorage.setItem(UPDATED_FLAG_KEY, "1");
  } catch {
    // ignore storage errors
  }
};

const reloadPage = () => {
  if (isReloading) return;
  isReloading = true;
  window.location.reload();
};

channel?.addEventListener("message", (event) => {
  if (event.data === UPDATE_BROADCAST_MESSAGE) {
    markUpdated();
    reloadPage();
  }
});

try {
  if (sessionStorage.getItem(UPDATED_FLAG_KEY) === "1") {
    sessionStorage.removeItem(UPDATED_FLAG_KEY);
    showBanner("日志已更新至最新版本");
  }
} catch {
  // ignore storage errors
}

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(
    swScriptUrl: string | undefined,
    registration: ServiceWorkerRegistration | undefined,
  ) {
    console.info("SW registered:", swScriptUrl);

    // 仅在应用启动时主动检查一次更新。
    void registration?.update();
  },
  onNeedRefresh() {
    console.info("New version found, updating service worker...");
    showBanner("检测到新日志，正在更新...");
    void updateSW(true);
  },
  onOfflineReady() {
    console.info("PWA application ready to work offline");
  },
});

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    markUpdated();
    channel?.postMessage(UPDATE_BROADCAST_MESSAGE);
    reloadPage();
  });
}
