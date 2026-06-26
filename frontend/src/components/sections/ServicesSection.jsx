import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

export function ServicesSection({ categories, copy, processSteps, services }) {
  return (
    <section className="section-band section-band--white" id="services">
      <div className="section-inner">
        <SectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <div className="category-strip" aria-label={copy.categoryLabel}>
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
                {copy.action}
                <AppIcon name="ChevronRight" size={17} />
              </a>
            </article>
          ))}
        </div>

        <div className="process-panel">
          <SectionHeader
            eyebrow={copy.processEyebrow}
            title={copy.processTitle}
            description={copy.processDescription}
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
