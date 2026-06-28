from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, urlparse
from pathlib import Path
import asyncio
import base64
from datetime import date
import json
import os
import re
import sys
import tempfile
import time
import unicodedata


HOST = "0.0.0.0"
PORT = 8000

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MARK_ROOT = PROJECT_ROOT / "Mark-XLVI-main"
AI_VOICE = "fr-FR-HenriNeural"
AI_SCOPE_NAME = "Amangninou IA"
AI_APPLICATION_MODE = "site_and_fezan_knowledge"
WHATSAPP_NUMBER = "22870515141"
PHONE_DISPLAY = "+228 70 51 51 41"
OWNER_EMAIL = "togbeamangninou0@gmail.com"
YOUTUBE_URL = "https://m.youtube.com/channel/UCVZH80MU774K2ROUuXFwYsA"
TIKTOK_URL = "https://www.tiktok.com/@togbe.amangninou8"

if MARK_ROOT.exists() and str(MARK_ROOT) not in sys.path:
    sys.path.insert(0, str(MARK_ROOT))

ALLOWED_ORIGINS = {
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:4173",
    "http://localhost:4173",
}

SERVICES = [
    {
        "title": "Consultation spirituelle",
        "label": "Diagnostic",
        "description": "Échange confidentiel pour comprendre la situation et orienter la démarche.",
    },
    {
        "title": "Protection et purification",
        "label": "Rituel",
        "description": "Accompagnement traditionnel pour purifier un lieu ou renforcer une protection.",
    },
    {
        "title": "Couple et affection",
        "label": "Relation",
        "description": "Écoute et orientation autour des blocages affectifs et familiaux.",
    },
    {
        "title": "Plantes traditionnelles",
        "label": "Bien-être",
        "description": "Présentation prudente de plantes et préparations traditionnelles.",
    },
]

PRODUCTS = [
    {"id": "purification-maison", "name": "Pack purification maison", "price": 12000},
    {"id": "bain-protection", "name": "Bain de protection", "price": 9500},
    {"id": "infusion-bien-etre", "name": "Infusion bien-être", "price": 6500},
    {"id": "encens-rituel", "name": "Encens rituel", "price": 5000},
]

RITUALS = [
    {"name": "Fa", "subtitle": "Géomancie et orientation"},
    {"name": "Dan", "subtitle": "Équilibre et force vitale"},
    {"name": "Sakpata", "subtitle": "Terre, protection, responsabilité"},
    {"name": "Hebiesso", "subtitle": "Feu, justice, décision"},
    {"name": "Autres rituels", "subtitle": "Selon la situation"},
]

TESTIMONIALS = [
    {"name": "A. K.", "context": "Accompagnement personnel"},
    {"name": "M. D.", "context": "Conseil autour du couple"},
    {"name": "S. F.", "context": "Produit traditionnel"},
]

SITE_PAYLOAD = {
    "name": "Amangninou",
    "title": "Togbe Amangninou",
    "subtitle": "Spiritualité africaine, plantes et accompagnement traditionnel",
    "navigation": ["Accueil", "Nos services", "Témoignages", "Boutique", "Rituel", "Profil"],
    "services": SERVICES,
    "products": PRODUCTS,
    "rituals": RITUALS,
    "testimonials": TESTIMONIALS,
    "security": [
        "Chiffrement prévu pour les données sensibles",
        "Protection contre les fraudes et abus",
        "Double authentification facultative",
    ],
}


def _clean_tts_text(text):
    return re.sub(r"\s+", " ", str(text or "").replace("**", "").replace("*", "").replace("#", "").replace("`", " ")).strip()


def _build_ai_whatsapp_url(question="", number=None):
    question = str(question or "").strip()
    normalized_number = re.sub(r"\D+", "", str(number or WHATSAPP_NUMBER)) or WHATSAPP_NUMBER
    message = "Bonjour Togbe Amangninou, je souhaite avoir plus d'informations."
    if question:
        message = f"{message}\nQuestion : {question[:320]}"

    return f"https://wa.me/{normalized_number}?text={quote(message)}"


def _append_whatsapp_followup(answer, question="", site_context=None):
    answer = str(answer or "").strip()
    if "wa.me/" in answer:
        return answer

    contact = _site_contact(site_context)
    return (
        f"{answer}\n\n"
        f"Pour plus d'informations, contactez Togbe Amangninou sur WhatsApp : "
        f"{_build_ai_whatsapp_url(question, contact.get('whatsappNumber'))}"
    )


def _append_tts_followup(answer):
    answer = str(answer or "").strip()
    return f"{answer}\n\nPour plus d'informations, contactez Togbe Amangninou sur WhatsApp."


def _fezan_day_payload(target_date=None):
    try:
        from cerveau_IA.pdf_knowledge import (
            FEZAN_DAY_DEFINITIONS,
            MONTH_NAMES,
            WEEKDAY_NAMES,
            _fezan_day_for_date,
        )
    except Exception as exc:
        print(f"[IA] Donnees Fezan du jour indisponibles: {exc}")
        return None

    target_date = target_date or date.today()

    try:
        found = _fezan_day_for_date(target_date.day, target_date.month, target_date.year)
    except Exception as exc:
        print(f"[IA] Lecture Fezan du jour impossible: {exc}")
        return None

    if not found:
        return None

    day_label, kind = found
    info = FEZAN_DAY_DEFINITIONS.get(day_label, {})
    weekday = WEEKDAY_NAMES[target_date.weekday()]
    month = MONTH_NAMES[target_date.month]
    date_label = f"{weekday.capitalize()} {target_date.day} {month} {target_date.year}"
    definition = info.get("definition", "Définition non trouvée dans la base Fezan.")
    if definition:
        definition = definition[0].upper() + definition[1:]
    uses = info.get("uses", "")
    question = f"Quel est le type Fezan du {date_label} ?"

    body = f"{date_label} : {day_label}, jour {kind}. {definition}"
    if len(body) > 260:
        body = f"{body[:257].rstrip()}..."

    return {
        "date": target_date.isoformat(),
        "date_label": date_label,
        "day_label": day_label,
        "kind": kind,
        "definition": definition,
        "uses": uses,
        "title": f"Fezan du jour : {day_label}",
        "body": body,
        "whatsapp_url": _build_ai_whatsapp_url(question),
    }


def _fallback_ai_answer(question):
    question_preview = str(question or "").strip()
    if len(question_preview) > 110:
        question_preview = question_preview[:107].rstrip() + "..."

    return (
        "Je suis Amangninou IA Fezan. Je réponds uniquement sur le Fezan : calendrier, dates, "
        "jours favorables ou défavorables, types de jours et usages Fezan. "
        "Je n'ai pas assez d'informations dans ma base Fezan pour répondre clairement à cette demande. "
        "Pour une orientation plus précise, contactez Togbe Amangninou. "
        f"Demande reçue : {question_preview}"
    )


def _fallback_ai_answer(question):
    question_preview = str(question or "").strip()
    if len(question_preview) > 110:
        question_preview = question_preview[:107].rstrip() + "..."

    return (
        "Je suis Amangninou IA. Je reponds sur le Fezan et sur les informations du site : "
        "services, boutique, rituels, videos, temoignages, contact et profil. "
        "Je n'ai pas assez d'informations dans ma base actuelle pour repondre clairement a cette demande. "
        "Pour une orientation plus precise, contactez Togbe Amangninou. "
        f"Demande recue : {question_preview}"
    )


def _coerce_ai_answer(answer):
    if isinstance(answer, (list, tuple)) and answer:
        answer = answer[0]

    if isinstance(answer, dict):
        answer = answer.get("answer") or answer.get("text") or answer.get("message") or ""

    return str(answer or "").strip()


def _plain_text(text):
    normalized = unicodedata.normalize("NFKD", str(text or "").lower())
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = normalized.replace("’", "'").replace("â€™", "'")
    normalized = re.sub(r"[^a-z0-9']+", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def _safe_import_fezan_tables():
    try:
        from cerveau_IA.pdf_knowledge import FEZAN_DAY_ALIASES, FEZAN_DAY_DEFINITIONS, FEZAN_DAY_ORDER

        return FEZAN_DAY_ALIASES, FEZAN_DAY_DEFINITIONS, FEZAN_DAY_ORDER
    except Exception as exc:
        print(f"[IA] Tables Fezan indisponibles: {exc}")
        return None, None, None


def _safe_import_social_answer():
    try:
        from cerveau_IA.pdf_knowledge import answer_social_message

        return answer_social_message
    except Exception as exc:
        print(f"[IA] Reponses sociales indisponibles: {exc}")
        return None


def _is_social_or_friendly_question(question):
    plain = _plain_text(question)
    tokens = set(plain.split())
    if not tokens:
        return False

    greetings = {"cc", "bjr", "bsr", "slt", "salut", "bonjour", "bonsoir", "coucou", "hello", "yo", "salam", "hey"}
    thanks = {"merci", "thanks", "remercie"}
    farewells = {"bye", "revoir", "aurevoir", "adieu", "ciao"}
    friends = {"ami", "amie", "amis", "amies", "frere", "soeur", "pote", "copain", "copine"}
    feelings = {"bien", "mal", "fatigue", "fatiguee", "triste", "content", "contente"}
    affection = {"aime", "apprecie", "adore"}
    politeness = {"stp", "svp", "please", "pardon", "desole", "desolee"}
    information_terms = {
        "fezan", "jour", "jours", "type", "date", "calendrier", "favorable", "defavorable",
        "aujourd'hui", "aujourdhui", "hier", "demain", "mois", "semaine", "definition",
        "boutique", "produit", "service", "rituel", "prix", "acheter", "contact",
        "whatsapp", "video", "videos", "astuce", "astuces", "temoignage",
        "temoignages", "profil", "compte",
    }

    asks_how_are_you = (
        (("comment" in tokens or "cmnt" in tokens) and ({"vas", "va", "allez"} & tokens))
        or "cv" in tokens
        or ({"ca", "sa"} & tokens and "va" in tokens)
    )
    asks_identity = ({"qui", "nom", "appelle", "appel"} & tokens) and ({"tu", "toi", "t"} & tokens)
    asks_friendship = bool(tokens & friends) or bool(re.search(r"\b(on|nous)\s+peut\s+etre\s+ami", plain))
    asks_familiarity = (
        "tutoyer" in tokens
        or "tutoie" in tokens
        or ("parle" in tokens and {"simplement", "familier", "familiere"} & tokens)
        or ("fais" in tokens and {"connaissance", "ami"} & tokens)
    )
    social_marker = bool(tokens & (greetings | thanks | farewells | friends | feelings | affection | politeness))

    if (tokens & information_terms) and len(tokens) > 3:
        return False

    return bool(
        asks_how_are_you
        or asks_identity
        or asks_friendship
        or asks_familiarity
        or (social_marker and len(tokens) <= 6)
    )


def _social_ai_answer(question):
    if not _is_social_or_friendly_question(question):
        return None

    plain = _plain_text(question)
    tokens = set(plain.split())
    if ({"qui", "nom", "appelle", "appel"} & tokens) and ({"tu", "toi", "t"} & tokens):
        return (
            "Je suis Amangninou IA. Je peux répondre aux questions sur le Fezan et donner les informations utiles du site : "
            "services, boutique, rituels, contact, profil, témoignages, astuces et réseaux."
        )

    social_answer = _safe_import_social_answer()
    if social_answer:
        answer = social_answer(question)
        if answer:
            return answer

    return "Bonjour ! Je suis Amangninou IA. Je peux discuter simplement et aider sur le Fezan et les informations du site."


def _format_price(value):
    try:
        amount = int(float(value or 0))
    except (TypeError, ValueError):
        amount = 0

    if amount <= 0:
        return "prix a confirmer"

    return f"{amount:,}".replace(",", " ") + " FCFA"


def _clean_text_value(value, max_length=500):
    return re.sub(r"\s+", " ", str(value or "")).strip()[:max_length]


def _safe_items(site_context, key, fallback):
    if isinstance(site_context, dict) and isinstance(site_context.get(key), list):
        return [item for item in site_context.get(key, []) if isinstance(item, dict)]

    return fallback


def _site_contact(site_context=None):
    default_contact = {
        "whatsappNumber": WHATSAPP_NUMBER,
        "phoneDisplay": PHONE_DISPLAY,
        "email": OWNER_EMAIL,
        "youtubeUrl": YOUTUBE_URL,
        "tiktokUrl": TIKTOK_URL,
    }

    if not isinstance(site_context, dict) or not isinstance(site_context.get("contact"), dict):
        return default_contact

    contact = site_context.get("contact") or {}
    whatsapp_number = re.sub(r"\D+", "", str(contact.get("whatsappNumber") or WHATSAPP_NUMBER)) or WHATSAPP_NUMBER
    return {
        "whatsappNumber": whatsapp_number,
        "phoneDisplay": _clean_text_value(contact.get("phoneDisplay") or PHONE_DISPLAY, 80),
        "email": _clean_text_value(contact.get("email") or OWNER_EMAIL, 160),
        "youtubeUrl": _clean_text_value(contact.get("youtubeUrl") or YOUTUBE_URL, 260),
        "tiktokUrl": _clean_text_value(contact.get("tiktokUrl") or TIKTOK_URL, 260),
    }


def _site_owner(site_context=None):
    owner = site_context.get("ownerProfile") if isinstance(site_context, dict) else None
    if not isinstance(owner, dict):
        return {
            "name": "Togbe Amangninou",
            "role": "Proprietaire du site",
            "specialty": "Spiritualite africaine, plantes et accompagnement traditionnel",
        }

    return {
        "name": _clean_text_value(owner.get("name") or "Togbe Amangninou", 120),
        "role": _clean_text_value(owner.get("role") or "Proprietaire du site", 160),
        "specialty": _clean_text_value(owner.get("specialty"), 240),
    }


def _site_summary(site_context=None):
    site = site_context.get("site") if isinstance(site_context, dict) else None
    if not isinstance(site, dict):
        return {
            "name": "Amangninou",
            "title": "Togbe Amangninou",
            "description": "Spiritualite africaine, plantes et accompagnement traditionnel",
        }

    return {
        "name": _clean_text_value(site.get("name") or "Amangninou", 120),
        "title": _clean_text_value(site.get("title") or "Togbe Amangninou", 160),
        "description": _clean_text_value(site.get("description") or SITE_PAYLOAD["subtitle"], 420),
    }


def _normalize_site_context(value):
    if not isinstance(value, dict):
        return None

    text_size = len(json.dumps(value, ensure_ascii=False))
    if text_size > 50000:
        return None

    normalized = dict(value)
    normalized["contact"] = _site_contact(value)

    for key, max_items in {
        "services": 30,
        "products": 60,
        "rituals": 30,
        "tipVideos": 30,
        "ritualVideos": 30,
        "testimonials": 30,
        "trustItems": 20,
    }.items():
        items = value.get(key)
        normalized[key] = items[:max_items] if isinstance(items, list) else []

    security_items = value.get("securityItems")
    normalized["securityItems"] = security_items[:20] if isinstance(security_items, list) else []

    return normalized


def _item_matches_question(item, question_plain, fields):
    item_text = " ".join(_plain_text(item.get(field)) for field in fields)
    item_tokens = {token for token in item_text.split() if len(token) > 2}
    question_tokens = {token for token in question_plain.split() if len(token) > 2}

    return bool(item_tokens & question_tokens)


def _is_fezan_intent(question):
    plain = _plain_text(question)
    tokens = set(plain.split())
    fezan_terms = {
        "fezan", "jour", "jours", "type", "date", "calendrier", "lunaire",
        "favorable", "favorables", "defavorable", "defavorables", "aujourd'hui",
        "aujourdhui", "hier", "demain", "apres", "mois", "semaine", "medjo",
        "mekou", "vodoun", "azon", "akoue", "houe", "hin", "fo", "fa",
    }

    if tokens & fezan_terms:
        return True

    return bool(
        re.search(r"\b(quel|meilleur|bon)\s+jour\b", plain)
        or re.search(r"\bjour\s+(choisir|pour|ouvrir|lancer|commencer)\b", plain)
    )


def _fast_site_answer(question):
    if _is_fezan_intent(question):
        return None

    plain = _plain_text(question)
    tokens = set(plain.split())

    asks_site_overview = bool(tokens & {"site", "application", "app", "amangninou", "propose", "proposes", "faire", "togbe", "proprietaire"}) and bool(
        tokens & {"quoi", "que", "presentation", "presente", "propose", "objectif", "qui"}
    )
    if asks_site_overview:
        return (
            "Le site Amangninou présente Togbe Amangninou, ses services spirituels, les rituels Vodou africains, "
            "la boutique traditionnelle, les témoignages, les vidéos Astuces et l'espace IA. "
            "Le but est d'aider les visiteurs à comprendre les accompagnements proposés et à contacter Togbe Amangninou de manière claire."
        )

    if bool(tokens & {"service", "services", "accompagnement", "conseil", "consultation"}):
        lines = ["Les principaux services présentés sur le site sont :"]
        lines.extend(f"- {service['title']} : {service['description']}" for service in SERVICES)
        return "\n".join(lines)

    if bool(tokens & {"boutique", "produit", "produits", "prix", "acheter", "vente", "vendre", "vendez"}):
        matching_products = [
            product
            for product in PRODUCTS
            if product["name"].lower() in plain or any(part in plain for part in _plain_text(product["name"]).split())
        ]
        products_to_show = matching_products or PRODUCTS
        lines = ["Produits actuellement présentés dans la boutique :"]
        lines.extend(f"- {product['name']} : {_format_price(product['price'])}" for product in products_to_show)
        lines.append("Chaque commande se prépare via WhatsApp afin de confirmer le produit et les conseils d'usage.")
        return "\n".join(lines)

    if bool(tokens & {"rituel", "rituels", "vodou", "vodoun", "dan", "sakpata", "hebiesso", "hebiosso"}):
        lines = ["Les rituels présentés sur le site sont :"]
        lines.extend(f"- {ritual['name']} : {ritual['subtitle']}" for ritual in RITUALS)
        lines.append("Chaque rituel demande une orientation avant toute démarche.")
        return "\n".join(lines)

    if bool(tokens & {"contact", "contacter", "joindre", "whatsapp", "telephone", "numero", "appel", "appeler", "mail", "email"}):
        return (
            "Vous pouvez contacter Togbe Amangninou par WhatsApp ou appel au "
            f"{PHONE_DISPLAY}. Email : {OWNER_EMAIL}."
        )

    if bool(tokens & {"youtube", "tiktok", "reseau", "reseaux", "video", "videos", "astuce", "astuces"}):
        return (
            "Les contenus publics sont disponibles dans l'onglet Astuces et sur les réseaux du propriétaire :\n"
            f"- YouTube : {YOUTUBE_URL}\n"
            f"- TikTok : {TIKTOK_URL}"
        )

    if bool(tokens & {"temoignage", "temoignages", "preuve", "preuves", "confiance", "avis"}):
        return (
            "L'onglet Confiance présente des retours d'expérience et des éléments de prudence. "
            "Les témoignages doivent être compris comme des retours personnels, pas comme des garanties automatiques."
        )

    if bool(tokens & {"profil", "compte", "connexion", "connecter", "securite", "notification", "notifications"}):
        return (
            "Le profil est facultatif. Il sert à garder des préférences, choisir les notifications, renforcer la sécurité "
            "et conserver un suivi local sur l'appareil."
        )

    return None


def _fast_site_answer(question, site_context=None):
    plain = _plain_text(question)
    tokens = set(plain.split())
    site_terms = {
        "site", "application", "app", "amangninou", "togbe", "proprietaire",
        "service", "services", "boutique", "produit", "produits", "acheter",
        "rituel", "rituels", "contact", "whatsapp", "telephone", "email",
        "youtube", "tiktok", "video", "videos", "astuce", "astuces",
        "temoignage", "temoignages", "confiance", "profil", "compte", "securite",
    }
    if _is_fezan_intent(question) and not bool(tokens & site_terms):
        return None

    services = _safe_items(site_context, "services", SERVICES)
    products = _safe_items(site_context, "products", PRODUCTS)
    rituals = _safe_items(site_context, "rituals", RITUALS)
    testimonials = _safe_items(site_context, "testimonials", TESTIMONIALS)
    tip_videos = _safe_items(site_context, "tipVideos", [])
    ritual_videos = _safe_items(site_context, "ritualVideos", [])
    trust_items = _safe_items(site_context, "trustItems", [])
    security_items = site_context.get("securityItems", []) if isinstance(site_context, dict) else SITE_PAYLOAD["security"]
    contact = _site_contact(site_context)
    owner = _site_owner(site_context)
    site = _site_summary(site_context)

    if bool(tokens & {"service", "services", "accompagnement", "conseil", "consultation"}):
        matching_services = [
            service
            for service in services
            if _item_matches_question(service, plain, ("title", "label", "category", "problem", "description"))
        ]
        lines = ["Les services actuellement presentes sur le site sont :"]
        for service in (matching_services or services):
            title = _clean_text_value(service.get("title"), 160) or "Service"
            category = _clean_text_value(service.get("category"), 120)
            problem = _clean_text_value(service.get("problem"), 180)
            description = _clean_text_value(service.get("description"), 420)
            details = " - ".join(part for part in (category, problem) if part)
            lines.append(f"- {title} ({details}) : {description}" if details else f"- {title} : {description}")
        return "\n".join(lines)

    asks_site_overview = bool(tokens & {
        "site", "application", "app", "amangninou", "propose", "proposes",
        "faire", "togbe", "proprietaire",
    }) and bool(tokens & {"quoi", "que", "presentation", "presente", "propose", "objectif", "qui"})

    if asks_site_overview:
        return (
            f"{site['name']} presente {owner['name']}. {site['description']} "
            f"Le site contient actuellement {len(services)} service(s), {len(products)} produit(s), "
            f"{len(rituals)} rituel(s), des temoignages, des videos Astuces et un espace IA."
        )

    if bool(tokens & {"service", "services", "accompagnement", "conseil", "consultation"}):
        matching_services = [
            service
            for service in services
            if _item_matches_question(service, plain, ("title", "label", "category", "problem", "description"))
        ]
        lines = ["Les services actuellement presentes sur le site sont :"]
        for service in (matching_services or services):
            title = _clean_text_value(service.get("title"), 160) or "Service"
            category = _clean_text_value(service.get("category"), 120)
            problem = _clean_text_value(service.get("problem"), 180)
            description = _clean_text_value(service.get("description"), 420)
            details = " - ".join(part for part in (category, problem) if part)
            lines.append(f"- {title} ({details}) : {description}" if details else f"- {title} : {description}")
        return "\n".join(lines)

    if bool(tokens & {"boutique", "produit", "produits", "prix", "acheter", "vente", "vendre", "vendez"}):
        matching_products = [
            product
            for product in products
            if _item_matches_question(product, plain, ("name", "category", "filter", "description"))
        ]
        lines = ["Produits actuellement presentes dans la boutique :"]
        for product in (matching_products or products):
            name = _clean_text_value(product.get("name"), 180) or "Produit"
            category = _clean_text_value(product.get("category") or product.get("filter"), 140)
            description = _clean_text_value(product.get("description"), 300)
            price = _format_price(product.get("price"))
            lines.append(f"- {name} ({category}) : {price}. {description}" if description else f"- {name} ({category}) : {price}")
        lines.append("Chaque commande se prepare via WhatsApp afin de confirmer le produit et les conseils d'usage.")
        return "\n".join(lines)

    if bool(tokens & {"rituel", "rituels", "vodou", "vodoun", "dan", "sakpata", "hebiesso", "hebiosso"}):
        matching_rituals = [
            ritual
            for ritual in rituals
            if _item_matches_question(ritual, plain, ("name", "subtitle", "tone", "text"))
        ]
        lines = ["Les rituels actuellement presentes sur le site sont :"]
        for ritual in (matching_rituals or rituals):
            name = _clean_text_value(ritual.get("name"), 140) or "Rituel"
            subtitle = _clean_text_value(ritual.get("subtitle"), 180)
            text = _clean_text_value(ritual.get("text"), 360)
            lines.append(f"- {name} : {subtitle}. {text}" if text else f"- {name} : {subtitle}")
        lines.append("Chaque rituel demande une orientation avant toute demarche.")
        return "\n".join(lines)

    if bool(tokens & {"contact", "contacter", "joindre", "whatsapp", "telephone", "numero", "appel", "appeler", "mail", "email"}):
        return (
            "Vous pouvez contacter Togbe Amangninou par WhatsApp ou appel au "
            f"{contact['phoneDisplay']}. Email : {contact['email']}."
        )

    if bool(tokens & {"youtube", "tiktok", "reseau", "reseaux", "video", "videos", "astuce", "astuces"}):
        lines = ["Les contenus publics sont disponibles dans l'onglet Astuces et sur les reseaux du proprietaire :"]
        for video in tip_videos[:6]:
            title = _clean_text_value(video.get("title"), 180)
            description = _clean_text_value(video.get("description"), 260)
            if title:
                lines.append(f"- {title} : {description}")
        for video in ritual_videos[:6]:
            title = _clean_text_value(video.get("title"), 180)
            description = _clean_text_value(video.get("description"), 260)
            if title:
                lines.append(f"- {title} : {description}")
        lines.extend([f"- YouTube : {contact['youtubeUrl']}", f"- TikTok : {contact['tiktokUrl']}"])
        return "\n".join(lines)

    if bool(tokens & {"temoignage", "temoignages", "preuve", "preuves", "confiance", "avis"}):
        lines = [
            "L'onglet Confiance presente des retours d'experience et des elements de prudence.",
            "Les temoignages sont des retours personnels, pas des garanties automatiques.",
        ]
        for item in trust_items[:4]:
            title = _clean_text_value(item.get("title"), 140)
            text = _clean_text_value(item.get("text"), 260)
            if title:
                lines.append(f"- {title} : {text}")
        for testimonial in testimonials[:4]:
            name = _clean_text_value(testimonial.get("name"), 80)
            context = _clean_text_value(testimonial.get("context"), 160)
            quote = _clean_text_value(testimonial.get("quote"), 260)
            if quote:
                lines.append(f"- {name} ({context}) : {quote}")
        return "\n".join(lines)

    if bool(tokens & {"profil", "compte", "connexion", "connecter", "securite", "notification", "notifications"}):
        lines = [
            "Le profil est facultatif. Il sert a garder des preferences, choisir les notifications, renforcer la securite et conserver un suivi local sur l'appareil."
        ]
        if security_items:
            lines.append("Mesures de securite affichees sur le site :")
            lines.extend(f"- {_clean_text_value(item, 180)}" for item in security_items[:6])
        return "\n".join(lines)

    return None


def _fast_fezan_date_answer(question, definitions):
    try:
        from cerveau_IA.pdf_knowledge import _date_label, _fezan_day_for_date, _requested_full_date
    except Exception as exc:
        print(f"[IA] Fonctions date Fezan indisponibles: {exc}")
        return None

    plain = _plain_text(question)
    tokens = set(plain.split())
    requested = _requested_full_date(question)

    if not requested:
        return None

    asks_date_type = bool(tokens & {
        "aujourd'hui",
        "aujourdhui",
        "hier",
        "demain",
        "apres",
        "jour",
        "type",
        "fezan",
        "favorable",
        "favorables",
        "defavorable",
        "defavorables",
        "date",
    })
    if not asks_date_type and not re.search(r"\b20\d{2}\b", plain):
        return None

    day, month, year = requested

    try:
        found = _fezan_day_for_date(day, month, year)
    except Exception as exc:
        print(f"[IA] Lecture date Fezan impossible: {exc}")
        return None

    if not found:
        return f"Je n'ai pas assez d'informations dans ma base Fezan pour déterminer le type du {day}/{month}/{year}."

    day_label, kind = found
    info = definitions.get(day_label, {})
    label = _date_label(day, month, year, question)
    lines = [f"{label} est un jour {day_label}, donc un jour {kind}."]

    if info.get("definition"):
        lines.append(f"Définition : {info['definition']}")
    if info.get("uses"):
        lines.append(f"Usage principal : {info['uses']}.")

    return "\n".join(lines)


def _fast_fezan_answer(question):
    aliases, definitions, day_order = _safe_import_fezan_tables()
    if not aliases or not definitions or not day_order:
        return None

    plain = _plain_text(question)
    tokens = set(plain.split())
    alias_map = {_plain_text(key): value for key, value in aliases.items()}
    requested_day = next((alias_map[token] for token in plain.split() if token in alias_map), None)
    asks_definition = bool(tokens & {"definition", "definir", "explique", "signifie", "type", "jour", "quoi", "dire"})

    date_answer = _fast_fezan_date_answer(question, definitions)
    if date_answer:
        return date_answer

    if requested_day and asks_definition:
        info = definitions[requested_day]
        return (
            f"{requested_day} est le {info['rank']} du Fezan. C'est un jour {info['kind']}.\n"
            f"Définition : {info['definition']}\n"
            f"Usage principal : {info['uses']}."
        )

    has_calendar_target = bool(re.search(r"\b20\d{2}\b", plain)) or bool(tokens & {
        "janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout",
        "septembre", "octobre", "novembre", "decembre", "aujourd'hui", "aujourdhui",
        "demain", "semaine", "mois",
    })
    asks_bad = bool(tokens & {"defavorable", "defavorables", "mauvais", "malheur"}) or bool(
        re.search(r"\bd\s+favor", plain),
    )
    asks_favorable = bool(tokens & {"favorable", "favorables", "bon", "bons", "meilleur", "meilleurs"}) and not asks_bad

    if asks_favorable and "fezan" in tokens and not has_calendar_target:
        favorable_days = [day for day in day_order if definitions[day]["kind"] == "favorable"]
        lines = ["Dans le Fezan, les jours favorables principaux sont :"]
        lines.extend(f"- {day} : {definitions[day]['definition']}" for day in favorable_days)
        return "\n".join(lines)

    if asks_bad and "fezan" in tokens and not has_calendar_target:
        bad_days = [day for day in day_order if definitions[day]["kind"] == "défavorable"]
        lines = ["Dans le Fezan, les jours défavorables principaux sont :"]
        lines.extend(f"- {day} : {definitions[day]['definition']}" for day in bad_days)
        return "\n".join(lines)

    asks_all_days = (
        bool(tokens & {"liste", "types", "type", "jours", "jour", "noms", "nom"})
        and ("fezan" in tokens or "9" in tokens)
        and not (asks_favorable or asks_bad)
        and not bool(tokens & {"mois", "semaine", "date"})
    )
    if asks_all_days:
        lines = ["Les 9 types de jours du Fezan sont :"]
        for day in day_order:
            info = definitions[day]
            lines.append(f"- {day} ({info['rank']}, jour {info['kind']}) : {info['definition']}")
        return "\n".join(lines)

    if re.search(r"\b(que peux tu faire|tu peux faire quoi|comment t utiliser|aide moi)\b", plain):
        return (
            "Tu peux me demander :\n"
            "- le type Fezan d'une date précise ;\n"
            "- les jours favorables ou défavorables d'un mois ;\n"
            "- la définition d'un jour comme Fa, Bo, Medjo ou Azon ;\n"
            "- le meilleur jour pour ouvrir une boutique, une entreprise ou lancer un projet ;\n"
            "- les informations du site : services, boutique, rituels, contact, profil, astuces et réseaux."
        )

    return None


def _safe_import_pdf_answer():
    try:
        from cerveau_IA.pdf_knowledge import answer_from_pdfs

        return answer_from_pdfs
    except Exception as exc:
        print(f"[IA] Base documentaire indisponible: {exc}")
        return None


def _answer_with_mark_core(question, site_context=None):
    question = str(question or "").strip()
    if not question:
        return "Écrivez une question Fezan : une date, un mois, un type de jour ou un usage précis."

    social_answer = _social_ai_answer(question)
    if social_answer:
        return social_answer

    fast_answer = _fast_fezan_answer(question)
    if fast_answer:
        return fast_answer

    site_answer = _fast_site_answer(question, site_context)
    if site_answer:
        return site_answer

    pdf_answer = _safe_import_pdf_answer()
    if pdf_answer:
        try:
            answer = _coerce_ai_answer(pdf_answer(question))
            if answer:
                return answer
        except Exception as exc:
            print(f"[IA] Reponse documentaire impossible: {exc}")

    return _fallback_ai_answer(question)


async def _generate_tts_base64(text):
    try:
        import edge_tts
    except Exception as exc:
        print(f"[IA] edge_tts indisponible: {exc}")
        return None

    tts_text = _clean_tts_text(text)
    if not tts_text:
        return None

    tmp_path = os.path.join(tempfile.gettempdir(), f"jarvis_tts_{int(time.time() * 1000)}.mp3")

    try:
        communicate = edge_tts.Communicate(tts_text, voice=AI_VOICE)
        await communicate.save(tmp_path)
        with open(tmp_path, "rb") as audio_file:
            return base64.b64encode(audio_file.read()).decode("utf-8")
    except Exception as exc:
        print(f"[IA] Generation TTS impossible: {exc}")
        return None
    finally:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


class AmangninouHandler(BaseHTTPRequestHandler):
    def _cors_origin(self):
        origin = self.headers.get("Origin")
        return origin if origin in ALLOWED_ORIGINS else "*"

    def _send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", self._cors_origin())
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}

        raw_body = self.rfile.read(content_length)
        return json.loads(raw_body.decode("utf-8"))

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/ai/today":
            payload = _fezan_day_payload()
            if not payload:
                self._send_json(
                    503,
                    {
                        "ok": False,
                        "error": "Impossible de déterminer le Fezan du jour",
                    },
                )
                return

            self._send_json(200, {"ok": True, **payload})
            return

        routes = {
            "/api/health": {
                "status": "ok",
                "application": "Amangninou",
                "message": "Backend Python actif",
            },
            "/api/ai/health": {
                "status": "ok",
                "application": AI_SCOPE_NAME,
                "mode": AI_APPLICATION_MODE,
                "voice": AI_VOICE,
                "mark_root": str(MARK_ROOT),
                "mark_root_found": MARK_ROOT.exists(),
            },
            "/api/site": SITE_PAYLOAD,
            "/api/home": {
                "title": SITE_PAYLOAD["title"],
                "subtitle": SITE_PAYLOAD["subtitle"],
                "navigation": SITE_PAYLOAD["navigation"],
            },
            "/api/services": {"services": SERVICES},
            "/api/products": {"products": PRODUCTS},
            "/api/rituals": {"rituals": RITUALS},
            "/api/testimonials": {"testimonials": TESTIMONIALS},
        }

        if path in routes:
            self._send_json(200, routes[path])
            return

        self._send_json(404, {"error": "Route introuvable"})

    def do_POST(self):
        path = urlparse(self.path).path

        if path == "/api/ai/chat":
            self._handle_ai_chat()
            return

        if path != "/api/contact":
            self._send_json(404, {"error": "Route introuvable"})
            return

        try:
            payload = self._read_json()
        except json.JSONDecodeError:
            self._send_json(400, {"error": "JSON invalide"})
            return

        subject = str(payload.get("subject", "")).strip()
        message = str(payload.get("message", "")).strip()

        if not subject or not message:
            self._send_json(
                400,
                {
                    "error": "Le sujet et le message sont obligatoires",
                },
            )
            return

        self._send_json(
            201,
            {
                "status": "received",
                "message": "Demande préparée avec succès",
                "request": {
                    "subject": subject,
                    "message_preview": message[:120],
                },
            },
        )

    def _handle_ai_chat(self):
        try:
            payload = self._read_json()
        except json.JSONDecodeError:
            self._send_json(400, {"error": "JSON invalide"})
            return

        message = str(payload.get("message", "")).strip()
        with_tts = bool(payload.get("tts", True))
        site_context = _normalize_site_context(payload.get("site_context"))

        if not message:
            self._send_json(400, {"error": "Le message est obligatoire"})
            return

        if len(message) > 1200:
            self._send_json(400, {"error": "Le message est trop long"})
            return

        base_answer = _answer_with_mark_core(message, site_context)
        is_social_answer = _is_social_or_friendly_question(message)
        answer = base_answer if is_social_answer else _append_whatsapp_followup(base_answer, message, site_context)
        audio_b64 = None

        if with_tts:
            tts_answer = base_answer if is_social_answer else _append_tts_followup(base_answer)
            try:
                audio_b64 = asyncio.run(_generate_tts_base64(tts_answer))
            except RuntimeError:
                loop = asyncio.new_event_loop()
                try:
                    audio_b64 = loop.run_until_complete(_generate_tts_base64(tts_answer))
                finally:
                    loop.close()

        self._send_json(
            200,
            {
                "ok": True,
                "answer": answer,
                "audio_b64": audio_b64,
                "voice": AI_VOICE,
                "source": "Mark-XLVI-main Fezan + contenu site",
            },
        )

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), AmangninouHandler)
    print(f"Backend Amangninou actif sur http://{HOST}:{PORT}")
    server.serve_forever()
