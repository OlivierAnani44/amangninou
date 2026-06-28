import { useEffect, useMemo, useRef, useState } from "react";
import { AppIcon } from "../components/AppIcon";
import { buildAiSiteContext } from "../data/siteContent";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const urlPattern = /(https?:\/\/[^\s]+)/g;

function MessageText({ text }) {
  return String(text || "")
    .split(urlPattern)
    .map((part, index) => {
      if (!part.match(urlPattern)) {
        return part;
      }

      const isWhatsApp = part.includes("wa.me/");

      return (
        <a href={part} key={`${part}-${index}`} target="_blank" rel="noreferrer">
          {isWhatsApp ? "Contacter sur WhatsApp" : part}
        </a>
      );
    });
}

const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000";
  }

  const { hostname, protocol } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://127.0.0.1:8000";
  }

  if (hostname.endsWith("github.io")) {
    return "";
  }

  return `${protocol}//${hostname}:8000`;
};

export function AiPage({ content, dailyNotifications }) {
  const copy = content.aiSection;
  const feedRef = useRef(null);
  const audioRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [status, setStatus] = useState("ready");

  const apiBaseUrl = useMemo(getApiBaseUrl, []);
  const siteContext = useMemo(() => buildAiSiteContext(content), [content]);
  const hasConversation = messages.length > 0 || isLoading;

  useEffect(() => {
    if (!feedRef.current) {
      return;
    }

    feedRef.current.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const stopAudio = () => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  };

  const playAudio = (audioB64) => {
    if (!audioB64) {
      return;
    }

    stopAudio();
    const audio = new Audio(`data:audio/mpeg;base64,${audioB64}`);
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  const askAi = async (question) => {
    const message = question.trim();

    if (!message) {
      return;
    }

    stopAudio();

    if (isLoading) {
      return;
    }

    setInput("");
    setIsLoading(true);
    setStatus("thinking");
    setMessages((current) => [
      ...current,
      {
        id: makeId(),
        role: "user",
        text: message,
      },
    ]);

    try {
      if (!apiBaseUrl) {
        throw new Error("AI backend unavailable");
      }

      const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          tts: voiceEnabled,
          site_context: siteContext,
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const payload = await response.json();
      const answer = payload.answer || copy.error;

      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          text: answer,
        },
      ]);

      if (voiceEnabled) {
        playAudio(payload.audio_b64);
      }

      setStatus("ready");
    } catch (error) {
      setStatus("offline");
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "error",
          text: copy.error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askAi(input);
  };

  const statusLabel =
    status === "thinking"
      ? copy.statusThinking
      : status === "offline"
        ? copy.statusOffline
        : copy.statusReady;
  const notificationsBlocked = dailyNotifications?.permission === "denied";
  const notificationButtonLabel = notificationsBlocked
    ? copy.dailyNotificationDenied
    : dailyNotifications?.isEnabled
      ? copy.dailyNotificationActive
      : copy.dailyNotificationLabel;

  return (
    <section className="ai-gemini-page" id="ia-chat">
      <div className="section-inner ai-gemini-shell">
        <header className="ai-gemini-topbar">
          <a href="#accueil" className="ai-gemini-brand">
            <span>
              <AppIcon name="Bot" size={20} />
            </span>
            Amangninou IA
          </a>

          <div className="ai-gemini-controls">
            <span className={`ai-status ai-status--${status}`}>
              <i />
              {statusLabel}
            </span>
            <button
              className={voiceEnabled ? "ai-voice-chip is-active" : "ai-voice-chip"}
              type="button"
              aria-pressed={voiceEnabled}
              title={copy.voiceLabel}
              onClick={() => {
                if (voiceEnabled) {
                  stopAudio();
                }
                setVoiceEnabled((current) => !current);
              }}
            >
              <AppIcon name={voiceEnabled ? "MessagesSquare" : "MessageCircle"} size={17} />
              <span>{copy.ttsLabel}</span>
            </button>
            <button
              className={dailyNotifications?.isEnabled ? "ai-notification-chip is-active" : "ai-notification-chip"}
              type="button"
              aria-pressed={Boolean(dailyNotifications?.isEnabled)}
              disabled={!dailyNotifications?.isSupported || notificationsBlocked}
              onClick={() => {
                if (dailyNotifications?.isEnabled) {
                  dailyNotifications.disable();
                  return;
                }

                dailyNotifications?.enable();
              }}
            >
              <AppIcon name="BellRing" size={17} />
              <span>{notificationButtonLabel}</span>
            </button>
          </div>
        </header>

        {!hasConversation ? (
          <div className="ai-gemini-home">
            <p className="section-eyebrow">{copy.eyebrow}</p>
            <h1>{copy.greeting}</h1>
            <p>{copy.description}</p>

            <div className="ai-suggestion-grid">
              {copy.quickQuestions.map((question) => (
                <button type="button" key={question} onClick={() => askAi(question)}>
                  <span>{question}</span>
                  <AppIcon name="Sparkles" size={18} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ai-gemini-feed" ref={feedRef} aria-live="polite">
            {messages.map((message) => (
              <article className={`ai-turn ai-turn--${message.role}`} key={message.id}>
                <span className="ai-turn-avatar">
                  <AppIcon
                    name={message.role === "user" ? "UserRound" : message.role === "error" ? "CircleEllipsis" : "Bot"}
                    size={18}
                  />
                </span>
                <div>
                  <p>
                    <MessageText text={message.text} />
                  </p>
                </div>
              </article>
            ))}

            {isLoading ? (
              <article className="ai-turn ai-turn--assistant ai-turn--loading">
                <span className="ai-turn-avatar">
                  <AppIcon name="Bot" size={18} />
                </span>
                <div>
                  <p>{copy.loading}</p>
                </div>
              </article>
            ) : null}
          </div>
        )}

        <form className="ai-gemini-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="ai-question">
            {copy.inputLabel}
          </label>
          <textarea
            id="ai-question"
            value={input}
            placeholder={copy.placeholder}
            rows={1}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                askAi(input);
              }
            }}
          />
          <button type="submit" disabled={isLoading || !input.trim()} aria-label={copy.send}>
            <AppIcon name="ChevronRight" size={22} />
          </button>
        </form>

        <p className="ai-gemini-note">{copy.disclaimer}</p>
      </div>
    </section>
  );
}
