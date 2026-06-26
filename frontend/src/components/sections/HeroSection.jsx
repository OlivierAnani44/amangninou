import { useState } from "react";
import { AppIcon } from "../AppIcon";

export function HeroSection({ copy, highlights, owner, stats }) {
  const [ownerImageLoaded, setOwnerImageLoaded] = useState(false);
  const ownerImageSrc = owner?.imageSrc?.startsWith("data:")
    || owner?.imageSrc?.startsWith("http")
    ? owner.imageSrc
    : owner?.imageSrc
      ? `${import.meta.env.BASE_URL}${owner.imageSrc}`
      : "";

  return (
    <section className="hero section-band" id="accueil">
      <div className="section-inner hero-grid">
        <div className="hero-content">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="hero-text">{copy.text}</p>

          <div className="hero-actions">
            <a className="primary-action" href="#services">
              <AppIcon name="ShieldCheck" size={19} />
              {copy.primaryAction}
            </a>
            <a className="secondary-action" href="#boutique">
              <AppIcon name="ShoppingBag" size={19} />
              {copy.secondaryAction}
            </a>
          </div>

          <ul className="hero-highlights" aria-label={copy.highlightsLabel}>
            {highlights.map((highlight) => (
              <li key={highlight}>
                <AppIcon name="BadgeCheck" size={18} />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-media" aria-label={copy.mediaLabel}>
          <article className="owner-photo-card">
            <div className="owner-photo-frame">
              {ownerImageSrc ? (
                <img
                  className={ownerImageLoaded ? "is-loaded" : undefined}
                  src={ownerImageSrc}
                  alt={copy.ownerAlt}
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
              <span>{copy.ownerPhotoLabel}</span>
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
