import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

export function VideoGallerySection({ copy, id = "videos", variant = "light", videos }) {
  const sectionClassName =
    variant === "green"
      ? "section-band section-band--green video-showcase video-showcase--green"
      : "section-band section-band--white video-showcase";

  return (
    <section className={sectionClassName} id={id}>
      <div className="section-inner">
        <SectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="center"
        />

        <div className="video-grid">
          {videos.map((video) => (
            <article className="video-card" key={video.id}>
              <div className="video-frame">
                {video.embedUrl ? (
                  <iframe
                    title={video.title}
                    src={video.embedUrl}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <a className="video-placeholder" href={video.href} target="_blank" rel="noreferrer">
                    <AppIcon name="CirclePlay" size={42} />
                  </a>
                )}
              </div>

              <div className="video-card-copy">
                <span>{video.tag}</span>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <a href={video.href} target="_blank" rel="noreferrer">
                  <AppIcon name="BrandYoutube" size={19} />
                  {video.action}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
