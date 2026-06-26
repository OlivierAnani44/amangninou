import { PageIntro } from "../components/PageIntro";
import { ServicesSection } from "../components/sections/ServicesSection";

export function ServicesPage({ content }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.services} />
      <ServicesSection
        categories={content.serviceCategories}
        copy={content.servicesSection}
        processSteps={content.processSteps}
        services={content.services}
      />
    </>
  );
}
