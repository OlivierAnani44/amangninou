import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_UPDATED_EVENT, readAdminContent } from "../data/adminContent";
import { defaultLanguage, getSiteContent, normalizeLanguage } from "../data/siteContent";

const LANGUAGE_STORAGE_KEY = "amangninou.language";

const isBrowser = () => typeof window !== "undefined";

const getDeviceLanguage = () => {
  if (!isBrowser()) {
    return defaultLanguage;
  }

  const preferredLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  return normalizeLanguage(preferredLanguages.find(Boolean));
};

const getInitialLanguage = () => {
  if (!isBrowser()) {
    return defaultLanguage;
  }

  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage) {
      return normalizeLanguage(savedLanguage);
    }
  } catch {}

  return getDeviceLanguage();
};

export function useLanguagePreference() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [contentRevision, setContentRevision] = useState(0);
  const content = useMemo(
    () => getSiteContent(language, readAdminContent()),
    [language, contentRevision],
  );

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    document.documentElement.lang = language;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {}
  }, [language]);

  useEffect(() => {
    if (!isBrowser()) {
      return undefined;
    }

    const refreshContent = () => setContentRevision((current) => current + 1);

    window.addEventListener(ADMIN_UPDATED_EVENT, refreshContent);
    window.addEventListener("storage", refreshContent);

    return () => {
      window.removeEventListener(ADMIN_UPDATED_EVENT, refreshContent);
      window.removeEventListener("storage", refreshContent);
    };
  }, []);

  const changeLanguage = useCallback((nextLanguage) => {
    setLanguage(normalizeLanguage(nextLanguage));
  }, []);

  return {
    content,
    language,
    changeLanguage,
  };
}
