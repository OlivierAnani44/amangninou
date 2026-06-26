import { AppIcon } from "../AppIcon";

export function SiteFooter({ copy }) {
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
      </div>
    </footer>
  );
}
