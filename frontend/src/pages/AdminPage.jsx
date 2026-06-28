import { useEffect, useMemo, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { AppIcon } from "../components/AppIcon";
import {
  ADMIN_ACCESS_CODE,
  closeAdminSession,
  hasAdminSession,
  openAdminSession,
  readAdminContent,
  resetAdminContent,
  writeAdminContent,
} from "../data/adminContent";

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

const cloneItems = (items = []) => items.map((item) => ({ ...item }));

const createDraft = (content) => ({
  ownerProfile: {
    imageSrc: content.ownerProfile.imageSrc ?? "",
  },
  contact: {
    whatsappNumber: content.contactSettings.whatsappNumber,
    phoneDisplay: content.contactSettings.phoneDisplay,
    email: content.contactSettings.email,
    youtubeUrl: content.contactSettings.youtubeUrl,
    tiktokUrl: content.contactSettings.tiktokUrl,
  },
  services: cloneItems(content.services),
  products: cloneItems(content.products),
  tipVideos: cloneItems(content.tipVideos),
  ritualVideos: cloneItems(content.ritualVideos),
  testimonials: cloneItems(content.testimonials),
});

const parseList = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const listToText = (items) => (Array.isArray(items) ? items.join(", ") : "");

const normalizeNumber = (value) => String(value ?? "").replace(/\D/g, "");

const newService = () => ({
  id: createId("service"),
  title: "Nouveau service",
  label: "Conseil",
  category: "Spiritualité",
  problem: "Besoin à préciser",
  description: "Description du service.",
  points: ["Contact", "Orientation", "Suivi"],
  icon: "Sparkles",
});

const newProduct = () => ({
  id: createId("produit"),
  name: "Nouveau produit",
  category: "Rituel",
  filter: "Rituels",
  badges: ["Produit traditionnel", "Conseils inclus"],
  description: "Description du produit.",
  price: 0,
  icon: "ShoppingBag",
});

const newVideo = (prefix) => ({
  id: createId(prefix),
  title: "Nouvelle vidéo",
  tag: "Vidéo",
  description: "Description de la vidéo.",
  embedUrl: "",
  href: "",
  action: "Voir la vidéo",
});

const newTestimonial = () => ({
  name: "Initiales",
  context: "Contexte",
  quote: "Retour d’expérience du client.",
});

function AdminTextInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AdminTextarea({ label, value, onChange, placeholder }) {
  return (
    <label>
      {label}
      <textarea
        rows="3"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function AdminPage({ content }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasAdminSession);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [draft, setDraft] = useState(() => createDraft(content));
  const currentLanguage = content.language;

  useEffect(() => {
    setDraft(createDraft(content));
  }, [content]);

  const productFilters = useMemo(
    () => content.productFilters.filter((filter) => filter !== content.productFilters[0]),
    [content.productFilters],
  );

  const updateDraft = (section, field, value) => {
    setDraft((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const updateItem = (collection, index, field, value) => {
    setDraft((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = (collection, item) => {
    setDraft((current) => ({
      ...current,
      [collection]: [...current[collection], item],
    }));
  };

  const removeItem = (collection, index) => {
    setDraft((current) => ({
      ...current,
      [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleLogin = (event) => {
    event.preventDefault();

    if (code.trim() !== ADMIN_ACCESS_CODE) {
      setStatus({ type: "error", text: "Code admin incorrect." });
      return;
    }

    openAdminSession();
    setIsAuthenticated(true);
    setStatus({ type: "success", text: "Session admin ouverte." });
    setCode("");
  };

  const handleLogout = () => {
    closeAdminSession();
    setIsAuthenticated(false);
    setStatus({ type: "success", text: "Session admin fermée." });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateDraft("ownerProfile", "imageSrc", String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const currentAdminContent = readAdminContent();
    const nextContent = {
      ...currentAdminContent,
      ownerProfile: {
        ...(currentAdminContent.ownerProfile ?? {}),
        imageSrc: draft.ownerProfile.imageSrc,
      },
      contact: {
        whatsappNumber: normalizeNumber(draft.contact.whatsappNumber),
        phoneDisplay: draft.contact.phoneDisplay,
        email: draft.contact.email,
        youtubeUrl: draft.contact.youtubeUrl,
        tiktokUrl: draft.contact.tiktokUrl,
      },
      languages: {
        ...(currentAdminContent.languages ?? {}),
        [currentLanguage]: {
          services: draft.services.map((service) => ({
            ...service,
            points: Array.isArray(service.points) ? service.points : parseList(service.points),
          })),
          products: draft.products.map((product) => ({
            ...product,
            price: Number(product.price) || 0,
            badges: Array.isArray(product.badges) ? product.badges : parseList(product.badges),
          })),
          tipVideos: draft.tipVideos,
          ritualVideos: draft.ritualVideos,
          testimonials: draft.testimonials,
        },
      },
    };

    writeAdminContent(nextContent);
    setStatus({ type: "success", text: "Modifications sauvegardées dans ce navigateur." });
  };

  const handleReset = () => {
    resetAdminContent();
    setDraft(createDraft(content));
    setStatus({ type: "success", text: "Contenu personnalisé réinitialisé." });
  };

  return (
    <>
      <PageIntro intro={content.pageIntros.admin} />

      <section className="section-band section-band--white" id="admin">
        <div className="section-inner admin-layout">
          <div className="admin-topbar">
            <div>
              <span>Langue modifiée</span>
              <strong>{currentLanguage.toUpperCase()}</strong>
            </div>
            {isAuthenticated ? (
              <button className="secondary-action" type="button" onClick={handleLogout}>
                <AppIcon name="LogOut" size={18} />
                Fermer l’admin
              </button>
            ) : null}
          </div>

          {status ? <p className={`form-status form-status--${status.type}`}>{status.text}</p> : null}

          {!isAuthenticated ? (
            <form className="admin-login-panel" onSubmit={handleLogin}>
              <div>
                <h2>Connexion admin</h2>
                <p>Entrez le code administrateur pour modifier le contenu du site.</p>
              </div>
              <AdminTextInput
                label="Code admin"
                type="password"
                value={code}
                onChange={setCode}
                placeholder="Code d’accès"
              />
              <button className="primary-action" type="submit">
                <AppIcon name="LockKeyhole" size={18} />
                Entrer
              </button>
            </form>
          ) : (
            <>
              <div className="admin-actions">
                <button className="primary-action" type="button" onClick={handleSave}>
                  <AppIcon name="Save" size={18} />
                  Sauvegarder
                </button>
                <button className="danger-action" type="button" onClick={handleReset}>
                  <AppIcon name="Trash2" size={18} />
                  Réinitialiser
                </button>
              </div>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <AppIcon name="UserRound" size={22} />
                  <h2>Photo du propriétaire</h2>
                </div>
                <div className="admin-photo-grid">
                  <div className="admin-photo-preview">
                    {draft.ownerProfile.imageSrc ? (
                      <img src={draft.ownerProfile.imageSrc} alt="Portrait actuel" />
                    ) : (
                      <span>TA</span>
                    )}
                  </div>
                  <div className="admin-form-grid">
                    <label>
                      Importer une photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <AdminTextInput
                      label="URL de la photo"
                      value={draft.ownerProfile.imageSrc?.startsWith("data:") ? "" : draft.ownerProfile.imageSrc}
                      onChange={(value) => updateDraft("ownerProfile", "imageSrc", value)}
                      placeholder="images/proprietaire.jpg ou https://..."
                    />
                  </div>
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <AppIcon name="Phone" size={22} />
                  <h2>Coordonnées</h2>
                </div>
                <div className="admin-form-grid">
                  <AdminTextInput label="Numéro WhatsApp" value={draft.contact.whatsappNumber} onChange={(value) => updateDraft("contact", "whatsappNumber", value)} />
                  <AdminTextInput label="Affichage téléphone" value={draft.contact.phoneDisplay} onChange={(value) => updateDraft("contact", "phoneDisplay", value)} />
                  <AdminTextInput label="Email" value={draft.contact.email} onChange={(value) => updateDraft("contact", "email", value)} />
                  <AdminTextInput label="YouTube" value={draft.contact.youtubeUrl} onChange={(value) => updateDraft("contact", "youtubeUrl", value)} />
                  <AdminTextInput label="TikTok" value={draft.contact.tiktokUrl} onChange={(value) => updateDraft("contact", "tiktokUrl", value)} />
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <AppIcon name="ShieldCheck" size={22} />
                  <h2>Services</h2>
                </div>
                <button className="secondary-action" type="button" onClick={() => addItem("services", newService())}>
                  <AppIcon name="ShieldCheck" size={18} />
                  Ajouter un service
                </button>
                <div className="admin-list">
                  {draft.services.map((service, index) => (
                    <article className="admin-item" key={service.id}>
                      <div className="admin-item-heading">
                        <strong>{service.title}</strong>
                        <button type="button" onClick={() => removeItem("services", index)}>
                          <AppIcon name="Trash2" size={17} />
                        </button>
                      </div>
                      <div className="admin-form-grid">
                        <AdminTextInput label="Titre" value={service.title} onChange={(value) => updateItem("services", index, "title", value)} />
                        <AdminTextInput label="Badge" value={service.label} onChange={(value) => updateItem("services", index, "label", value)} />
                        <AdminTextInput label="Catégorie" value={service.category} onChange={(value) => updateItem("services", index, "category", value)} />
                        <AdminTextInput label="Problème traité" value={service.problem} onChange={(value) => updateItem("services", index, "problem", value)} />
                        <AdminTextInput label="Icône" value={service.icon} onChange={(value) => updateItem("services", index, "icon", value)} />
                        <AdminTextInput label="Points" value={listToText(service.points)} onChange={(value) => updateItem("services", index, "points", parseList(value))} />
                      </div>
                      <AdminTextarea label="Description" value={service.description} onChange={(value) => updateItem("services", index, "description", value)} />
                    </article>
                  ))}
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <AppIcon name="ShoppingBag" size={22} />
                  <h2>Produits boutique</h2>
                </div>
                <button className="secondary-action" type="button" onClick={() => addItem("products", newProduct())}>
                  <AppIcon name="ShoppingBag" size={18} />
                  Ajouter un produit
                </button>
                <div className="admin-list">
                  {draft.products.map((product, index) => (
                    <article className="admin-item" key={product.id}>
                      <div className="admin-item-heading">
                        <strong>{product.name}</strong>
                        <button type="button" onClick={() => removeItem("products", index)}>
                          <AppIcon name="Trash2" size={17} />
                        </button>
                      </div>
                      <div className="admin-form-grid">
                        <AdminTextInput label="Nom" value={product.name} onChange={(value) => updateItem("products", index, "name", value)} />
                        <AdminTextInput label="Prix" type="number" value={product.price} onChange={(value) => updateItem("products", index, "price", value)} />
                        <AdminTextInput label="Catégorie" value={product.category} onChange={(value) => updateItem("products", index, "category", value)} />
                        <label>
                          Filtre
                          <select value={product.filter} onChange={(event) => updateItem("products", index, "filter", event.target.value)}>
                            {productFilters.map((filter) => (
                              <option key={filter} value={filter}>{filter}</option>
                            ))}
                          </select>
                        </label>
                        <AdminTextInput label="Icône" value={product.icon} onChange={(value) => updateItem("products", index, "icon", value)} />
                        <AdminTextInput label="Badges" value={listToText(product.badges)} onChange={(value) => updateItem("products", index, "badges", parseList(value))} />
                      </div>
                      <AdminTextarea label="Description" value={product.description} onChange={(value) => updateItem("products", index, "description", value)} />
                    </article>
                  ))}
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <AppIcon name="CirclePlay" size={22} />
                  <h2>Vidéos Astuces</h2>
                </div>
                <button className="secondary-action" type="button" onClick={() => addItem("tipVideos", newVideo("astuce"))}>
                  <AppIcon name="CirclePlay" size={18} />
                  Ajouter une vidéo
                </button>
                <AdminVideoList items={draft.tipVideos} collection="tipVideos" updateItem={updateItem} removeItem={removeItem} />
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <AppIcon name="BookOpenText" size={22} />
                  <h2>Vidéos Rituels</h2>
                </div>
                <button className="secondary-action" type="button" onClick={() => addItem("ritualVideos", newVideo("rituel"))}>
                  <AppIcon name="CirclePlay" size={18} />
                  Ajouter une vidéo
                </button>
                <AdminVideoList items={draft.ritualVideos} collection="ritualVideos" updateItem={updateItem} removeItem={removeItem} />
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <AppIcon name="MessageCircle" size={22} />
                  <h2>Témoignages</h2>
                </div>
                <button className="secondary-action" type="button" onClick={() => addItem("testimonials", newTestimonial())}>
                  <AppIcon name="MessageCircle" size={18} />
                  Ajouter un témoignage
                </button>
                <div className="admin-list">
                  {draft.testimonials.map((testimonial, index) => (
                    <article className="admin-item" key={`${testimonial.name}-${index}`}>
                      <div className="admin-item-heading">
                        <strong>{testimonial.name}</strong>
                        <button type="button" onClick={() => removeItem("testimonials", index)}>
                          <AppIcon name="Trash2" size={17} />
                        </button>
                      </div>
                      <div className="admin-form-grid">
                        <AdminTextInput label="Nom ou initiales" value={testimonial.name} onChange={(value) => updateItem("testimonials", index, "name", value)} />
                        <AdminTextInput label="Contexte" value={testimonial.context} onChange={(value) => updateItem("testimonials", index, "context", value)} />
                      </div>
                      <AdminTextarea label="Témoignage" value={testimonial.quote} onChange={(value) => updateItem("testimonials", index, "quote", value)} />
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function AdminVideoList({ collection, items, removeItem, updateItem }) {
  return (
    <div className="admin-list">
      {items.map((video, index) => (
        <article className="admin-item" key={video.id}>
          <div className="admin-item-heading">
            <strong>{video.title}</strong>
            <button type="button" onClick={() => removeItem(collection, index)}>
              <AppIcon name="Trash2" size={17} />
            </button>
          </div>
          <div className="admin-form-grid">
            <AdminTextInput label="Titre" value={video.title} onChange={(value) => updateItem(collection, index, "title", value)} />
            <AdminTextInput label="Badge" value={video.tag} onChange={(value) => updateItem(collection, index, "tag", value)} />
            <AdminTextInput label="Lien intégré YouTube" value={video.embedUrl} onChange={(value) => updateItem(collection, index, "embedUrl", value)} placeholder="https://www.youtube.com/embed/..." />
            <AdminTextInput label="Lien public" value={video.href} onChange={(value) => updateItem(collection, index, "href", value)} placeholder="https://youtube.com/..." />
            <AdminTextInput label="Texte bouton" value={video.action} onChange={(value) => updateItem(collection, index, "action", value)} />
          </div>
          <AdminTextarea label="Description" value={video.description} onChange={(value) => updateItem(collection, index, "description", value)} />
        </article>
      ))}
    </div>
  );
}
