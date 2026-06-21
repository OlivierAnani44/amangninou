import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

export function ProfileSection({ notifications, profileFeatures, securityItems }) {
  return (
    <section className="section-band section-band--white" id="profil">
      <div className="section-inner profile-layout">
        <div>
          <SectionHeader
            eyebrow="Profil"
            title="Compte facultatif, sécurité prévue dès le départ"
            description="Le compte améliore le suivi, mais l’accès au contenu principal reste possible sans inscription."
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

        <div className="account-panel" aria-label="Aperçu profil utilisateur">
          <div className="account-topline">
            <span className="avatar-mark">A</span>
            <div>
              <strong>Profil Amangninou</strong>
              <span>Compte sécurisé facultatif</span>
            </div>
          </div>

          <form className="profile-form">
            <label>
              Nom complet
              <input type="text" placeholder="Votre nom" />
            </label>
            <label>
              Contact
              <input type="tel" placeholder="+229 ..." />
            </label>
            <label className="toggle-row">
              <input type="checkbox" defaultChecked />
              <span>Activer les rappels</span>
            </label>
            <label className="toggle-row">
              <input type="checkbox" />
              <span>Double authentification</span>
            </label>
          </form>
        </div>

        <div className="notification-strip" aria-label="Notifications">
          {notifications.map((notification) => (
            <article key={notification.title}>
              <AppIcon name={notification.icon} size={22} />
              <h3>{notification.title}</h3>
              <p>{notification.text}</p>
            </article>
          ))}
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
