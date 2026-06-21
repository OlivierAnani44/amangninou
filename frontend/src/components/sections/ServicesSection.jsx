import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

export function ServicesSection({ categories, processSteps, services }) {
  return (
    <section className="section-band section-band--white" id="services">
      <div className="section-inner">
        <SectionHeader
          eyebrow="Services"
          title="Un parcours clair avant chaque accompagnement"
          description="Les services sont présentés par besoin pour vous aider à savoir rapidement où commencer."
        />

        <div className="category-strip" aria-label="Catégories de services">
          {categories.map((category) => (
            <span key={category.label}>
              <AppIcon name={category.icon} size={17} />
              {category.label}
            </span>
          ))}
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-card-top">
                <div className="card-icon">
                  <AppIcon name={service.icon} size={23} />
                </div>
                <span className="card-label">{service.category}</span>
              </div>
              <h3>{service.title}</h3>
              <strong>{service.problem}</strong>
              <p>{service.description}</p>
              <ul>
                {service.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a className="service-action" href="#contact">
                Demander conseil
                <AppIcon name="ChevronRight" size={17} />
              </a>
            </article>
          ))}
        </div>

        <div className="process-panel">
          <SectionHeader
            eyebrow="Parcours"
            title="Comment ça se passe ?"
            description="Un parcours simple en trois temps pour éviter les décisions floues."
          />

          <div className="process-grid">
            {processSteps.map((step, index) => (
              <article className="process-step" key={step.title}>
                <span>{index + 1}</span>
                <AppIcon name={step.icon} size={24} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
