import { useCallback, useEffect, useMemo, useState } from "react";

const ENABLED_KEY = "amangninou.dailyFezanNotifications.enabled.v1";
const LAST_SENT_KEY = "amangninou.dailyFezanNotifications.lastSent.v1";

const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000";
  }

  const { hostname, protocol } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://127.0.0.1:8000";
  }

  if (hostname.endsWith("github.io")) {
    return "";
  }

  return `${protocol}//${hostname}:8000`;
};

const todayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
};

const readBoolean = (key) => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(key) === "true";
};

const writeBoolean = (key, value) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value ? "true" : "false");
  }
};

const showNotification = async (payload) => {
  const options = {
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: `amangninou-fezan-${payload.date}`,
    renotify: false,
    data: {
      url: "/#ia",
      whatsappUrl: payload.whatsapp_url,
    },
  };

  if (navigator.serviceWorker?.getRegistration) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.showNotification) {
      await registration.showNotification(payload.title, options);
      return;
    }
  }

  if (navigator.serviceWorker?.ready && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, options);
    return;
  }

  new Notification(payload.title, options);
};

export function useDailyFezanNotifications() {
  const apiBaseUrl = useMemo(getApiBaseUrl, []);
  const isSupported = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState(() =>
    isSupported ? Notification.permission : "unsupported",
  );
  const [isEnabled, setIsEnabled] = useState(() => readBoolean(ENABLED_KEY));

  const sendDailyNotification = useCallback(
    async ({ force = false } = {}) => {
      if (!isSupported || permission !== "granted" || !isEnabled || !apiBaseUrl) {
        return false;
      }

      const key = todayKey();
      if (!force && window.localStorage.getItem(LAST_SENT_KEY) === key) {
        return false;
      }

      const response = await fetch(`${apiBaseUrl}/api/ai/today`);
      if (!response.ok) {
        return false;
      }

      const payload = await response.json();
      if (!payload.ok) {
        return false;
      }

      await showNotification(payload);
      window.localStorage.setItem(LAST_SENT_KEY, key);
      return true;
    },
    [apiBaseUrl, isEnabled, isSupported, permission],
  );

  const enable = useCallback(async () => {
    if (!isSupported) {
      setPermission("unsupported");
      return false;
    }

    let nextPermission = Notification.permission;
    if (nextPermission === "default") {
      nextPermission = await Notification.requestPermission();
    }

    setPermission(nextPermission);

    if (nextPermission !== "granted") {
      writeBoolean(ENABLED_KEY, false);
      setIsEnabled(false);
      return false;
    }

    writeBoolean(ENABLED_KEY, true);
    setIsEnabled(true);
    window.localStorage.removeItem(LAST_SENT_KEY);
    return true;
  }, [isSupported]);

  const disable = useCallback(() => {
    writeBoolean(ENABLED_KEY, false);
    setIsEnabled(false);
  }, []);

  useEffect(() => {
    if (!isEnabled || permission !== "granted") {
      return undefined;
    }

    sendDailyNotification();

    const interval = window.setInterval(() => {
      sendDailyNotification();
    }, 30 * 60 * 1000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sendDailyNotification();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isEnabled, permission, sendDailyNotification]);

  return {
    disable,
    enable,
    isEnabled,
    isSupported,
    permission,
    sendDailyNotification,
  };
}
