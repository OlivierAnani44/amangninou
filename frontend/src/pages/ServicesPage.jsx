import { PageIntro } from "../components/PageIntro";
import { ServicesSection } from "../components/sections/ServicesSection";
import { pageIntros, processSteps, serviceCategories, services } from "../data/siteContent";

export function ServicesPage() {
  return (
    <>
      <PageIntro intro={pageIntros.services} />
      <ServicesSection categories={serviceCategories} processSteps={processSteps} services={services} />
    </>
  );
}
