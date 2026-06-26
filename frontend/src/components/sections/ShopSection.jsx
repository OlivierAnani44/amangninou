import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";
import { buildWhatsAppUrl, formatMessageTemplate, formatPrice } from "../../data/siteContent";

export function ShopSection({
  cartItems,
  cartPulseKey,
  contactSettings,
  copy,
  filters,
  locale,
  products,
  total,
  onAddProduct,
}) {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const filteredProducts = useMemo(
    () =>
      activeFilter === filters[0]
        ? products
        : products.filter((product) => product.filter === activeFilter || product.category === activeFilter),
    [activeFilter, filters, products],
  );
  const translatedCartItems = useMemo(
    () =>
      cartItems.map((item) => products.find((product) => product.id === item.id) ?? item),
    [cartItems, products],
  );
  const cartMessage = useMemo(() => {
    const items = translatedCartItems
      .map((item) => `- ${item.name} : ${formatPrice(item.price, locale)}`)
      .join("\n");

    return formatMessageTemplate(copy.checkoutText, {
      items,
      total: formatPrice(total, locale),
    });
  }, [copy.checkoutText, locale, total, translatedCartItems]);
  const cartCount = cartItems.length;

  useEffect(() => {
    setActiveFilter(filters[0]);
  }, [filters]);

  return (
    <section className="section-band section-band--white" id="boutique">
      <div className="section-inner">
        <SectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <div className="filter-strip" aria-label={copy.filtersLabel}>
          {filters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              className={activeFilter === filter ? "is-active" : undefined}
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="shop-layout">
          <div className="product-grid" key={activeFilter}>
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-visual" data-filter={product.filter}>
                  <span>
                    <AppIcon name={product.icon} size={36} />
                  </span>
                </div>
                <div className="product-info">
                  <span className="card-label">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="badge-row">
                    {product.badges.map((badge) => (
                      <span key={badge}>{badge}</span>
                    ))}
                  </div>
                  <div className="product-footer">
                    <strong>{formatPrice(product.price, locale)}</strong>
                    <a
                      className="compact-action"
                      href={buildWhatsAppUrl(
                        formatMessageTemplate(copy.buyProductText, {
                          product: product.name,
                          price: formatPrice(product.price, locale),
                          category: product.category,
                        }),
                        contactSettings?.whatsappNumber,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onAddProduct(product)}
                    >
                      <AppIcon name="ShoppingBag" size={17} />
                      {copy.add}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside
            className={cartPulseKey > 0 ? "cart-panel is-updated" : "cart-panel"}
            aria-live="polite"
            key={cartPulseKey}
          >
            <div className="cart-panel-heading">
                <AppIcon name="ShoppingBag" size={22} />
              <div>
                <strong>{copy.cart}</strong>
                <span>{cartCount > 1 ? `${cartCount} ${copy.articles}` : `${cartCount} ${copy.article}`}</span>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <p>{copy.emptyCart}</p>
            ) : (
              <ul>
                {translatedCartItems.map((item, index) => (
                  <li key={`${item.id}-${index}`}>
                    <span>{item.name}</span>
                    <strong>{formatPrice(item.price, locale)}</strong>
                  </li>
                ))}
              </ul>
            )}

            <div className="cart-total">
              <span>{copy.total}</span>
              <strong>{formatPrice(total, locale)}</strong>
            </div>
            <a
              className="primary-action"
              href={cartItems.length > 0 ? buildWhatsAppUrl(cartMessage, contactSettings?.whatsappNumber) : "#boutique"}
              target={cartItems.length > 0 ? "_blank" : undefined}
              rel={cartItems.length > 0 ? "noreferrer" : undefined}
            >
              {copy.checkout}
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
