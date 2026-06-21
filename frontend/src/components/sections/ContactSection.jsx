import { useState } from "react";
import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

const getDefaultApiBaseUrl = () => {
  const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  return isLocalHost ? `${window.location.protocol}//${window.location.hostname}:8000` : "";
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? getDefaultApiBaseUrl();

const buildWhatsAppMessage = (channels, subject, message) => {
  const whatsappChannel = channels.find((channel) => channel.label === "WhatsApp");
  const text = encodeURIComponent(`Bonjour, je souhaite une information.\nBesoin: ${subject}\nMessage: ${message}`);
  const separator = whatsappChannel?.href.includes("?") ? "&" : "?";

  return `${whatsappChannel?.href ?? "#"}${separator}text=${text}`;
};

export function ContactSection({ channels }) {
  const [subject, setSubject] = useState("consultation");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");

    if (!API_BASE_URL) {
      window.location.href = buildWhatsAppMessage(channels, subject, message);
      setStatus("idle");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (!response.ok) {
        throw new Error("La demande n'a pas pu être envoyée");
      }

      setStatus("success");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="section-band section-band--contact" id="contact">
      <div className="section-inner contact-layout">
        <SectionHeader
          eyebrow="Contact"
          title="Un premier échange avant toute démarche"
          description="Posez votre question, demandez une consultation ou vérifiez un produit avant achat."
        />

        <div className="contact-grid">
          {channels.map((channel) => (
            <a className="contact-card" href={channel.href} key={channel.label}>
              <AppIcon name={channel.icon} size={24} />
              <span>{channel.label}</span>
              <strong>{channel.value}</strong>
            </a>
          ))}
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Votre besoin
            <select value={subject} onChange={(event) => setSubject(event.target.value)}>
              <option value="consultation">Consultation spirituelle</option>
              <option value="boutique">Question boutique</option>
              <option value="rituel">Information sur un rituel</option>
              <option value="profil">Compte ou sécurité</option>
            </select>
          </label>
          <label>
            Message
            <textarea
              required
              rows="4"
              placeholder="Expliquez brièvement votre demande"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-action" disabled={status === "loading"}>
            <AppIcon name="MessageCircle" size={19} />
            {status === "loading" ? "Envoi..." : "Préparer le message"}
          </button>
          {status === "success" ? (
            <p className="form-status form-status--success">Demande préparée avec succès.</p>
          ) : null}
          {status === "error" ? (
            <p className="form-status form-status--error">
              Le message n’a pas pu être envoyé. Réessayez ou utilisez WhatsApp.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
