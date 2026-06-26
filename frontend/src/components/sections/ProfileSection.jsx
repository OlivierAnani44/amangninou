import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";
import {
  emptyProfileForm,
  getProfileInitials,
  normalizePreferredChannel,
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

const buildEditForm = (profile) => ({
  fullName: profile?.fullName ?? "",
  contact: profile?.contact ?? "",
  email: profile?.email ?? "",
  preferredChannel: normalizePreferredChannel(profile?.preferredChannel),
  remindersEnabled: profile?.remindersEnabled ?? true,
  updatesEnabled: profile?.updatesEnabled ?? true,
  promotionsEnabled: profile?.promotionsEnabled ?? false,
  twoFactorEnabled: profile?.twoFactorEnabled ?? false,
  twoFactorCode: "",
  newPassword: "",
  confirmNewPassword: "",
});

function formatProfileDate(value, locale) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value ?? Date.now()));
}

export function ProfileSection({
  contactChannels = [],
  copy,
  locale,
  messages,
  notifications,
  profileFeatures,
  securityItems,
}) {
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
  } = useProfileAccount(messages);

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
  const contactChannelOptions = useMemo(() => {
    const translatedChannels = contactChannels.filter((channel) =>
      ["whatsapp", "phone", "email"].includes(channel.id),
    );

    if (translatedChannels.length > 0) {
      return translatedChannels;
    }

    return [
      { id: "whatsapp", label: "WhatsApp" },
      { id: "phone", label: copy.phoneChannel },
      { id: "email", label: "Email" },
    ];
  }, [contactChannels, copy.phoneChannel]);

  const accountSubtitle = useMemo(() => {
    if (isAuthenticated) {
      return copy.connectedSince.replace(
        "{date}",
        formatProfileDate(profile?.updatedAt ?? profile?.createdAt, locale),
      );
    }

    if (hasAccount) {
      return copy.loginRequired;
    }

    return copy.optionalAccount;
  }, [copy, hasAccount, isAuthenticated, locale, profile?.createdAt, profile?.updatedAt]);

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
    setStatus({ type: "success", text: copy.sessionClosed });
  };

  const handleDeleteAccount = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setStatus({
        type: "info",
        text: copy.deletePrompt,
      });
      return;
    }

    deleteAccount();
    setStatus({ type: "success", text: copy.deleted });
    setConfirmDelete(false);
  };

  return (
    <section className="section-band section-band--white" id="profil">
      <div className="section-inner profile-layout">
        <div>
          <SectionHeader
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
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

        <div className="account-panel account-panel--interactive" aria-label={copy.panelAria}>
          <div className="account-topline">
            <span className="avatar-mark">{initials}</span>
            <div>
              <strong>{profile?.fullName || copy.profileName}</strong>
              <span>{accountSubtitle}</span>
            </div>
          </div>

          <div className="profile-state-row" aria-label={copy.stateAria}>
            <span className={isAuthenticated ? "status-pill is-on" : "status-pill"}>
              {isAuthenticated ? copy.connected : hasAccount ? copy.offline : copy.new}
            </span>
            <span className={profile?.twoFactorEnabled ? "status-pill is-on" : "status-pill"}>
              2FA {profile?.twoFactorEnabled ? copy.active : copy.inactive}
            </span>
          </div>

          {status?.text ? <p className={statusClassNames[status.type]}>{status.text}</p> : null}

          {!hasAccount ? (
            <form className="profile-form" onSubmit={handleCreateAccount}>
              <div className="profile-form-heading">
                <AppIcon name="UserPlus" size={20} />
                <h3>{copy.createAccount}</h3>
              </div>

              <label>
                {copy.fullName}
                <input
                  type="text"
                  placeholder={copy.fullNamePlaceholder}
                  value={createForm.fullName}
                  onChange={(event) => setCreateValue("fullName", event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                {copy.contact}
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
                {copy.emailOptional}
                <input
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  value={createForm.email}
                  onChange={(event) => setCreateValue("email", event.target.value)}
                  autoComplete="email"
                />
              </label>

              <label>
                {copy.preferredChannel}
                <select
                  value={normalizePreferredChannel(createForm.preferredChannel)}
                  onChange={(event) => setCreateValue("preferredChannel", event.target.value)}
                >
                  {contactChannelOptions.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-grid">
                <label>
                  {copy.password}
                  <input
                    type="password"
                    placeholder={copy.passwordPlaceholder}
                    value={createForm.password}
                    onChange={(event) => setCreateValue("password", event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </label>
                <label>
                  {copy.confirmation}
                  <input
                    type="password"
                    placeholder={copy.repeatPassword}
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
                <span>{copy.reminders}</span>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={createForm.updatesEnabled}
                  onChange={(event) => setCreateValue("updatesEnabled", event.target.checked)}
                />
                <span>{copy.updates}</span>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={createForm.twoFactorEnabled}
                  onChange={(event) => setCreateValue("twoFactorEnabled", event.target.checked)}
                />
                <span>{copy.twoFactor}</span>
              </label>

              {createForm.twoFactorEnabled ? (
                <label>
                  {copy.personalCode}
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder={copy.sixDigits}
                    value={createForm.twoFactorCode}
                    onChange={(event) => setCreateValue("twoFactorCode", event.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                </label>
              ) : null}

              <button className="primary-action" type="submit" disabled={isBusy}>
                <AppIcon name="UserPlus" size={18} />
                {copy.createProfile}
              </button>
            </form>
          ) : null}

          {hasAccount && !isAuthenticated ? (
            <form className="profile-form" onSubmit={handleLogin}>
              <div className="profile-form-heading">
                <AppIcon name="LogIn" size={20} />
                <h3>{copy.login}</h3>
              </div>

              <label>
                {copy.loginIdentifier}
                <input
                  type="text"
                  placeholder={copy.loginIdentifierPlaceholder}
                  value={loginForm.loginId}
                  onChange={(event) => setLoginValue("loginId", event.target.value)}
                  autoComplete="username"
                  required
                />
              </label>

              <label>
                {copy.password}
                <input
                  type="password"
                  placeholder={copy.currentPassword}
                  value={loginForm.password}
                  onChange={(event) => setLoginValue("password", event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {profile?.twoFactorEnabled ? (
                <label>
                  {copy.personalCode}
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder={copy.sixDigits}
                    value={loginForm.twoFactorCode}
                    onChange={(event) => setLoginValue("twoFactorCode", event.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                </label>
              ) : null}

              <button className="primary-action" type="submit" disabled={isBusy}>
                <AppIcon name="LogIn" size={18} />
                {copy.signIn}
              </button>
            </form>
          ) : null}

          {hasAccount && isAuthenticated ? (
            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <div className="profile-form-heading">
                <AppIcon name="Settings" size={20} />
                <h3>{copy.editProfile}</h3>
              </div>

              <label>
                {copy.fullName}
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(event) => setEditValue("fullName", event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                {copy.contact}
                <input
                  type="tel"
                  value={editForm.contact}
                  onChange={(event) => setEditValue("contact", event.target.value)}
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                {copy.emailOptional}
                <input
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  value={editForm.email}
                  onChange={(event) => setEditValue("email", event.target.value)}
                  autoComplete="email"
                />
              </label>

              <label>
                {copy.preferredChannel}
                <select
                  value={normalizePreferredChannel(editForm.preferredChannel)}
                  onChange={(event) => setEditValue("preferredChannel", event.target.value)}
                >
                  {contactChannelOptions.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="profile-toggle-group">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={editForm.remindersEnabled}
                    onChange={(event) => setEditValue("remindersEnabled", event.target.checked)}
                  />
                  <span>{copy.remindersShort}</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={editForm.updatesEnabled}
                    onChange={(event) => setEditValue("updatesEnabled", event.target.checked)}
                  />
                  <span>{copy.updatesShort}</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={editForm.promotionsEnabled}
                    onChange={(event) => setEditValue("promotionsEnabled", event.target.checked)}
                  />
                  <span>{copy.promotions}</span>
                </label>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={editForm.twoFactorEnabled}
                  onChange={(event) => setEditValue("twoFactorEnabled", event.target.checked)}
                />
                <span>{copy.twoFactorFull}</span>
              </label>

              {editForm.twoFactorEnabled ? (
                <label>
                  {copy.personalCode}
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder={
                      profile?.twoFactorEnabled
                        ? copy.newCodeOptional
                        : copy.chooseSixDigitCode
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
                  {copy.newPassword}
                  <input
                    type="password"
                    placeholder={copy.optional}
                    value={editForm.newPassword}
                    onChange={(event) => setEditValue("newPassword", event.target.value)}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  {copy.confirmation}
                  <input
                    type="password"
                    placeholder={copy.optional}
                    value={editForm.confirmNewPassword}
                    onChange={(event) => setEditValue("confirmNewPassword", event.target.value)}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="profile-actions">
                <button className="primary-action" type="submit" disabled={isBusy}>
                  <AppIcon name="Save" size={18} />
                  {copy.save}
                </button>
                <button className="secondary-action" type="button" onClick={handleLogout}>
                  <AppIcon name="LogOut" size={18} />
                  {copy.logout}
                </button>
              </div>

              <button className="danger-action" type="button" onClick={handleDeleteAccount}>
                <AppIcon name="Trash2" size={18} />
                {confirmDelete ? copy.confirmDelete : copy.deleteProfile}
              </button>
            </form>
          ) : null}

          <p className="profile-note">
            {copy.note}
          </p>
        </div>

        <div className="notification-strip" aria-label={copy.notificationsAria}>
          {notifications.map((notification) => {
            const preferenceKey = notification.preferenceKey;
            const isEnabled = !profile || !preferenceKey || profile[preferenceKey];

            return (
              <article key={notification.title}>
                <AppIcon name={notification.icon} size={22} />
                <div className="notification-card-heading">
                  <h3>{notification.title}</h3>
                  <span className={isEnabled ? "status-pill is-on" : "status-pill"}>
                    {isEnabled ? copy.enabled : copy.disabled}
                  </span>
                </div>
                <p>{notification.text}</p>
              </article>
            );
          })}
        </div>

        <div className="security-panel">
          <h3>{copy.securityTitle}</h3>
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
