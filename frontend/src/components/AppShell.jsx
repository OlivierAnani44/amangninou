import { useEffect } from "react";
import { AppIcon } from "./AppIcon";

export function AppShell({
  activeTabId,
  children,
  menuOpen,
  navigationItems,
  primaryTabIds,
  secondaryNavigationItems,
  appCopy,
  isDarkMode,
  language,
  languages,
  themeMode,
  whatsappHref,
  onLanguageChange,
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

        <nav className="desktop-nav" aria-label={appCopy.mainNavigation}>
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
          {appCopy.contact}
        </a>

        <label className="language-select" title={appCopy.languageLabel}>
          <AppIcon name="Languages" size={18} />
          <span className="sr-only">{appCopy.languageAria}</span>
          <select
            aria-label={appCopy.languageAria}
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.shortLabel}
              </option>
            ))}
          </select>
        </label>

        <button
          className="icon-button theme-toggle"
          type="button"
          aria-label={isDarkMode ? appCopy.enableLightMode : appCopy.enableDarkMode}
          aria-pressed={isDarkMode}
          title={isDarkMode ? appCopy.lightMode : appCopy.darkMode}
          onClick={onToggleTheme}
        >
          <AppIcon name={isDarkMode ? "Sun" : "Moon"} size={22} />
        </button>

        <button
          className="icon-button menu-toggle"
          type="button"
          aria-label={menuOpen ? appCopy.closeMenu : appCopy.openMenu}
          aria-expanded={menuOpen}
          title={menuOpen ? appCopy.closeMenu : appCopy.openMenu}
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
          <span>{themeMode === "dark" ? appCopy.lightMode : appCopy.darkMode}</span>
        </button>

        <label className="menu-language-select">
          <AppIcon name="Languages" size={18} />
          <span>{appCopy.languageLabel}</span>
          <select
            aria-label={appCopy.languageAria}
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <nav className="menu-list" aria-label={appCopy.mobileNavigation}>
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

      <a className="floating-ai" href="#ia" aria-label={appCopy.ai}>
        <AppIcon name="Bot" size={23} />
      </a>

      <a className="floating-whatsapp" href={whatsappHref} aria-label={appCopy.whatsapp}>
        <AppIcon name="MessageCircle" size={23} />
      </a>

      <nav className="bottom-tabbar" aria-label={appCopy.mainTabs}>
        {primaryTabItems.map((item) => (
          <a
            aria-current={activeTabId === item.id ? "page" : undefined}
            className={activeTabId === item.id ? "is-active" : undefined}
            href={item.href}
            key={item.id}
          >
            <AppIcon name={item.icon} size={20} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
