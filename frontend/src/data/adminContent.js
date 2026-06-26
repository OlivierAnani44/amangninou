export const ADMIN_CONTENT_STORAGE_KEY = "amangninou.admin.content.v1";
export const ADMIN_SESSION_STORAGE_KEY = "amangninou.admin.session.v1";
export const ADMIN_UPDATED_EVENT = "amangninou-admin-content-updated";
export const ADMIN_ACCESS_CODE = "amangninou2026";

const isBrowser = () => typeof window !== "undefined";

export const readAdminContent = () => {
  if (!isBrowser()) {
    return {};
  }

  try {
    const value = window.localStorage.getItem(ADMIN_CONTENT_STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

export const writeAdminContent = (content) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ADMIN_CONTENT_STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent(ADMIN_UPDATED_EVENT));
};

export const resetAdminContent = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ADMIN_CONTENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(ADMIN_UPDATED_EVENT));
};

export const hasAdminSession = () => {
  if (!isBrowser()) {
    return false;
  }

  return window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === "active";
};

export const openAdminSession = () => {
  if (isBrowser()) {
    window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "active");
  }
};

export const closeAdminSession = () => {
  if (isBrowser()) {
    window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  }
};
