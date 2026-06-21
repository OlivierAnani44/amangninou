import { PageIntro } from "../components/PageIntro";
import { ShopSection } from "../components/sections/ShopSection";
import { pageIntros, products } from "../data/siteContent";

export function ShopPage({ cartItems, cartPulseKey, total, onAddProduct }) {
  return (
    <>
      <PageIntro intro={pageIntros.boutique} />
      <ShopSection
        cartItems={cartItems}
        cartPulseKey={cartPulseKey}
        products={products}
        total={total}
        onAddProduct={onAddProduct}
      />
    </>
  );
}
