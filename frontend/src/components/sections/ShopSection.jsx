import { useMemo, useState } from "react";
import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";
import { formatPrice, productFilters } from "../../data/siteContent";

export function ShopSection({ cartItems, cartPulseKey, products, total, onAddProduct }) {
  const [activeFilter, setActiveFilter] = useState("Tous");
  const filteredProducts = useMemo(
    () =>
      activeFilter === "Tous"
        ? products
        : products.filter((product) => product.filter === activeFilter || product.category === activeFilter),
    [activeFilter, products],
  );
  const cartCount = cartItems.length;

  return (
    <section className="section-band section-band--white" id="boutique">
      <div className="section-inner">
        <SectionHeader
          eyebrow="Boutique"
          title="Produits spirituels et traditionnels"
          description="Filtrez par besoin, vérifiez les précautions et ajoutez au panier uniquement ce qui vous intéresse."
        />

        <div className="filter-strip" aria-label="Filtres boutique">
          {productFilters.map((filter) => (
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
                    <strong>{formatPrice(product.price)}</strong>
                    <button type="button" className="compact-action" onClick={() => onAddProduct(product)}>
                      <AppIcon name="ShoppingBag" size={17} />
                      Ajouter
                    </button>
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
                <strong>Panier</strong>
                <span>{cartCount > 1 ? `${cartCount} articles` : `${cartCount} article`}</span>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <p>Aucun produit ajouté pour le moment.</p>
            ) : (
              <ul>
                {cartItems.map((item, index) => (
                  <li key={`${item.id}-${index}`}>
                    <span>{item.name}</span>
                    <strong>{formatPrice(item.price)}</strong>
                  </li>
                ))}
              </ul>
            )}

            <div className="cart-total">
              <span>Total indicatif</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <a className="primary-action" href="#contact">
              Finaliser par contact
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
