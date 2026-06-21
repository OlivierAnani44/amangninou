import { AppIcon } from "../AppIcon";

export function HeroSection({ highlights, stats }) {
  return (
    <section className="hero section-band" id="accueil">
      <div className="section-inner hero-grid">
        <div className="hero-content">
          <p className="eyebrow">Spiritualité africaine, plantes et accompagnement</p>
          <h1>Togbe Amangninou</h1>
          <p className="hero-text">
            Un espace mobile simple pour demander conseil, découvrir les rituels
            Vodou africains et choisir des produits traditionnels avec prudence.
          </p>

          <div className="hero-actions">
            <a className="primary-action" href="#services">
              <AppIcon name="ShieldCheck" size={19} />
              Nos services
            </a>
            <a className="secondary-action" href="#boutique">
              <AppIcon name="ShoppingBag" size={19} />
              Voir la boutique
            </a>
          </div>

          <ul className="hero-highlights" aria-label="Points forts">
            {highlights.map((highlight) => (
              <li key={highlight}>
                <AppIcon name="BadgeCheck" size={18} />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-media" aria-label="Aperçu visuel Amangninou">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-ritual.png`}
            alt="Illustration de plantes, boutique et rituels Amangninou"
          />
          <div className="hero-stat-grid">
            {stats.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
