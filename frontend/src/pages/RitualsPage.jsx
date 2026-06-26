import { PageIntro } from "../components/PageIntro";
import { RitualsSection } from "../components/sections/RitualsSection";

export function RitualsPage({ content }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.rituel} />
      <RitualsSection copy={content.ritualsSection} rituals={content.rituals} />
    </>
  );
}
