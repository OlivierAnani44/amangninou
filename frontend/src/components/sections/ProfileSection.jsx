import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";
import {
  emptyProfileForm,
  getProfileInitials,
  useProfileAccount,
} from "../../hooks/useProfileAccount";

const createInitialForm = {
  ...emptyProfileForm,
  password: "",
  confirmPassword: "",
};

const loginInitialForm = {
  loginId: "",
  password: "",
  twoFactorCode: "",
};

const statusClassNames = {
  success: "form-status form-status--success",
  error: "form-status form-status--error",
  info: "form-status form-status--info",
};

const notificationPreferenceKeys = {
  Bienvenue: "updatesEnabled",
  Rappels: "remindersEnabled",
  "Mises a jour": "updatesEnabled",
  "Mises à jour": "updatesEnabled",
};

const buildEditForm = (profile) => ({
  fullName: profile?.fullName ?? "",
  contact: profile?.contact ?? "",
  email: profile?.email ?? "",
  preferredChannel: profile?.preferredChannel ?? "WhatsApp",
  remindersEnabled: profile?.remindersEnabled ?? true,
  updatesEnabled: profile?.updatesEnabled ?? true,
  promotionsEnabled: profile?.promotionsEnabled ?? false,
  twoFactorEnabled: profile?.twoFactorEnabled ?? false,
  twoFactorCode: "",
  newPassword: "",
  confirmNewPassword: "",
});

function formatProfileDate(value) {
  if (!value) {
    return "Aujourd'hui";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileSection({ notifications, profileFeatures, securityItems }) {
  const {
    profile,
    hasAccount,
    isAuthenticated,
    isBusy,
    createAccount,
    login,
    logout,
    updateProfile,
    deleteAccount,
  } = useProfileAccount();

  const [createForm, setCreateForm] = useState(createInitialForm);
  const [loginForm, setLoginForm] = useState(loginInitialForm);
  const [editForm, setEditForm] = useState(() => buildEditForm(profile));
  const [status, setStatus] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setEditForm(buildEditForm(profile));
    setConfirmDelete(false);
  }, [profile]);

  const initials = useMemo(() => getProfileInitials(profile?.fullName), [profile?.fullName]);

  const accountSubtitle = useMemo(() => {
    if (isAuthenticated) {
      return `Connecté depuis le ${formatProfileDate(profile?.updatedAt ?? profile?.createdAt)}`;
    }

    if (hasAccount) {
      return "Connexion requise pour modifier les informations";
    }

    return "Compte facultatif pour garder vos préférences";
  }, [hasAccount, isAuthenticated, profile?.createdAt, profile?.updatedAt]);

  const setCreateValue = (field, value) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const setLoginValue = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  };

  const setEditValue = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const showResult = (result) => {
    setStatus({
      type: result.ok ? "success" : "error",
      text: result.message,
    });
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    const result = await createAccount(createForm);

    showResult(result);

    if (result.ok) {
      setCreateForm(createInitialForm);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await login(loginForm);

    showResult(result);

    if (result.ok) {
      setLoginForm(loginInitialForm);
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const result = await updateProfile(editForm);
    showResult(result);
  };

  const handleLogout = () => {
    logout();
    setStatus({ type: "success", text: "Session fermée." });
  };

  const handleDeleteAccount = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setStatus({
        type: "info",
        text: "Appuyez une deuxième fois pour supprimer le profil de cet appareil.",
      });
      return;
    }

    deleteAccount();
    setStatus({ type: "success", text: "Profil supprimé de cet appareil." });
    setConfirmDelete(false);
  };

  return (
    <section className="section-band section-band--white" id="profil">
      <div className="section-inner profile-layout">
        <div>
          <SectionHeader
            eyebrow="Profil"
            title="Compte facultatif, réglages utiles"
            description="Créez un profil si vous voulez garder vos préférences, activer les rappels et sécuriser l'accès."
          />

          <div className="feature-list">
            {profileFeatures.map((feature) => (
              <article className="feature-row" key={feature.title}>
                <AppIcon name="UserRound" size={20} />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="account-panel account-panel--interactive" aria-label="Compte utilisateur">
          <div className="account-topline">
            <span className="avatar-mark">{initials}</span>
            <div>
              <strong>{profile?.fullName || "Profil Amangninou"}</strong>
              <span>{accountSubtitle}</span>
            </div>
          </div>

          <div className="profile-state-row" aria-label="Etat du profil">
            <span className={isAuthenticated ? "status-pill is-on" : "status-pill"}>
              {isAuthenticated ? "Connecté" : hasAccount ? "Hors ligne" : "Nouveau"}
            </span>
            <span className={profile?.twoFactorEnabled ? "status-pill is-on" : "status-pill"}>
              2FA {profile?.twoFactorEnabled ? "active" : "inactive"}
            </span>
          </div>

          {status?.text ? <p className={statusClassNames[status.type]}>{status.text}</p> : null}

          {!hasAccount ? (
            <form className="profile-form" onSubmit={handleCreateAccount}>
              <div className="profile-form-heading">
                <AppIcon name="UserPlus" size={20} />
                <h3>Créer un compte</h3>
              </div>

              <label>
                Nom complet
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={createForm.fullName}
                  onChange={(event) => setCreateValue("fullName", event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Contact
                <input
                  type="tel"
                  placeholder="+229 ..."
                  value={createForm.contact}
                  onChange={(event) => setCreateValue("contact", event.target.value)}
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                Email (facultatif)
                <input
                  type="email"
                  placeholder="nom@example.com, optionnel"
                  value={createForm.email}
                  onChange={(event) => setCreateValue("email", event.target.value)}
                  autoComplete="email"
                />
              </label>

              <label>
                Canal préféré
                <select
                  value={createForm.preferredChannel}
                  onChange={(event) => setCreateValue("preferredChannel", event.target.value)}
                >
                  <option>WhatsApp</option>
                  <option>Téléphone</option>
                  <option>Email</option>
                </select>
              </label>

              <div className="form-grid">
                <label>
                  Mot de passe
                  <input
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={createForm.password}
                    onChange={(event) => setCreateValue("password", event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </label>
                <label>
                  Confirmation
                  <input
                    type="password"
                    placeholder="Répéter le mot de passe"
                    value={createForm.confirmPassword}
                    onChange={(event) => setCreateValue("confirmPassword", event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </label>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={createForm.remindersEnabled}
                  onChange={(event) => setCreateValue("remindersEnabled", event.target.checked)}
                />
                <span>Activer les rappels</span>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={createForm.updatesEnabled}
                  onChange={(event) => setCreateValue("updatesEnabled", event.target.checked)}
                />
                <span>Recevoir les mises à jour</span>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={createForm.twoFactorEnabled}
                  onChange={(event) => setCreateValue("twoFactorEnabled", event.target.checked)}
                />
                <span>Activer le code 2FA</span>
              </label>

              {createForm.twoFactorEnabled ? (
                <label>
                  Code 2FA personnel
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="6 chiffres"
                    value={createForm.twoFactorCode}
                    onChange={(event) => setCreateValue("twoFactorCode", event.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                </label>
              ) : null}

              <button className="primary-action" type="submit" disabled={isBusy}>
                <AppIcon name="UserPlus" size={18} />
                Créer le profil
              </button>
            </form>
          ) : null}

          {hasAccount && !isAuthenticated ? (
            <form className="profile-form" onSubmit={handleLogin}>
              <div className="profile-form-heading">
                <AppIcon name="LogIn" size={20} />
                <h3>Connexion</h3>
              </div>

              <label>
                Contact ou email
                <input
                  type="text"
                  placeholder="Votre contact ou email"
                  value={loginForm.loginId}
                  onChange={(event) => setLoginValue("loginId", event.target.value)}
                  autoComplete="username"
                  required
                />
              </label>

              <label>
                Mot de passe
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={loginForm.password}
                  onChange={(event) => setLoginValue("password", event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {profile?.twoFactorEnabled ? (
                <label>
                  Code 2FA
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="6 chiffres"
                    value={loginForm.twoFactorCode}
                    onChange={(event) => setLoginValue("twoFactorCode", event.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                </label>
              ) : null}

              <button className="primary-action" type="submit" disabled={isBusy}>
                <AppIcon name="LogIn" size={18} />
                Se connecter
              </button>
            </form>
          ) : null}

          {hasAccount && isAuthenticated ? (
            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <div className="profile-form-heading">
                <AppIcon name="Settings" size={20} />
                <h3>Modifier le profil</h3>
              </div>

              <label>
                Nom complet
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(event) => setEditValue("fullName", event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Contact
                <input
                  type="tel"
                  value={editForm.contact}
                  onChange={(event) => setEditValue("contact", event.target.value)}
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                Email (facultatif)
                <input
                  type="email"
                  placeholder="nom@example.com, optionnel"
                  value={editForm.email}
                  onChange={(event) => setEditValue("email", event.target.value)}
                  autoComplete="email"
                />
              </label>

              <label>
                Canal préféré
                <select
                  value={editForm.preferredChannel}
                  onChange={(event) => setEditValue("preferredChannel", event.target.value)}
                >
                  <option>WhatsApp</option>
                  <option>Téléphone</option>
                  <option>Email</option>
                </select>
              </label>

              <div className="profile-toggle-group">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={editForm.remindersEnabled}
                    onChange={(event) => setEditValue("remindersEnabled", event.target.checked)}
                  />
                  <span>Rappels</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={editForm.updatesEnabled}
                    onChange={(event) => setEditValue("updatesEnabled", event.target.checked)}
                  />
                  <span>Mises à jour</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={editForm.promotionsEnabled}
                    onChange={(event) => setEditValue("promotionsEnabled", event.target.checked)}
                  />
                  <span>Publicité</span>
                </label>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={editForm.twoFactorEnabled}
                  onChange={(event) => setEditValue("twoFactorEnabled", event.target.checked)}
                />
                <span>Double authentification</span>
              </label>

              {editForm.twoFactorEnabled ? (
                <label>
                  Code 2FA
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder={
                      profile?.twoFactorEnabled
                        ? "Nouveau code optionnel"
                        : "Choisir un code à 6 chiffres"
                    }
                    value={editForm.twoFactorCode}
                    onChange={(event) => setEditValue("twoFactorCode", event.target.value)}
                    autoComplete="one-time-code"
                    required={!profile?.twoFactorEnabled}
                  />
                </label>
              ) : null}

              <div className="form-grid">
                <label>
                  Nouveau mot de passe
                  <input
                    type="password"
                    placeholder="Optionnel"
                    value={editForm.newPassword}
                    onChange={(event) => setEditValue("newPassword", event.target.value)}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  Confirmation
                  <input
                    type="password"
                    placeholder="Optionnel"
                    value={editForm.confirmNewPassword}
                    onChange={(event) => setEditValue("confirmNewPassword", event.target.value)}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="profile-actions">
                <button className="primary-action" type="submit" disabled={isBusy}>
                  <AppIcon name="Save" size={18} />
                  Enregistrer
                </button>
                <button className="secondary-action" type="button" onClick={handleLogout}>
                  <AppIcon name="LogOut" size={18} />
                  Déconnexion
                </button>
              </div>

              <button className="danger-action" type="button" onClick={handleDeleteAccount}>
                <AppIcon name="Trash2" size={18} />
                {confirmDelete ? "Confirmer la suppression" : "Supprimer le profil"}
              </button>
            </form>
          ) : null}

          <p className="profile-note">
            Les informations du profil sont gardées sur cet appareil. Le contenu du site reste
            accessible sans compte.
          </p>
        </div>

        <div className="notification-strip" aria-label="Notifications">
          {notifications.map((notification) => {
            const preferenceKey = notificationPreferenceKeys[notification.title];
            const isEnabled = !profile || !preferenceKey || profile[preferenceKey];

            return (
              <article key={notification.title}>
                <AppIcon name={notification.icon} size={22} />
                <div className="notification-card-heading">
                  <h3>{notification.title}</h3>
                  <span className={isEnabled ? "status-pill is-on" : "status-pill"}>
                    {isEnabled ? "Active" : "Inactive"}
                  </span>
                </div>
                <p>{notification.text}</p>
              </article>
            );
          })}
        </div>

        <div className="security-panel">
          <h3>Sécurité et protection</h3>
          <ul>
            {securityItems.map((item) => (
              <li key={item}>
                <AppIcon name="ShieldCheck" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
