import { useState } from "react";
import { AppIcon } from "../AppIcon";

export function HeroSection({ highlights, owner, stats }) {
  const [ownerImageLoaded, setOwnerImageLoaded] = useState(false);
  const ownerImageSrc = owner?.imageSrc ? `${import.meta.env.BASE_URL}${owner.imageSrc}` : "";

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

        <div className="hero-media" aria-label="Portrait de Togbe Amangninou">
          <article className="owner-photo-card">
            <div className="owner-photo-frame">
              {ownerImageSrc ? (
                <img
                  className={ownerImageLoaded ? "is-loaded" : undefined}
                  src={ownerImageSrc}
                  alt={`Portrait de ${owner?.name ?? "Togbe Amangninou"}`}
                  onLoad={() => setOwnerImageLoaded(true)}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    setOwnerImageLoaded(false);
                  }}
                />
              ) : null}
              <div className="owner-photo-placeholder" aria-hidden={ownerImageLoaded}>
                <span>{owner?.initials ?? "TA"}</span>
              </div>
            </div>

            <div className="owner-photo-copy">
              <span>Photo du propriétaire</span>
              <strong>{owner?.name ?? "Togbe Amangninou"}</strong>
              <p>{owner?.specialty}</p>
            </div>
          </article>

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
