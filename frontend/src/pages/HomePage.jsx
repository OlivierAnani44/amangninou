import { HeroSection } from "../components/sections/HeroSection";
import { SectionHeader } from "../components/SectionHeader";
import { AppIcon } from "../components/AppIcon";

export function HomePage({ content }) {
  const quickTabs = content.navigationItems.filter((item) => item.id !== "accueil");

  return (
    <>
      <HeroSection
        copy={content.hero}
        highlights={content.serviceHighlights}
        owner={content.ownerProfile}
        stats={content.heroStats}
      />

      <section className="section-band section-band--soft">
        <div className="section-inner proof-section">
          {quickProofs.map((proof) => (
            <article className="proof-card" key={proof.title}>
              <AppIcon name={proof.icon} size={23} />
              <div>
                <h3>{proof.title}</h3>
                <p>{proof.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band section-band--white">
        <div className="section-inner">
          <SectionHeader
            eyebrow={content.home.exploreEyebrow}
            title={content.home.exploreTitle}
            description={content.home.exploreDescription}
            align="center"
          />

          <div className="tab-overview-grid">
            {quickTabs.map((item) => (
              <a className="tab-overview-card" href={item.href} key={item.id}>
                <AppIcon name={item.icon} size={22} />
                <span>{item.label}</span>
                <AppIcon name="ChevronRight" size={18} className="menu-chevron" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
