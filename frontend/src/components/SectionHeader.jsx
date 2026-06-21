export function SectionHeader({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={`section-header section-header--${align}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  );
}
