import { PageIntro } from "../components/PageIntro";
import { TrustSection } from "../components/sections/TrustSection";
import { pageIntros, testimonials, trustItems } from "../data/siteContent";

export function TestimonialsPage() {
  return (
    <>
      <PageIntro intro={pageIntros.temoignages} />
      <TrustSection testimonials={testimonials} trustItems={trustItems} />
    </>
  );
}
