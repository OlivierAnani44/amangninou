import { useEffect } from "react";
import { AppIcon } from "./AppIcon";

export function AppShell({
  activeTabId,
  children,
  menuOpen,
  navigationItems,
  primaryTabIds,
  secondaryNavigationItems,
  isDarkMode,
  themeMode,
  whatsappHref,
  onCloseMenu,
  onToggleTheme,
  onToggleMenu,
}) {
  const primaryTabItems = navigationItems.filter((item) => primaryTabIds.includes(item.id));

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onCloseMenu();
      }
    };

    document.body.classList.toggle("menu-open", menuOpen);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, onCloseMenu]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#accueil" onClick={onCloseMenu}>
          <span className="brand-symbol">
            <AppIcon name="Leaf" size={20} />
          </span>
          <span>Amangninou</span>
        </a>

        <nav className="desktop-nav" aria-label="Navigation principale">
          {primaryTabItems.map((item) => (
            <a
              aria-current={activeTabId === item.id ? "page" : undefined}
              className={activeTabId === item.id ? "is-active" : undefined}
              key={item.id}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          aria-current={activeTabId === "contact" ? "page" : undefined}
          className={activeTabId === "contact" ? "contact-link is-active" : "contact-link"}
          href="#contact"
          onClick={onCloseMenu}
        >
          Contact
        </a>

        <button
          className="icon-button theme-toggle"
          type="button"
          aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          aria-pressed={isDarkMode}
          title={isDarkMode ? "Mode clair" : "Mode sombre"}
          onClick={onToggleTheme}
        >
          <AppIcon name={isDarkMode ? "Sun" : "Moon"} size={22} />
        </button>

        <button
          className="icon-button menu-toggle"
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          title={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={onToggleMenu}
        >
          <AppIcon name={menuOpen ? "X" : "Menu"} size={24} />
        </button>
      </header>

      <div
        className={menuOpen ? "menu-backdrop is-visible" : "menu-backdrop"}
        onClick={onCloseMenu}
      />

      <aside className={menuOpen ? "side-menu is-open" : "side-menu"}>
        <div className="menu-heading">
          <span className="brand-symbol">
            <AppIcon name="Leaf" size={20} />
          </span>
          <strong>Amangninou</strong>
        </div>

        <button
          className="menu-theme-toggle"
          type="button"
          aria-pressed={isDarkMode}
          onClick={onToggleTheme}
        >
          <AppIcon name={isDarkMode ? "Sun" : "Moon"} size={18} />
          <span>{themeMode === "dark" ? "Mode clair" : "Mode sombre"}</span>
        </button>

        <nav className="menu-list" aria-label="Navigation mobile">
          {secondaryNavigationItems.map((item, index) => (
            <a
              aria-current={activeTabId === item.id || item.href === `#${activeTabId}` ? "page" : undefined}
              className={activeTabId === item.id || item.href === `#${activeTabId}` ? "is-active" : undefined}
              key={item.id}
              href={item.href}
              onClick={onCloseMenu}
              style={{ "--item-index": `${index}` }}
            >
              <AppIcon name={item.icon} size={19} />
              <span>{item.label}</span>
              <AppIcon name="ChevronRight" size={17} className="menu-chevron" />
            </a>
          ))}
        </nav>
      </aside>

      {children}

      <a className="floating-whatsapp" href={whatsappHref} aria-label="Contacter sur WhatsApp">
        <AppIcon name="MessageCircle" size={23} />
      </a>

      <nav className="bottom-tabbar" aria-label="Onglets principaux">
        {primaryTabItems.map((item) => (
          <a
            aria-current={activeTabId === item.id ? "page" : undefined}
            className={activeTabId === item.id ? "is-active" : undefined}
            href={item.href}
            key={item.id}
          >
            <AppIcon name={item.icon} size={20} />
            <span>{item.label.replace("Nos ", "")}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
