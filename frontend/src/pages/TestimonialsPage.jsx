import { PageIntro } from "../components/PageIntro";
import { TrustSection } from "../components/sections/TrustSection";

export function TestimonialsPage({ content }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.temoignages} />
      <TrustSection
        copy={content.trustSection}
        testimonials={content.testimonials}
        trustItems={content.trustItems}
      />
    </>
  );
}
