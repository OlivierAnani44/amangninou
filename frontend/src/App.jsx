import { useCallback, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { SiteFooter } from "./components/sections/SiteFooter";
import { useActiveTab } from "./hooks/useActiveTab";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { RitualsPage } from "./pages/RitualsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ShopPage } from "./pages/ShopPage";
import { TestimonialsPage } from "./pages/TestimonialsPage";
import {
  contactChannels,
  navigationItems,
  primaryTabIds,
  secondaryNavigationItems,
} from "./data/siteContent";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const activeTab = useActiveTab(navigationItems);

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

  const pages = {
    accueil: <HomePage />,
    services: <ServicesPage />,
    temoignages: <TestimonialsPage />,
    boutique: (
      <ShopPage
        cartItems={cart}
        cartPulseKey={cartPulseKey}
        total={cartTotal}
        onAddProduct={addProductToCart}
      />
    ),
    rituel: <RitualsPage />,
    profil: <ProfilePage />,
    contact: <ContactPage />,
  };

  return (
    <AppShell
      activeTabId={activeTab}
      menuOpen={menuOpen}
      navigationItems={navigationItems}
      primaryTabIds={primaryTabIds}
      secondaryNavigationItems={secondaryNavigationItems}
      whatsappHref={contactChannels[0].href}
      onCloseMenu={closeMenu}
      onToggleMenu={toggleMenu}
    >
      <main className="tab-page" key={activeTab}>
        {pages[activeTab] ?? pages.accueil}
      </main>
      <SiteFooter />
    </AppShell>
  );
}

export default App;
