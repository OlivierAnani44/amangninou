import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

export function TrustSection({ copy, testimonials, trustItems }) {
  return (
    <section className="section-band section-band--soft" id="temoignages">
      <div className="section-inner trust-layout">
        <div>
          <SectionHeader
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />

          <div className="trust-feature">
            <AppIcon name="ShieldCheck" size={28} />
            <div>
              <h3>{copy.featureTitle}</h3>
              <p>{copy.featureText}</p>
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
            <span>{copy.testimonialTitle}</span>
            <p>{copy.testimonialText}</p>
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
            <p>{copy.healthNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
