import { AppIcon } from "./AppIcon";

export function PageIntro({ intro }) {
  if (!intro) {
    return null;
  }

  return (
    <section className="page-intro">
      <div className="section-inner page-intro-inner">
        <div className="page-intro-copy">
          <p className="section-eyebrow">{intro.eyebrow}</p>
          <h1>{intro.title}</h1>
          <p>{intro.description}</p>
          {intro.action ? (
            <a className="primary-action" href={intro.action.href}>
              <AppIcon name={intro.action.icon} size={19} />
              {intro.action.label}
            </a>
          ) : null}
        </div>

        <div className="page-intro-visual" aria-hidden="true">
          <span>
            <AppIcon name={intro.icon} size={42} />
          </span>
          <i />
          <b />
        </div>
      </div>
    </section>
  );
}
