import { useCallback, useMemo, useState } from "react";

const PROFILE_STORAGE_KEY = "amangninou.profile.v1";
const PROFILE_SESSION_KEY = "amangninou.profile.session.v1";

const defaultMessages = {
  storageUnavailable: "Le stockage du navigateur est indisponible.",
  fullNameRequired: "Le nom complet est obligatoire.",
  contactRequired: "Le contact est obligatoire.",
  invalidEmail: "L'adresse email n'est pas valide.",
  passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères.",
  passwordMismatch: "Les deux mots de passe ne correspondent pas.",
  invalidTwoFactor: "Le code 2FA doit contenir exactement 6 chiffres.",
  actionFailed: "Action impossible pour le moment.",
  accountExists: "Un profil existe déjà sur cet appareil.",
  accountCreated: "Compte créé et connecté.",
  noAccount: "Aucun profil n'existe encore sur cet appareil.",
  invalidLogin: "Contact ou email incorrect.",
  invalidPassword: "Mot de passe incorrect.",
  invalidTwoFactorLogin: "Code 2FA incorrect.",
  loginSuccess: "Connexion réussie.",
  loginToEdit: "Connectez-vous pour modifier le profil.",
  profileUpdated: "Profil mis à jour.",
};

const normalizeToken = (value) =>
  cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const normalizePreferredChannel = (value) => {
  const channel = normalizeToken(value);

  if (channel === "phone" || channel === "telephone" || channel === "telefone") {
    return "phone";
  }

  if (channel === "email") {
    return "email";
  }

  return "whatsapp";
};

export const emptyProfileForm = {
  fullName: "",
  contact: "",
  email: "",
  preferredChannel: "whatsapp",
  remindersEnabled: true,
  updatesEnabled: true,
  promotionsEnabled: false,
  twoFactorEnabled: false,
  twoFactorCode: "",
};

const cleanText = (value) => String(value ?? "").trim();

const normalizeContact = (value) => cleanText(value).replace(/\s+/g, "");

const normalizeEmail = (value) => cleanText(value).toLowerCase();

const normalizeProfileValues = (values) => ({
  fullName: cleanText(values.fullName),
  contact: cleanText(values.contact),
  email: normalizeEmail(values.email),
  preferredChannel: normalizePreferredChannel(values.preferredChannel),
  remindersEnabled: Boolean(values.remindersEnabled),
  updatesEnabled: Boolean(values.updatesEnabled),
  promotionsEnabled: Boolean(values.promotionsEnabled),
  twoFactorEnabled: Boolean(values.twoFactorEnabled),
});

const isBrowser = () => typeof window !== "undefined";

const readJson = (key) => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeJson = (key, value, messages) => {
  if (!isBrowser()) {
    throw new Error(messages.storageUnavailable);
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const readStoredProfile = () => readJson(PROFILE_STORAGE_KEY);

const readSession = () => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(PROFILE_SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeSession = (accountId) => {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    PROFILE_SESSION_KEY,
    JSON.stringify({ accountId, loggedAt: new Date().toISOString() }),
  );
};

const clearSession = () => {
  if (isBrowser()) {
    window.sessionStorage.removeItem(PROFILE_SESSION_KEY);
  }
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const fallbackHash = (value) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fallback-${(hash >>> 0).toString(16)}`;
};

const hashSecret = async (secret, salt) => {
  const value = `${salt}:${secret}`;

  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return fallbackHash(value);
};

const toPublicProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    fullName: profile.fullName,
    contact: profile.contact,
    email: profile.email,
    preferredChannel: normalizePreferredChannel(profile.preferredChannel),
    remindersEnabled: profile.remindersEnabled,
    updatesEnabled: profile.updatesEnabled,
    promotionsEnabled: profile.promotionsEnabled,
    twoFactorEnabled: profile.security?.twoFactorEnabled ?? false,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

const hasValidSession = (profile) => {
  const session = readSession();
  return Boolean(profile?.id && session?.accountId === profile.id);
};

const validateBaseProfile = (values, messages) => {
  if (!values.fullName) {
    throw new Error(messages.fullNameRequired);
  }

  if (!values.contact) {
    throw new Error(messages.contactRequired);
  }

  if (values.email && !values.email.includes("@")) {
    throw new Error(messages.invalidEmail);
  }
};

const validatePassword = (password, confirmation, messages) => {
  if (cleanText(password).length < 6) {
    throw new Error(messages.passwordTooShort);
  }

  if (password !== confirmation) {
    throw new Error(messages.passwordMismatch);
  }
};

const validateTwoFactorCode = (code, messages) => {
  if (!/^\d{6}$/.test(cleanText(code))) {
    throw new Error(messages.invalidTwoFactor);
  }
};

const matchesLoginIdentifier = (profile, identifier) => {
  const loginId = cleanText(identifier).toLowerCase();
  const contact = normalizeContact(profile.contact).toLowerCase();
  const email = normalizeEmail(profile.email);

  return loginId === contact || Boolean(email && loginId === email);
};

export const getProfileInitials = (fullName) => {
  const parts = cleanText(fullName).split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "A";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export function useProfileAccount(messages = defaultMessages) {
  const copy = useMemo(() => ({ ...defaultMessages, ...messages }), [messages]);
  const [storedProfile, setStoredProfile] = useState(readStoredProfile);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    hasValidSession(readStoredProfile()),
  );
  const [isBusy, setIsBusy] = useState(false);

  const profile = useMemo(() => toPublicProfile(storedProfile), [storedProfile]);

  const runAccountAction = useCallback(async (action) => {
    setIsBusy(true);

    try {
      const message = await action();
      return { ok: true, message };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : copy.actionFailed,
      };
    } finally {
      setIsBusy(false);
    }
  }, [copy.actionFailed]);

  const createAccount = useCallback(
    (values) =>
      runAccountAction(async () => {
        if (storedProfile) {
          throw new Error(copy.accountExists);
        }

        const normalizedValues = normalizeProfileValues(values);
        validateBaseProfile(normalizedValues, copy);
        validatePassword(values.password, values.confirmPassword, copy);

        if (normalizedValues.twoFactorEnabled) {
          validateTwoFactorCode(values.twoFactorCode, copy);
        }

        const salt = createId();
        const now = new Date().toISOString();
        const nextProfile = {
          id: createId(),
          ...normalizedValues,
          createdAt: now,
          updatedAt: now,
          security: {
            salt,
            passwordHash: await hashSecret(values.password, salt),
            twoFactorEnabled: normalizedValues.twoFactorEnabled,
            twoFactorHash: normalizedValues.twoFactorEnabled
              ? await hashSecret(values.twoFactorCode, salt)
              : "",
          },
        };

        writeJson(PROFILE_STORAGE_KEY, nextProfile, copy);
        writeSession(nextProfile.id);
        setStoredProfile(nextProfile);
        setIsAuthenticated(true);

        return copy.accountCreated;
      }),
    [copy, runAccountAction, storedProfile],
  );

  const login = useCallback(
    (values) =>
      runAccountAction(async () => {
        if (!storedProfile) {
          throw new Error(copy.noAccount);
        }

        if (!matchesLoginIdentifier(storedProfile, values.loginId)) {
          throw new Error(copy.invalidLogin);
        }

        const passwordHash = await hashSecret(values.password, storedProfile.security.salt);

        if (passwordHash !== storedProfile.security.passwordHash) {
          throw new Error(copy.invalidPassword);
        }

        if (storedProfile.security.twoFactorEnabled) {
          validateTwoFactorCode(values.twoFactorCode, copy);

          const twoFactorHash = await hashSecret(
            values.twoFactorCode,
            storedProfile.security.salt,
          );

          if (twoFactorHash !== storedProfile.security.twoFactorHash) {
            throw new Error(copy.invalidTwoFactorLogin);
          }
        }

        writeSession(storedProfile.id);
        setIsAuthenticated(true);

        return copy.loginSuccess;
      }),
    [copy, runAccountAction, storedProfile],
  );

  const logout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(
    (values) =>
      runAccountAction(async () => {
        if (!storedProfile || !isAuthenticated) {
          throw new Error(copy.loginToEdit);
        }

        const normalizedValues = normalizeProfileValues(values);
        validateBaseProfile(normalizedValues, copy);

        const nextSecurity = {
          ...storedProfile.security,
          twoFactorEnabled: normalizedValues.twoFactorEnabled,
        };

        if (cleanText(values.newPassword)) {
          validatePassword(values.newPassword, values.confirmNewPassword, copy);
          nextSecurity.passwordHash = await hashSecret(
            values.newPassword,
            storedProfile.security.salt,
          );
        }

        if (normalizedValues.twoFactorEnabled) {
          const hasExistingCode = Boolean(storedProfile.security.twoFactorHash);
          const hasNewCode = Boolean(cleanText(values.twoFactorCode));

          if (!hasExistingCode || hasNewCode) {
            validateTwoFactorCode(values.twoFactorCode, copy);
            nextSecurity.twoFactorHash = await hashSecret(
              values.twoFactorCode,
              storedProfile.security.salt,
            );
          }
        } else {
          nextSecurity.twoFactorHash = "";
        }

        const nextProfile = {
          ...storedProfile,
          ...normalizedValues,
          updatedAt: new Date().toISOString(),
          security: nextSecurity,
        };

        writeJson(PROFILE_STORAGE_KEY, nextProfile, copy);
        setStoredProfile(nextProfile);

        return copy.profileUpdated;
      }),
    [copy, isAuthenticated, runAccountAction, storedProfile],
  );

  const deleteAccount = useCallback(() => {
    if (isBrowser()) {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    }

    clearSession();
    setStoredProfile(null);
    setIsAuthenticated(false);
  }, []);

  return {
    profile,
    hasAccount: Boolean(storedProfile),
    isAuthenticated,
    isBusy,
    createAccount,
    login,
    logout,
    updateProfile,
    deleteAccount,
  };
}
