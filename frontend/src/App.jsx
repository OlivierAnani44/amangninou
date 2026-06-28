import { useCallback, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { SiteFooter } from "./components/sections/SiteFooter";
import { useActiveTab } from "./hooks/useActiveTab";
import { useDailyFezanNotifications } from "./hooks/useDailyFezanNotifications";
import { useLanguagePreference } from "./hooks/useLanguagePreference";
import { useThemeMode } from "./hooks/useThemeMode";
import { AiPage } from "./pages/AiPage";
import { AdminPage } from "./pages/AdminPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { RitualsPage } from "./pages/RitualsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ShopPage } from "./pages/ShopPage";
import { TestimonialsPage } from "./pages/TestimonialsPage";
import { TipsPage } from "./pages/TipsPage";
import { buildWhatsAppUrl, supportedLanguages } from "./data/siteContent";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const { content, language, changeLanguage } = useLanguagePreference();
  const activeTab = useActiveTab(content.navigationItems);
  const { isDarkMode, themeMode, toggleThemeMode } = useThemeMode();
  const dailyFezanNotifications = useDailyFezanNotifications();

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((current) => !current), []);

  const addProductToCart = useCallback((product) => {
    setCart((currentCart) => [...currentCart, product]);
    setCartPulseKey((currentKey) => currentKey + 1);
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((total, product) => total + product.price, 0),
    [cart],
  );
  const whatsappHref = useMemo(
    () => buildWhatsAppUrl(content.app.whatsappMessage, content.contactSettings.whatsappNumber),
    [content.app.whatsappMessage, content.contactSettings.whatsappNumber],
  );

  const pages = {
    accueil: <HomePage content={content} />,
    ia: <AiPage content={content} dailyNotifications={dailyFezanNotifications} />,
    services: <ServicesPage content={content} />,
    astuces: <TipsPage content={content} />,
    temoignages: <TestimonialsPage content={content} />,
    boutique: (
      <ShopPage
        cartItems={cart}
        cartPulseKey={cartPulseKey}
        content={content}
        total={cartTotal}
        onAddProduct={addProductToCart}
      />
    ),
    rituel: <RitualsPage content={content} />,
    profil: <ProfilePage content={content} />,
    contact: <ContactPage content={content} />,
    admin: <AdminPage content={content} />,
  };

  return (
    <AppShell
      activeTabId={activeTab}
      menuOpen={menuOpen}
      navigationItems={content.navigationItems}
      primaryTabIds={content.primaryTabIds}
      secondaryNavigationItems={content.secondaryNavigationItems}
      appCopy={content.app}
      isDarkMode={isDarkMode}
      language={language}
      languages={supportedLanguages}
      themeMode={themeMode}
      whatsappHref={whatsappHref}
      onLanguageChange={changeLanguage}
      onCloseMenu={closeMenu}
      onToggleTheme={toggleThemeMode}
      onToggleMenu={toggleMenu}
    >
      <main className="tab-page" key={activeTab}>
        {pages[activeTab] ?? pages.accueil}
      </main>
      <SiteFooter copy={content.footer} socialLinks={content.footerLinks} />
    </AppShell>
  );
}

export default App;
