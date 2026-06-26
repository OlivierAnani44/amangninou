import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

export function RitualsSection({ copy, rituals }) {
  return (
    <section className="section-band section-band--green" id="rituel">
      <div className="section-inner">
        <SectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <div className="ritual-grid">
          {rituals.map((ritual) => (
            <article className="ritual-card" key={ritual.name}>
              <div className="ritual-symbol">
                <AppIcon name={ritual.icon} size={28} />
              </div>
              <span>{ritual.tone}</span>
              <h3>{ritual.name}</h3>
              <strong>{ritual.subtitle}</strong>
              <p>{ritual.text}</p>
              <ul>
                {ritual.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <a href="#contact" className="ritual-action">
                {copy.action}
                <AppIcon name="ChevronRight" size={17} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
