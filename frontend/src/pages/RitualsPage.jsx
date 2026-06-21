import { PageIntro } from "../components/PageIntro";
import { RitualsSection } from "../components/sections/RitualsSection";
import { pageIntros, rituals } from "../data/siteContent";

export function RitualsPage() {
  return (
    <>
      <PageIntro intro={pageIntros.rituel} />
      <RitualsSection rituals={rituals} />
    </>
  );
}
