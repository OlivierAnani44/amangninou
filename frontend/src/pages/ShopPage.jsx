import { PageIntro } from "../components/PageIntro";
import { ShopSection } from "../components/sections/ShopSection";

export function ShopPage({ cartItems, cartPulseKey, content, total, onAddProduct }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.boutique} />
      <ShopSection
        cartItems={cartItems}
        cartPulseKey={cartPulseKey}
        copy={content.shopSection}
        filters={content.productFilters}
        locale={content.locale}
        products={content.products}
        total={total}
        onAddProduct={onAddProduct}
      />
    </>
  );
}
