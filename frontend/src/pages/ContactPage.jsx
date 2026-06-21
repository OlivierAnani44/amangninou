import { PageIntro } from "../components/PageIntro";
import { ContactSection } from "../components/sections/ContactSection";
import { contactChannels, pageIntros } from "../data/siteContent";

export function ContactPage() {
  return (
    <>
      <PageIntro intro={pageIntros.contact} />
      <ContactSection channels={contactChannels} />
    </>
  );
}
