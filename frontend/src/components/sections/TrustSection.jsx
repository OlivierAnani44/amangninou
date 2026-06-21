import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

export function TrustSection({ testimonials, trustItems }) {
  return (
    <section className="section-band section-band--soft" id="temoignages">
      <div className="section-inner trust-layout">
        <div>
          <SectionHeader
            eyebrow="Confiance"
            title="Pourquoi nous faire confiance ?"
            description="Le site valorise les retours d’expérience, la transparence et les limites claires avant toute démarche."
          />

          <div className="trust-feature">
            <AppIcon name="ShieldCheck" size={28} />
            <div>
              <h3>Une démarche responsable</h3>
              <p>
                Les informations sont organisées pour aider à comprendre, comparer
                et poser les bonnes questions, sans garantie automatique de résultat.
              </p>
            </div>
          </div>

          <div className="trust-list">
            {trustItems.map((item) => (
              <article className="trust-item" key={item.title}>
                <AppIcon name={item.icon} size={22} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="testimonial-stack">
          <div className="testimonial-heading">
            <span>Retours d’expérience</span>
            <p>Ces témoignages ne sont pas des garanties, mais des ressentis partagés.</p>
          </div>
          {testimonials.map((testimonial) => (
            <figure className="testimonial-card" key={testimonial.name}>
              <blockquote>{testimonial.quote}</blockquote>
              <figcaption>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.context}</span>
              </figcaption>
            </figure>
          ))}

          <div className="health-note">
            <AppIcon name="Cross" size={21} />
            <p>
              Les plantes et préparations traditionnelles sont présentées comme
              informations de bien-être. Elles ne remplacent pas un médecin,
              un diagnostic ou un traitement prescrit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
