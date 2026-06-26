import { PageIntro } from "../components/PageIntro";
import { VideoGallerySection } from "../components/sections/VideoGallerySection";

export function TipsPage({ content }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.astuces} />
      <VideoGallerySection
        copy={content.tipsSection}
        id="astuces-videos"
        videos={content.tipVideos}
      />
    </>
  );
}
