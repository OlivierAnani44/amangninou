import { useState } from "react";
import { AppIcon } from "../AppIcon";
import { SectionHeader } from "../SectionHeader";
import { buildWhatsAppUrl } from "../../data/siteContent";

const buildWhatsAppMessage = (options, template, subject, message, whatsappNumber) => {
  const subjectLabel = options.find((option) => option.value === subject)?.label ?? subject;
  const text = template.replace("{subject}", subjectLabel).replace("{message}", message);

  return buildWhatsAppUrl(text, whatsappNumber);
};

export function ContactSection({ channels, contactSettings, copy, socialLinks = [] }) {
  const [subject, setSubject] = useState("consultation");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    window.location.href = buildWhatsAppMessage(
      copy.options,
      copy.whatsappText,
      subject,
      message,
      contactSettings?.whatsappNumber,
    );
    setStatus("idle");
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

        <div className="contact-socials">
          {socialLinks.map((social) => (
            <a href={social.href} key={social.id} target="_blank" rel="noreferrer">
              <AppIcon name={social.icon} size={22} />
              <span>{social.label}</span>
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
