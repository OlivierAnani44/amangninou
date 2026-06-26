import { PageIntro } from "../components/PageIntro";
import { ContactSection } from "../components/sections/ContactSection";

export function ContactPage({ content }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.contact} />
      <ContactSection channels={content.contactChannels} copy={content.contactSection} />
    </>
  );
}
