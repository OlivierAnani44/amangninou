import { AppIcon } from "../AppIcon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-inner footer-inner">
        <a className="brand footer-brand" href="#accueil">
          <span className="brand-symbol">
            <AppIcon name="Leaf" size={20} />
          </span>
          <span>Amangninou</span>
        </a>
        <p>
          Spiritualité africaine, plantes traditionnelles et accompagnement
          responsable. Les informations de bien-être ne remplacent pas un avis médical.
        </p>
      </div>
    </footer>
  );
}
