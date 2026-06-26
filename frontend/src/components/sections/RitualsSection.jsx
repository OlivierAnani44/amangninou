import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";
import { buildWhatsAppUrl, formatMessageTemplate } from "../../data/siteContent";

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
              <a
                href={buildWhatsAppUrl(
                  formatMessageTemplate(copy.whatsappText, {
                    ritual: ritual.name,
                    subtitle: ritual.subtitle,
                  }),
                )}
                className="ritual-action"
                target="_blank"
                rel="noreferrer"
              >
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
