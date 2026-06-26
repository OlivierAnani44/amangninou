import { PageIntro } from "../components/PageIntro";
import { RitualsSection } from "../components/sections/RitualsSection";

export function RitualsPage({ content }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.rituel} />
      <RitualsSection
        contactSettings={content.contactSettings}
        copy={content.ritualsSection}
        videoCopy={content.ritualVideosSection}
        videos={content.ritualVideos}
        rituals={content.rituals}
      />
    </>
  );
}
