import { AppIcon } from "../AppIcon";

export function SiteFooter({ copy, socialLinks = [] }) {
  return (
    <footer className="site-footer">
      <div className="section-inner footer-inner">
        <a className="brand footer-brand" href="#accueil">
          <span className="brand-symbol">
            <AppIcon name="Leaf" size={20} />
          </span>
          <span>Amangninou</span>
        </a>
        <p>{copy}</p>
        <div className="footer-socials">
          {socialLinks.map((social) => (
            <a href={social.href} key={social.id} target="_blank" rel="noreferrer" aria-label={social.label}>
              <AppIcon name={social.icon} size={20} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
