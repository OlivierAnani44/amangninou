import { useState } from "react";
import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";

const getDefaultApiBaseUrl = () => {
  const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  return isLocalHost ? `${window.location.protocol}//${window.location.hostname}:8000` : "";
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? getDefaultApiBaseUrl();

const buildWhatsAppMessage = (channels, options, template, subject, message) => {
  const whatsappChannel = channels.find((channel) => channel.id === "whatsapp");
  const subjectLabel = options.find((option) => option.value === subject)?.label ?? subject;
  const text = encodeURIComponent(
    template.replace("{subject}", subjectLabel).replace("{message}", message),
  );
  const separator = whatsappChannel?.href.includes("?") ? "&" : "?";

  return `${whatsappChannel?.href ?? "#"}${separator}text=${text}`;
};

export function ContactSection({ channels, copy }) {
  const [subject, setSubject] = useState("consultation");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");

    if (!API_BASE_URL) {
      window.location.href = buildWhatsAppMessage(
        channels,
        copy.options,
        copy.whatsappText,
        subject,
        message,
      );
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
        throw new Error(copy.fetchError);
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
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
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
            {copy.needLabel}
            <select value={subject} onChange={(event) => setSubject(event.target.value)}>
              {copy.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {copy.messageLabel}
            <textarea
              required
              rows="4"
              placeholder={copy.messagePlaceholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-action" disabled={status === "loading"}>
            <AppIcon name="MessageCircle" size={19} />
            {status === "loading" ? copy.loading : copy.submit}
          </button>
          {status === "success" ? (
            <p className="form-status form-status--success">{copy.success}</p>
          ) : null}
          {status === "error" ? (
            <p className="form-status form-status--error">{copy.error}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
