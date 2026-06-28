from __future__ import annotations

import json
from io import BytesIO
from email import policy
from email.parser import BytesParser
import html
import math
import re
import sys
import unicodedata
import zipfile
from xml.etree import ElementTree
from dataclasses import dataclass
from datetime import date, timedelta
from difflib import SequenceMatcher
from pathlib import Path

from core.llm_client import call_llm_text


def get_base_dir() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).parent
    return Path(__file__).resolve().parent.parent


BASE_DIR = get_base_dir()
DOCUMENTS_DIR = BASE_DIR / "documents_pdf"
INDEX_PATH = BASE_DIR / "memory" / "pdf_knowledge.json"
FEZAN_DOCUMENT_TERMS = ("fezan",)

_WORD_RE = re.compile(r"[a-zA-ZÀ-ÿ0-9']+")
_STOPWORDS = {
    "a", "au", "aux", "avec", "ce", "ces", "dans", "de", "des", "du", "elle",
    "en", "et", "est", "il", "la", "le", "les", "pour", "que", "qui", "sur",
    "un", "une", "the", "and", "or", "to", "of", "in", "is", "it", "what",
    "how", "why", "me", "moi", "je", "tu", "vous", "nous", "l", "d",
}



_QUERY_CORRECTIONS = {
    "calandrier": "calendrier",
    "calendrie": "calendrier",
    "calendriee": "calendrier",
    "defenition": "definition",
    "definiton": "definition",
    "definitione": "definition",
    "defavorable": "defavorable",
    "defavorale": "defavorable",
    "defavorables": "defavorable",
    "defavorabl": "defavorable",
    "difinition": "definition",
    "diferent": "different",
    "diferente": "different",
    "diferante": "different",
    "diferrent": "different",
    "diferrante": "different",
    "divinitee": "divinite",
    "diviniter": "divinite",
    "divinitter": "divinite",
    "divinnite": "divinite",
    "divinniter": "divinite",
    "divinitees": "divinite",
    "esprie": "esprit",
    "espries": "esprit",
    "espprit": "esprit",
    "fezane": "fezan",
    "feszan": "fezan",
    "fesan": "fezan",
    "boutik": "boutique",
    "boutiqu": "boutique",
    "bons": "bon",
    "bonne": "bon",
    "bonnes": "bon",
    "comerce": "commerce",
    "commerse": "commerce",
    "entreprisse": "entreprise",
    "entrepreprise": "entreprise",
    "jourd": "jour",
    "journee": "jour",
    "mauvai": "mauvais",
    "mauvaise": "mauvais",
    "mauvaises": "mauvais",
    "favorablee": "favorable",
    "favorabl": "favorable",
    "vaudoux": "vaudou",
    "vodou": "vodoun",
    "vodounn": "vodoun",
    "oricha": "orisha",
    "sapkata": "sakpata",
    "hebiosso": "heviosso",
    "heviozo": "heviosso",
    "ogoun": "ogou",
    "ogun": "ogou",
}


def _is_fezan_document(path: Path) -> bool:
    name = _normalize_word(path.stem)
    return path.suffix.lower() == ".pdf" and any(term in name for term in FEZAN_DOCUMENT_TERMS)

_CANONICAL_QUERY_TERMS = {
    "amangninou", "calendrier", "definition", "different", "divinite",
    "document", "esprit", "favorable", "defavorable", "fezan", "histoire", "jour",
    "boutique", "commerce", "entreprise", "marche", "mois", "ouvrir", "ouverture",
    "projet", "commencer", "lancer", "semaine", "demain", "aujourd'hui", "aujourdhui", "hier",
    "oracle", "vaudou", "vodoun", "orisha", "sakpata", "heviosso",
    "ayidohwedo", "dan", "ogou", "damballa", "oxumare", "loko",
    "ayizan", "erzulie", "egun", "zangbeto", "xoxo", "tohossou",
    "medjo", "mekou", "azon", "akoue", "houe", "hin", "fo", "fa",
}
@dataclass
class SearchHit:
    source: str
    page: int
    text: str
    score: float


def _normalize_word(word: str) -> str:
    word = unicodedata.normalize("NFKD", word.lower())
    word = "".join(ch for ch in word if not unicodedata.combining(ch))
    word = re.sub(r"[^a-z0-9']+", "", word)
    if len(word) > 4 and word.endswith("s"):
        word = word[:-1]
    return word


def _tokenize(text: str) -> list[str]:
    tokens = []
    for raw in _WORD_RE.findall(text):
        word = _normalize_word(raw)
        if len(word) > 2 and word not in _STOPWORDS:
            tokens.append(word)
    return tokens


def _closest_query_term(word: str) -> str | None:
    if len(word) < 4:
        return None
    best_term = None
    best_score = 0.0
    for term in _CANONICAL_QUERY_TERMS:
        if abs(len(term) - len(word)) > 3:
            continue
        score = SequenceMatcher(None, word, term).ratio()
        if score > best_score:
            best_term = term
            best_score = score
    if best_term and best_score >= 0.78:
        return best_term
    return None


def _query_tokens(text: str) -> list[str]:
    tokens = []
    for word in _tokenize(text):
        corrected = _QUERY_CORRECTIONS.get(word)
        if not corrected:
            corrected = _closest_query_term(word) or word
        tokens.append(corrected)
    return tokens
def _chunk_text(text: str, max_chars: int = 850, overlap: int = 120) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        if end < len(text):
            split = text.rfind(". ", start, end)
            if split > start + 250:
                end = split + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(0, end - overlap)
    return chunks



def _analyze_image_bytes(data: bytes, name: str = "image") -> str:
    if not data:
        return ""
    try:
        from PIL import Image
    except Exception:
        return f"Image intégrée détectée ({name}). Analyse visuelle indisponible sur cette installation."

    try:
        image = Image.open(BytesIO(data))
        width, height = image.size
        details = [f"Image intégrée détectée ({name}, {width}x{height})."]
        try:
            import pytesseract
            ocr_text = pytesseract.image_to_string(image, lang="fra+eng")
            ocr_text = re.sub(r"\s+", " ", ocr_text).strip()
            if ocr_text:
                details.append(f"Texte lu dans l'image : {ocr_text}")
            else:
                details.append("Aucun texte lisible automatiquement dans cette image.")
        except Exception:
            details.append("OCR non disponible : le texte éventuel dans l'image n'a pas pu être lu automatiquement.")
        return " ".join(details)
    except Exception:
        return f"Image intégrée détectée ({name}), mais elle n'a pas pu être analysée automatiquement."


def _chunk_image_notes(notes: list[str], source: str, page_start: int = 1) -> list[dict]:
    chunks = []
    for offset, note in enumerate(notes):
        note = re.sub(r"\s+", " ", note).strip()
        if not note:
            continue
        chunks.append({
            "source": source,
            "page": page_start + offset,
            "text": note,
            "tokens": _tokenize(note),
        })
    return chunks

def _extract_pdf(path: Path) -> list[dict]:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError("pypdf is required. Run: pip install pypdf") from exc

    pages = []
    reader = PdfReader(str(path))
    for i, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""
        image_notes: list[str] = []
        try:
            for image_index, image_file in enumerate(getattr(page, "images", []) or [], start=1):
                data = getattr(image_file, "data", b"")
                name = getattr(image_file, "name", f"page-{i}-image-{image_index}")
                note = _analyze_image_bytes(data, name)
                if note:
                    image_notes.append(note)
        except Exception:
            pass
        combined = "\n".join([text, *image_notes])
        for chunk in _chunk_text(combined):
            pages.append({
                "source": path.name,
                "page": i,
                "text": chunk,
                "tokens": _tokenize(chunk),
            })
    return pages

def _extract_mhtml(path: Path) -> list[dict]:
    message = BytesParser(policy=policy.default).parsebytes(path.read_bytes())
    pieces: list[str] = []

    for part in message.walk():
        content_type = part.get_content_type()
        if content_type not in {"text/html", "text/plain"}:
            continue
        raw = part.get_payload(decode=True)
        if raw is not None:
            payload = raw.decode(part.get_content_charset() or "utf-8", errors="replace")
        else:
            try:
                payload = part.get_content()
            except Exception:
                payload = ""
        payload = str(payload)
        if content_type == "text/html":
            payload = re.sub(r"(?is)<(script|style).*?</\1>", " ", payload)
            payload = re.sub(r"<[^>]+>", " ", payload)
            payload = html.unescape(payload)
        payload = re.sub(r"\s+", " ", payload).strip()
        if payload:
            pieces.append(payload)

    for part in message.walk():
        if not part.get_content_type().startswith("image/"):
            continue
        raw = part.get_payload(decode=True) or b""
        name = part.get_filename() or part.get("Content-Location") or part.get("Content-ID") or "image-mhtml"
        note = _analyze_image_bytes(raw, str(name))
        if note:
            pieces.append(note)

    text = "\n".join(pieces)
    chunks = []
    for i, chunk in enumerate(_chunk_text(text), 1):
        chunks.append({
            "source": path.name,
            "page": i,
            "text": chunk,
            "tokens": _tokenize(chunk),
        })
    return chunks

def _extract_docx(path: Path) -> list[dict]:
    paragraphs: list[str] = []
    xml_files = [
        "word/document.xml",
        "word/footnotes.xml",
        "word/endnotes.xml",
    ]

    with zipfile.ZipFile(path) as archive:
        xml_files.extend(
            name
            for name in archive.namelist()
            if name.startswith(("word/header", "word/footer")) and name.endswith(".xml")
        )
        for name in xml_files:
            if name not in archive.namelist():
                continue
            root = ElementTree.fromstring(archive.read(name))
            for paragraph in root.iter():
                if not paragraph.tag.endswith("}p"):
                    continue
                pieces = [
                    element.text
                    for element in paragraph.iter()
                    if element.tag.endswith("}t") and element.text
                ]
                text = re.sub(r"\s+", " ", " ".join(pieces)).strip()
                if text:
                    paragraphs.append(text)

    text = "\n".join(paragraphs)
    chunks = []
    for i, chunk in enumerate(_chunk_text(text), 1):
        chunks.append({
            "source": path.name,
            "page": i,
            "text": chunk,
            "tokens": _tokenize(chunk),
        })
    return chunks

def build_index(force: bool = False) -> dict:
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)

    documents = sorted(p for p in DOCUMENTS_DIR.iterdir() if p.is_file() and _is_fezan_document(p))
    signature = {
        p.name: {"mtime": p.stat().st_mtime, "size": p.stat().st_size}
        for p in documents
    }

    if not force and INDEX_PATH.exists():
        try:
            cached = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
            if cached.get("signature") == signature:
                return cached
        except Exception:
            pass

    chunks = []
    for document in documents:
        suffix = document.suffix.lower()
        if suffix == ".pdf":
            chunks.extend(_extract_pdf(document))

    index = {
        "signature": signature,
        "documents": [p.name for p in documents],
        "chunks": chunks,
    }
    INDEX_PATH.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
    return index



def _token_similarity_score(query_token: str, candidate_tokens: set[str]) -> float:
    if query_token in candidate_tokens:
        return 1.0
    if len(query_token) < 5:
        return 0.0

    best = 0.0
    for candidate in candidate_tokens:
        if len(candidate) < 5 or abs(len(candidate) - len(query_token)) > 3:
            continue
        ratio = SequenceMatcher(None, query_token, candidate).ratio()
        if ratio > best:
            best = ratio
    return 0.72 if best >= 0.84 else 0.0


def _has_token_match(query_token: str, candidate_tokens: set[str]) -> bool:
    return _token_similarity_score(query_token, candidate_tokens) > 0

def search_knowledge(question: str, limit: int = 5) -> list[SearchHit]:
    index = build_index()
    q_tokens = _query_tokens(question)
    if not q_tokens:
        return []

    q_counts = {t: q_tokens.count(t) for t in set(q_tokens)}
    hits: list[SearchHit] = []
    for chunk in index.get("chunks", []):
        c_tokens = chunk.get("tokens", [])
        if not c_tokens:
            continue
        c_set = set(c_tokens)
        overlap = sum(q_counts.get(t, 0) for t in c_set)
        if overlap <= 0:
            overlap = sum(
                q_counts[token] * _token_similarity_score(token, c_set)
                for token in q_counts
            )
        if overlap <= 0:
            continue
        density = overlap / math.sqrt(max(len(c_tokens), 1))
        bonus = 0.15 if any(_has_token_match(t, c_set) for t in q_tokens[:3]) else 0
        hits.append(SearchHit(
            source=chunk.get("source", "document.pdf"),
            page=int(chunk.get("page", 1)),
            text=chunk.get("text", ""),
            score=density + bonus,
        ))

    hits.sort(key=lambda h: h.score, reverse=True)
    return hits[:limit]


def detect_translation_target(question: str) -> str | None:
    q = question.lower()
    languages = {
        "anglais": "English",
        "english": "English",
        "français": "French",
        "francais": "French",
        "french": "French",
        "espagnol": "Spanish",
        "spanish": "Spanish",
        "arabe": "Arabic",
        "arabic": "Arabic",
        "fon": "Fon",
        "yoruba": "Yoruba",
    }
    if "traduis" not in q and "translate" not in q:
        return None
    for key, value in languages.items():
        if key in q:
            return value
    return "French"


def translate_text(text: str, language: str) -> str:
    prompt = (
        f"Traduis la reponse suivante en {language}. "
        "Garde les noms propres et les termes techniques clairs, sans ajouter de sources visibles.\n\n"
        f"{text}"
    )
    return call_llm_text(prompt, timeout=120).strip() or text

def _normalize_social(text: str) -> list[str]:
    cleaned = text.lower().strip()
    cleaned = cleaned.replace("’", "'").replace("œ", "oe")
    cleaned = unicodedata.normalize("NFKD", cleaned)
    cleaned = "".join(ch for ch in cleaned if not unicodedata.combining(ch))
    return re.findall(r"[a-zA-Z0-9']+", cleaned)


def answer_social_message(question: str) -> str | None:
    normalized_tokens = _normalize_social(question)
    tokens = set(normalized_tokens)
    normalized_text = " ".join(normalized_tokens)
    if not tokens:
        return None

    greetings = {
        "cc", "bjr", "bsr", "slt", "salut", "bonjour", "bonsoir",
        "coucou", "hello", "yo", "salam", "hey", "wesh",
    }
    thanks = {"merci", "thanks", "remercie"}
    farewells = {"bye", "revoir", "aurevoir", "adieu", "ciao"}
    friends = {"ami", "amie", "amis", "amies", "frere", "soeur", "pote", "copain", "copine"}
    feelings = {"bien", "mal", "fatigue", "fatiguee", "triste", "content", "contente"}
    affection = {"aime", "apprecie", "adore"}
    politeness = {"stp", "svp", "please", "pardon", "desole", "desolee"}

    document_words = {"pdf", "document", "documents", "divinite", "divinites", "vaudou", "esprit", "esprits", "definition", "histoire"}
    if tokens & document_words and len(tokens) > 2:
        return None

    asks_how_are_you = (
        (("comment" in tokens or "cmnt" in tokens) and ({"vas", "va", "allez"} & tokens))
        or "cv" in tokens
        or ({"ca", "sa"} & tokens and "va" in tokens)
        or ("va" in tokens and bool(tokens & greetings))
    )
    asks_identity = ({"qui", "nom", "appelle", "appel"} & tokens) and ({"tu", "toi", "t"} & tokens)
    asks_friendship = bool(tokens & friends) or bool(re.search(r"\b(on|nous)\s+peut\s+etre\s+ami", normalized_text))
    asks_familiarity = (
        "tutoyer" in tokens
        or "tutoie" in tokens
        or ("parle" in tokens and {"simplement", "familier", "familiere"} & tokens)
        or ("fais" in tokens and {"connaissance", "ami"} & tokens)
    )

    if asks_how_are_you:
        return "Je vais bien, merci. Et toi, comment vas-tu ?"
    if asks_identity:
        return "Je suis Amangninou IA Fezan. Je peux discuter avec toi simplement et t'aider à comprendre le calendrier Fezan, les jours, les mois et les types de jours."
    if asks_friendship or asks_familiarity:
        return "Oui, bien sûr. On peut se parler simplement. Je resterai respectueux, attentif et clair avec toi."
    if tokens & greetings:
        return "Bonjour ! Je suis Amangninou IA. Je suis content de discuter avec toi. Comment puis-je t'aider ?"
    if tokens & thanks:
        return "Avec plaisir. Je suis là pour t'aider."
    if tokens & farewells:
        return "D'accord, à bientôt. Je reste disponible quand tu veux continuer."
    if tokens & affection and {"tu", "toi", "t"} & tokens:
        return "Merci, ça me fait plaisir. Je vais continuer à te répondre avec attention."
    if tokens & feelings and len(tokens) <= 5:
        if tokens & {"mal", "triste"}:
            return "Je suis désolé que tu te sentes comme ça. Je peux rester avec toi et t'écouter."
        return "Je suis content de l'entendre. On continue quand tu veux."
    if tokens & politeness and len(tokens) <= 3:
        return "Pas de souci. Dis-moi ce dont tu as besoin."
    return None


def polish_french(text: str) -> str:
    replacements = {
        "a partir": "à partir",
        "A partir": "À partir",
        "a bientot": "à bientôt",
        "A bientot": "À bientôt",
        "D'apres": "D'après",
        "d'apres": "d'après",
        "Meteo": "Météo",
        "meteo": "météo",
        "envoye": "envoyé",
        "envoyee": "envoyée",
        "configure": "configuré",
        "affichee": "affichée",
        "Termine": "Terminé",
        "trouve": "trouvé",
        "trouvee": "trouvée",
        "trouves": "trouvés",
        "installes": "installés",
        "integres": "intégrés",
        "reponse": "réponse",
        "reponds": "réponds",
        "repondre": "répondre",
        "francais": "français",
        "ecrit": "écrit",
        "clairement": "clairement",
        "constituee": "constituée",
        "base de connaissance": "base de connaissances",
    }
    out = text or ""
    for src, dst in replacements.items():
        out = re.sub(rf"\b{re.escape(src)}\b", dst, out)
    return out




MONTH_NAMES = {
    1: "janvier",
    2: "février",
    3: "mars",
    4: "avril",
    5: "mai",
    6: "juin",
    7: "juillet",
    8: "août",
    9: "septembre",
    10: "octobre",
    11: "novembre",
    12: "décembre",
}
WEEKDAY_NAMES = {
    0: "lundi",
    1: "mardi",
    2: "mercredi",
    3: "jeudi",
    4: "vendredi",
    5: "samedi",
    6: "dimanche",
}
WEEKDAY_ALIASES = {
    "lundi": 0, "lun": 0,
    "mardi": 1, "mar": 1,
    "mercredi": 2, "mer": 2,
    "jeudi": 3, "jeu": 3,
    "vendredi": 4, "ven": 4,
    "samedi": 5, "sam": 5,
    "dimanche": 6, "dim": 6,
}
_MONTH_ALIASES = {
    "janvier": 1, "janv": 1,
    "fevrier": 2, "fev": 2, "février": 2, "fév": 2,
    "mars": 3,
    "avril": 4, "avr": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7, "juil": 7,
    "aout": 8, "août": 8,
    "septembre": 9, "sept": 9,
    "octobre": 10, "oct": 10,
    "novembre": 11, "nov": 11,
    "decembre": 12, "décembre": 12, "dec": 12,
}
_FEZAN_DAY_PATTERNS = [
    ("Akoue / Houe", r"a\s*k\s*o\s*u\s*e\s*/?\s*h\s*o\s*u\s*e"),
    ("Hin / Fo", r"h\s*i\s*n\s*/?\s*f\s*o"),
    ("Medjo", r"m\s*e\s*d\s*j\s*o"),
    ("Mekou", r"m\s*e\s*k\s*o\s*u"),
    ("Vodoun", r"v\s*o\s*d\s*o\s*u\s*n"),
    ("Azon", r"a\s*z\s*o\s*n"),
    ("Vo", r"\bv\s*o\b"),
    ("Bo", r"\bb\s*o\b"),
    ("Fa", r"\bf\s*a\b"),
]
FEZAN_DAY_ORDER = ["Medjo", "Mekou", "Vodoun", "Azon", "Vo", "Akoue / Houe", "Bo", "Hin / Fo", "Fa"]
FEZAN_DAY_ALIASES = {
    "medjo": "Medjo",
    "medjô": "Medjo",
    "medjo": "Medjo",
    "mêdjo": "Medjo",
    "mekou": "Mekou",
    "mêkou": "Mekou",
    "vodoun": "Vodoun",
    "vodou": "Vodoun",
    "azon": "Azon",
    "vo": "Vo",
    "akoue": "Akoue / Houe",
    "houe": "Akoue / Houe",
    "houé": "Akoue / Houe",
    "bo": "Bo",
    "bô": "Bo",
    "hin": "Hin / Fo",
    "fo": "Hin / Fo",
    "fô": "Hin / Fo",
    "fa": "Fa",
    "fâ": "Fa",
}
FEZAN_DAY_DEFINITIONS = {
    "Medjo": {
        "rank": "1er jour",
        "kind": "favorable",
        "definition": (
            "premier jour lunaire, symbole de naissance et de point de départ de la vie. "
            "Il est très favorable pour entreprendre quelque chose d'important, surtout quand il tombe un jeudi."
        ),
        "uses": "ouvrir une boutique, lancer une entreprise, démarrer un marché ou commencer un projet important",
    },
    "Mekou": {
        "rank": "2e jour",
        "kind": "défavorable",
        "definition": (
            "deuxième jour lunaire, associé à la mort et aux jours de malheur. "
            "Il est déconseillé pour un événement important, mais peut convenir aux enterrements ou sacrifices pour les défunts."
        ),
        "uses": "à éviter pour une ouverture ou un lancement important",
    },
    "Vodoun": {
        "rank": "3e jour",
        "kind": "favorable",
        "definition": (
            "jour du sacré et du vaudou. Il correspond à la mutation en esprit ou en dieu et est favorable, "
            "en particulier pour démarrer des cérémonies cultuelles lorsqu'il tombe un dimanche."
        ),
        "uses": "cérémonies cultuelles et démarches spirituelles",
    },
    "Azon": {
        "rank": "4e jour",
        "kind": "défavorable",
        "definition": (
            "jour associé à la maladie et à la malédiction. C'est un mauvais jour qu'il faut éviter pour les actions importantes."
        ),
        "uses": "à éviter pour une ouverture, un voyage ou une décision importante",
    },
    "Vo": {
        "rank": "5e jour",
        "kind": "favorable",
        "definition": (
            "jour du sacrifice. Il est favorable parce qu'il permet de conjurer un mauvais sort ou de rompre un maléfice."
        ),
        "uses": "sacrifices, protections et actions pour écarter un mal",
    },
    "Akoue / Houe": {
        "rank": "6e jour",
        "kind": "défavorable",
        "definition": (
            "jour du jugement. C'est un mauvais jour qui peut engendrer disputes, conflits et menaces entre personnes."
        ),
        "uses": "à éviter pour les contrats, réunions sensibles, ouvertures et décisions importantes",
    },
    "Bo": {
        "rank": "7e jour",
        "kind": "favorable",
        "definition": (
            "jour du sort, bon ou mauvais. Il est propice pour jeter des sorts ou maléfices, spécialement quand il tombe un mardi."
        ),
        "uses": "travaux liés au sort, protections ou actions spirituelles précises",
    },
    "Hin / Fo": {
        "rank": "8e jour",
        "kind": "défavorable",
        "definition": (
            "jour de la misère. La tradition déconseille d'entreprendre quelque chose d'important en ce huitième jour lunaire."
        ),
        "uses": "à éviter pour ouvrir une boutique, une entreprise, un marché ou commencer un projet",
    },
    "Fa": {
        "rank": "9e jour",
        "kind": "favorable",
        "definition": (
            "jour parfait, favorable pour consulter l'oracle afin de comprendre et combattre les malheurs."
        ),
        "uses": "consultation de l'oracle, clarification spirituelle et décisions qui demandent une orientation",
    },
}


_LAST_FEZAN_CONTEXT = {}

def _calendar_letter_pattern(value: str) -> str:
    plain = unicodedata.normalize("NFKD", value.lower())
    plain = "".join(ch for ch in plain if not unicodedata.combining(ch))
    return r"\s*".join(re.escape(ch) for ch in plain if ch.isalnum())


def _calendar_text() -> str:
    index = build_index()
    parts = [
        str(chunk.get("text", ""))
        for chunk in index.get("chunks", [])
        if "fezan" in str(chunk.get("source", "")).lower()
    ]
    text = " ".join(parts).lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", text)


def _plain_question(question: str) -> str:
    raw = unicodedata.normalize("NFKD", (question or "").lower())
    raw = "".join(ch for ch in raw if not unicodedata.combining(ch))
    raw = raw.replace("’", "'")
    raw = re.sub(r"[^a-z0-9']+", " ", raw)
    return re.sub(r"\s+", " ", raw).strip()


def _mentions_today(raw: str) -> bool:
    return bool(
        re.search(r"\baujourd\s*[' ]?\s*(hui|huit|hut|ui)\b", raw)
        or re.search(r"\baujourdhui\b", raw)
        or re.search(r"\bce\s+jour\b", raw)
    )


def _mentions_tomorrow(raw: str) -> bool:
    return bool(re.search(r"\bdemain\b", raw))


def _mentions_after_tomorrow(raw: str) -> bool:
    return bool(re.search(r"\bapres\s*[- ]?\s*demain\b", raw))


def _mentions_yesterday(raw: str) -> bool:
    return bool(re.search(r"\bhier\b", raw))


def _mentioned_weekdays(question: str) -> list[int]:
    raw = _plain_question(question)
    found: list[int] = []
    for name, index in WEEKDAY_ALIASES.items():
        if re.search(rf"\b{re.escape(name)}\b", raw) and index not in found:
            found.append(index)
    return found


def _week_start_for_question(question: str) -> date:
    raw = _plain_question(question)
    today = date.today()
    start = today - timedelta(days=today.weekday())
    if "prochaine" in raw or "prochain" in raw or "suivante" in raw:
        return start + timedelta(days=7)
    if "derniere" in raw or "passee" in raw:
        return start - timedelta(days=7)
    return start


def _weekday_dates_for_question(question: str) -> list[date]:
    weekdays = _mentioned_weekdays(question)
    if not weekdays:
        return []

    raw = _plain_question(question)
    today = date.today()
    if "semaine" in raw or "cette" in raw or "prochaine" in raw or "prochain" in raw or "derniere" in raw or "passee" in raw:
        start = _week_start_for_question(question)
        return [start + timedelta(days=index) for index in weekdays]

    dates: list[date] = []
    for index in weekdays:
        delta = (index - today.weekday()) % 7
        if delta == 0 and ("prochain" in raw or "prochaine" in raw):
            delta = 7
        dates.append(today + timedelta(days=delta))
    return dates


def _requested_month_year(question: str) -> tuple[int, int] | None:
    normalized = " ".join(_query_tokens(question))
    raw = _plain_question(question)

    year_match = re.search(r"\b(20\d{2})\b", raw)
    year = int(year_match.group(1)) if year_match else None
    month = None
    for name, number in _MONTH_ALIASES.items():
        plain = unicodedata.normalize("NFKD", name.lower())
        plain = "".join(ch for ch in plain if not unicodedata.combining(ch))
        if re.search(rf"\b{re.escape(plain)}\b", raw):
            month = number
            break

    if month is None and ("mois" in normalized or re.search(r"\b(moi|mois|se mois|ce mois)\b", raw)):
        today = date.today()
        month = today.month
        year = year or today.year

    if month is not None:
        year = year or date.today().year
        return month, year
    return None


def _requested_full_date(question: str) -> tuple[int, int, int] | None:
    raw = _plain_question(question)
    today = date.today()
    if _mentions_after_tomorrow(raw):
        target = today + timedelta(days=2)
        return target.day, target.month, target.year
    if _mentions_tomorrow(raw):
        target = today + timedelta(days=1)
        return target.day, target.month, target.year
    if _mentions_today(raw):
        return today.day, today.month, today.year
    if _mentions_yesterday(raw):
        target = today - timedelta(days=1)
        return target.day, target.month, target.year

    year_match = re.search(r"\b(20\d{2})\b", raw)
    if not year_match:
        return None
    year = int(year_match.group(1))
    for name, month in _MONTH_ALIASES.items():
        plain = unicodedata.normalize("NFKD", name.lower())
        plain = "".join(ch for ch in plain if not unicodedata.combining(ch))
        match = re.search(rf"\b([0-3]?\d|1er)\s+{re.escape(plain)}\s+{year}\b", raw)
        if match:
            day_text = match.group(1)
            day = 1 if day_text == "1er" else int(day_text)
            if 1 <= day <= 31:
                return day, month, year
    iso = re.search(r"\b(20\d{2})[-/](0?[1-9]|1[0-2])[-/]([0-3]?\d)\b", raw)
    if iso:
        return int(iso.group(3)), int(iso.group(2)), int(iso.group(1))
    return None


def _date_label(day: int, month: int, year: int, question: str) -> str:
    raw = _plain_question(question)
    weekday = WEEKDAY_NAMES[date(year, month, day).weekday()]
    if _mentions_after_tomorrow(raw):
        return f"Après-demain, {weekday} {day} {MONTH_NAMES[month]} {year}"
    if _mentions_tomorrow(raw):
        return f"Demain, {weekday} {day} {MONTH_NAMES[month]} {year}"
    if _mentions_today(raw):
        return f"Aujourd'hui, {weekday} {day} {MONTH_NAMES[month]} {year}"
    if _mentions_yesterday(raw):
        return f"Hier, {weekday} {day} {MONTH_NAMES[month]} {year}"
    return f"Le {weekday} {day} {MONTH_NAMES[month]} {year}"


def _requested_week_dates(question: str) -> list[date] | None:
    raw = _plain_question(question)
    if "semaine" not in raw:
        return None

    today = date.today()
    start = today - timedelta(days=today.weekday())
    if "prochaine" in raw or "suivante" in raw:
        start += timedelta(days=7)
    elif "derniere" in raw or "passée" in raw or "passee" in raw:
        start -= timedelta(days=7)
    else:
        explicit = _requested_full_date(question)
        if explicit:
            day, month, year = explicit
            try:
                anchor = date(year, month, day)
                start = anchor - timedelta(days=anchor.weekday())
            except ValueError:
                return None

    return [start + timedelta(days=offset) for offset in range(7)]


def _requested_fezan_day(question: str) -> str | None:
    raw_tokens = _normalize_social(question)
    for token in raw_tokens:
        plain = unicodedata.normalize("NFKD", token.lower())
        plain = "".join(ch for ch in plain if not unicodedata.combining(ch))
        if plain in FEZAN_DAY_ALIASES:
            return FEZAN_DAY_ALIASES[plain]
    return None


def _detect_fezan_day(snippet: str) -> str:
    type_match = re.search(r"o\s*u\s*r\s+(?:d\s*e\s*)?f\s*a\s*v\s*o\s*r\s*a\s*b\s*l\s*e", snippet)
    before_type = snippet[: type_match.start()] if type_match else snippet[:120]
    best_label = "jour favorable"
    best_start = -1
    for label, pattern in _FEZAN_DAY_PATTERNS:
        for match in re.finditer(pattern, before_type):
            if match.start() > best_start:
                best_label = label
                best_start = match.start()
    return best_label


def _fezan_day_for_date(day: int, month: int, year: int) -> tuple[str, str] | None:
    text = _calendar_text()
    if not text:
        return None
    month_pattern = _calendar_letter_pattern(MONTH_NAMES[month])
    year_pattern = r"\s*".join(str(year))
    fav_pattern = r"f\s*a\s*v\s*o\s*r\s*a\s*b\s*l\s*e"
    defav_pattern = r"d\s*e\s*f\s*a\s*v\s*o\s*r\s*a\s*b\s*l\s*e"
    date_pattern = rf"\b{day}\s*(?:e\s*r\s*)?{month_pattern}\s*{year_pattern}\b"
    match = re.search(date_pattern, text)
    if not match:
        return None
    snippet = text[match.end(): match.end() + 180]
    fav = re.search(fav_pattern, snippet)
    if not fav:
        return None
    defav = re.search(defav_pattern, snippet)
    kind = "défavorable" if defav and defav.start() <= fav.start() else "favorable"
    return _detect_fezan_day(snippet), kind


def _fezan_days(month: int, year: int, kind: str | None = None) -> list[tuple[int, str, str]]:
    text = _calendar_text()
    if not text:
        return []

    days: list[tuple[int, str, str]] = []
    for day in range(1, 32):
        found = _fezan_day_for_date(day, month, year)
        if not found:
            continue
        day_label, day_kind = found
        if kind and (kind == "defavorable") != (day_kind == "défavorable"):
            continue
        days.append((day, day_label, day_kind))
    return days


def _definition_line(day_label: str) -> str:
    info = FEZAN_DAY_DEFINITIONS.get(day_label)
    if not info:
        return ""
    return f"{day_label} ({info['rank']}, jour {info['kind']}) : {info['definition']}"


def answer_fezan_day_definition(question: str) -> tuple[str, list[SearchHit]] | None:
    tokens = set(_query_tokens(question))
    asks_definition = bool(tokens & {"definition", "definir", "explique", "signifie", "type", "jour", "quoi", "dire"})
    day_label = _requested_fezan_day(question)
    if day_label and asks_definition:
        info = FEZAN_DAY_DEFINITIONS[day_label]
        answer = (
            f"{day_label} est le {info['rank']} du Fezan. C'est un jour {info['kind']}.\n"
            f"Définition : {info['definition']}\n"
            f"Usage principal : {info['uses']}."
        )
        return answer, search_knowledge(f"description {day_label} Fezan", limit=3)

    asks_all_days = (
        bool(tokens & {"type", "fezan"})
        and bool(tokens & {"liste", "different", "definition", "nom"})
        and not bool(tokens & {"favorable", "defavorable", "semaine", "mois", "calendrier"})
    )
    if asks_all_days or re.search(r"\b(tous|tout)\s+les\s+(types|jours)\b", question.lower()):
        lines = ["Les 9 types de jours du Fezan sont :"]
        lines.extend(f"- {_definition_line(day)}" for day in FEZAN_DAY_ORDER)
        return "\n".join(lines), search_knowledge("Description détaillée des différents jours du Fezan", limit=4)
    return None


def answer_fezan_date(question: str) -> tuple[str, list[SearchHit]] | None:
    requested = _requested_full_date(question)
    if not requested:
        return None
    tokens = set(_query_tokens(question))
    raw = _plain_question(question)
    relative_date = (
        _mentions_today(raw)
        or _mentions_tomorrow(raw)
        or _mentions_after_tomorrow(raw)
        or _mentions_yesterday(raw)
    )
    if not relative_date and not (tokens & {"fezan", "jour", "type", "favorable", "defavorable", "ouvrir", "ouverture", "boutique", "entreprise", "commerce", "marche", "date"}):
        return None
    day, month, year = requested
    found = _fezan_day_for_date(day, month, year)
    month_label = MONTH_NAMES[month]
    if not found:
        return (
            f"Je n'ai pas assez d'informations dans ma base Fezan pour déterminer le type du {day} {month_label} {year}.",
            [],
        )
    day_label, kind = found
    info = FEZAN_DAY_DEFINITIONS.get(day_label, {})
    label = _date_label(day, month, year, question)
    asks_bad = "defavorable" in tokens or "mauvais" in tokens or bool(re.search(r"\b(mauvais|pas bon|defavorable)\b", raw))
    asks_good = "favorable" in tokens or "bon" in tokens or bool(re.search(r"\b(favorable|bon)\b", raw))
    if asks_bad or asks_good:
        expected_kind = "défavorable" if asks_bad and not asks_good else "favorable"
        prefix = "Oui" if kind == expected_kind else "Non"
        answer = (
            f"{prefix}. {label} est un jour {day_label}, donc un jour {kind}.\n"
            f"Définition : {info.get('definition', 'définition non trouvée dans ma base structurée.')}"
        )
    else:
        answer = (
            f"{label} est un jour {day_label}, donc un jour {kind}.\n"
            f"Définition : {info.get('definition', 'définition non trouvée dans ma base structurée.')}"
        )
    return answer, search_knowledge(f"{day} {month_label} {year} {day_label} Fezan", limit=3)


def answer_fezan_week(question: str) -> tuple[str, list[SearchHit]] | None:
    week_dates = _requested_week_dates(question)
    if not week_dates:
        return None

    tokens = set(_query_tokens(question))
    asks_defavorable = "defavorable" in tokens or bool(re.search(r"d[eé]favor", question.lower()))
    asks_favorable = "favorable" in tokens and not asks_defavorable
    kind_filter = "défavorable" if asks_defavorable else "favorable" if asks_favorable else None

    rows: list[tuple[date, str, str]] = []
    for current in week_dates:
        found = _fezan_day_for_date(current.day, current.month, current.year)
        if not found:
            continue
        day_label, day_kind = found
        if kind_filter and day_kind != kind_filter:
            continue
        rows.append((current, day_label, day_kind))

    start = week_dates[0]
    end = week_dates[-1]
    period = f"du {start.day} {MONTH_NAMES[start.month]} {start.year} au {end.day} {MONTH_NAMES[end.month]} {end.year}"
    label = "défavorables" if kind_filter == "défavorable" else "favorables" if kind_filter == "favorable" else "du calendrier Fezan"

    if not rows:
        return (
            f"Je n'ai pas assez d'informations dans ma base Fezan pour donner les jours {label} de la semaine {period}.",
            [],
        )

    lines = [f"Pour la semaine {period}, voici les jours {label} :"]
    for current, day_label, day_kind in rows:
        lines.append(
            f"- {WEEKDAY_NAMES[current.weekday()]} {current.day} {MONTH_NAMES[current.month]} {current.year} : {day_label} ({day_kind})"
        )
    return "\n".join(lines), search_knowledge(f"calendrier Fezan semaine {period} jours {label}", limit=3)


def answer_fezan_weekday(question: str) -> tuple[str, list[SearchHit]] | None:
    dates = _weekday_dates_for_question(question)
    if not dates:
        return None

    tokens = set(_query_tokens(question))
    raw = _plain_question(question)
    asks_bad = "defavorable" in tokens or "mauvais" in tokens or bool(re.search(r"\b(mauvais|pas bon|defavorable)\b", raw))
    asks_good = "favorable" in tokens or "bon" in tokens or bool(re.search(r"\b(favorable|bon)\b", raw))

    rows: list[tuple[date, str, str]] = []
    for current in dates:
        found = _fezan_day_for_date(current.day, current.month, current.year)
        if found:
            day_label, day_kind = found
            rows.append((current, day_label, day_kind))

    if not rows:
        return "Je n'ai pas assez d'informations dans ma base Fezan pour répondre sur ce jour de semaine.", []

    if len(rows) == 1:
        current, day_label, day_kind = rows[0]
        info = FEZAN_DAY_DEFINITIONS.get(day_label, {})
        label = f"{WEEKDAY_NAMES[current.weekday()]} {current.day} {MONTH_NAMES[current.month]} {current.year}"
        if asks_bad or asks_good:
            expected_kind = "défavorable" if asks_bad and not asks_good else "favorable"
            prefix = "Oui" if day_kind == expected_kind else "Non"
            answer = (
                f"{prefix}. Le {label} est un jour {day_label}, donc un jour {day_kind}.\n"
                f"Définition : {info.get('definition', 'définition non trouvée dans ma base structurée.')}"
            )
        else:
            answer = (
                f"Le {label} est un jour {day_label}, donc un jour {day_kind}.\n"
                f"Définition : {info.get('definition', 'définition non trouvée dans ma base structurée.')}"
            )
        return answer, search_knowledge(f"{label} {day_label} Fezan", limit=3)

    lines = ["Voici les types Fezan des jours demandés :"]
    for current, day_label, day_kind in rows:
        lines.append(
            f"- {WEEKDAY_NAMES[current.weekday()]} {current.day} {MONTH_NAMES[current.month]} {current.year} : {day_label} ({day_kind})"
        )
    return "\n".join(lines), search_knowledge("calendrier Fezan jours de semaine", limit=3)


def answer_fezan_overview(question: str) -> tuple[str, list[SearchHit]] | None:
    tokens = set(_query_tokens(question))
    raw = _plain_question(question)

    asks_identity = (
        "fezan" in tokens
        and (
            bool(tokens & {"quoi", "definition", "definir", "explique", "fonctionne", "utilise", "sert"})
            or bool(re.search(r"\b(c est quoi|quest ce que|qu est ce que|a quoi sert|comment marche|comment fonctionne)\b", raw))
        )
    )
    if asks_identity:
        answer = (
            "Le Fezan est un outil qui aide à choisir la meilleure date pour un événement important ou décisif.\n"
            "Il est basé sur le cycle lunaire et sur 9 types de jours : Medjo, Mekou, Vodoun, Azon, Vo, Akoue / Houe, Bo, Hin / Fo et Fa.\n"
            "Chaque date a donc un type de jour, favorable ou défavorable, qui peut orienter les décisions comme voyage, cérémonie, mariage, ouverture de boutique, entreprise ou marché."
        )
        return answer, search_knowledge("Le Fêzan outil choisir meilleure date événement important cycle lunaire", limit=4)

    asks_bad_days = (
        ("mauvais" in tokens or "malheur" in tokens or "defavorable" in tokens)
        and bool(tokens & {"jour", "date", "fezan"})
        and not (_requested_month_year(question) or _requested_week_dates(question))
    )
    if asks_bad_days:
        answer = (
            "Dans le Fezan, les jours défavorables principaux sont Mekou, Azon, Akoue / Houe et Hin / Fo.\n"
            "- Mekou : jour associé à la mort et au malheur.\n"
            "- Azon : jour associé à la maladie et à la malédiction.\n"
            "- Akoue / Houe : jour du jugement, lié aux disputes et conflits.\n"
            "- Hin / Fo : jour de la misère, déconseillé pour entreprendre quelque chose d'important.\n"
            "Le document précise aussi que certaines dates peuvent être de mauvais jours de l'année, même si le type Fezan paraît favorable."
        )
        return answer, search_knowledge("Les mauvais jours du FEZAN mauvais jours année même si favorable", limit=4)

    asks_good_days = (
        ("bon" in tokens or "meilleur" in tokens or "favorable" in tokens)
        and bool(tokens & {"jour", "date", "fezan"})
        and not (_requested_month_year(question) or _requested_week_dates(question))
    )
    if asks_good_days:
        answer = (
            "Dans le Fezan, les jours favorables principaux sont Medjo, Vodoun, Vo, Bo et Fa.\n"
            "- Medjo : très favorable pour entreprendre quelque chose d'important.\n"
            "- Vodoun : favorable, surtout pour les cérémonies cultuelles.\n"
            "- Vo : favorable pour les sacrifices et protections.\n"
            "- Bo : favorable pour les travaux liés au sort.\n"
            "- Fa : favorable pour consulter l'oracle et chercher une orientation."
        )
        return answer, search_knowledge("jours favorables Fezan Medjo Vodoun Vo Bo Fa", limit=4)

    asks_capabilities = bool(re.search(r"\b(que peux tu faire|tu peux faire quoi|aide moi|exemples?|comment t utiliser)\b", raw))
    if asks_capabilities:
        answer = (
            "Tu peux me demander par exemple :\n"
            "- si aujourd'hui, demain ou une date précise est favorable ;\n"
            "- les jours favorables ou défavorables d'une semaine ou d'un mois ;\n"
            "- le meilleur jour pour ouvrir une boutique, une entreprise ou un marché ;\n"
            "- la définition d'un type de jour comme Fa, Bo, Medjo ou Azon ;\n"
            "- la liste des 9 types de jours du Fezan."
        )
        return answer, []

    return None


def answer_fezan_activity(question: str) -> tuple[str, list[SearchHit]] | None:
    tokens = set(_query_tokens(question))
    activity_tokens = {"boutique", "entreprise", "commerce", "marche", "ouvrir", "ouverture", "lancer", "commencer", "projet"}
    subject_tokens = {"boutique", "entreprise", "commerce", "marche", "projet"}
    if not (tokens & activity_tokens):
        return None
    if not (tokens & subject_tokens):
        return None

    requested = _requested_month_year(question)
    if not requested and not (tokens & {"fezan", "jour", "mois", "favorable", "date", "calendrier"}):
        return None
    if not requested:
        today = date.today()
        requested = (today.month, today.year)
    month, year = requested
    days = _fezan_days(month, year, "favorable")
    month_label = f"{MONTH_NAMES[month]} {year}"
    raw = _plain_question(question)
    if "boutique" in tokens:
        activity_label = "ta boutique"
    elif "entreprise" in tokens:
        activity_label = "ton entreprise"
    elif "marche" in tokens:
        activity_label = "ton marché"
    elif "commerce" in tokens:
        activity_label = "ton commerce"
    elif "projet" in tokens:
        activity_label = "ton projet"
    elif "ouvrir" in tokens or "ouverture" in tokens:
        activity_label = "ton ouverture"
    elif "commencer" in tokens or "lancer" in tokens:
        activity_label = "ton lancement"
    else:
        activity_label = "ton activité"

    if not days:
        return (
            f"Je n'ai pas assez d'informations dans ma base Fezan pour proposer des jours pour {activity_label} en {month_label}.",
            [],
        )

    preferred = []
    other = []
    for day, day_label, _kind in days:
        item = (day, day_label)
        if day_label == "Medjo":
            preferred.append(item)
        else:
            other.append(item)

    lines = [
        f"Pour {activity_label} en {month_label}, privilégie les jours favorables.",
        f"Le meilleur type pour {activity_label} reste Medjo, car il est favorable pour entreprendre quelque chose d'important.",
    ]
    if preferred:
        lines.append("Jours Medjo à privilégier :")
        lines.extend(
            f"- {WEEKDAY_NAMES[date(year, month, day).weekday()]} {day} {MONTH_NAMES[month]} {year} : Medjo"
            for day, _label in preferred
        )
    lines.append("Autres jours favorables possibles :")
    lines.extend(
        f"- {WEEKDAY_NAMES[date(year, month, day).weekday()]} {day} {MONTH_NAMES[month]} {year} : {day_label}"
        for day, day_label in other
    )
    lines.append("Définition de Medjo : " + FEZAN_DAY_DEFINITIONS["Medjo"]["definition"])
    return "\n".join(lines), search_knowledge(f"Fezan {raw} {MONTH_NAMES[month]} {year}", limit=4)

def answer_fezan_calendar(question: str) -> tuple[str, list[SearchHit]] | None:
    tokens = set(_query_tokens(question))
    raw = question.lower()
    asks_defavorable = "defavorable" in tokens or bool(re.search(r"d[eé]favor", raw))
    asks_favorable = "favorable" in tokens and not asks_defavorable
    asks_calendar = bool(tokens & {"calendrier", "fezan", "favorable", "defavorable", "jour"}) or "fezan" in raw
    if not asks_calendar:
        return None
    if not ({"favorable", "defavorable", "jour", "calendrier", "fezan"} & tokens):
        return None

    requested = _requested_month_year(question)
    if requested is None and (asks_favorable or asks_defavorable) and _LAST_FEZAN_CONTEXT:
        requested = (int(_LAST_FEZAN_CONTEXT["month"]), int(_LAST_FEZAN_CONTEXT["year"]))
    if not requested:
        return None

    month, year = requested
    kind = "defavorable" if asks_defavorable else "favorable" if asks_favorable else None
    days = _fezan_days(month, year, kind)
    month_label = f"{MONTH_NAMES[month]} {year}"
    label = "défavorables" if kind == "defavorable" else "favorables" if kind == "favorable" else "du calendrier Fezan"
    if not days:
        return (
            f"Je n'ai pas assez d'informations dans ma base Fezan pour donner les jours {label} de {month_label}.",
            [],
        )

    _LAST_FEZAN_CONTEXT.clear()
    _LAST_FEZAN_CONTEXT.update({"month": month, "year": year, "kind": kind})
    lines = [f"Pour {month_label}, les jours {label} que je peux indiquer sont :"]
    if kind is None:
        lines.extend(
            f"- {WEEKDAY_NAMES[date(year, month, day).weekday()]} {day} {MONTH_NAMES[month]} {year} : {day_label} ({day_kind})"
            for day, day_label, day_kind in days
        )
    else:
        lines.extend(
            f"- {WEEKDAY_NAMES[date(year, month, day).weekday()]} {day} {MONTH_NAMES[month]} {year} : {day_label}"
            for day, day_label, _day_kind in days
        )
    return "\n".join(lines), search_knowledge(f"calendrier Fezan {MONTH_NAMES[month]} {year} jours {label}", limit=3)
DEITY_LIST = [
    "Heviosso / Hêbiosso (feu, foudre)",
    "Ayidohwedo (air)",
    "Dan (eau, serpent, prospérité)",
    "Sakpata (terre, maladie/variole)",
    "Ogou / Ogoun / Gu (fer, guerre, armes)",
    "Damballa Woedo",
    "Oxumare / Dan / Tovodoun / Nensuxué",
    "Loko Atissou / Loko",
    "Ayizan / Ayizan Avlékété / Ayizan DODO",
    "Fâ / Ifa / Afa (oracle, destin)",
    "Erzulie (amour)",
    "Oro (air)",
    "Tohossou (eau)",
    "Egun (esprit des morts / ancêtres)",
    "Zangbeto",
    "Xoxo (jumeaux)",
]


def answer_structured_question(question: str) -> tuple[str, list[SearchHit]] | None:
    tokens = set(_query_tokens(question))
    if not tokens:
        return None

    for handler in (
        answer_fezan_date,
        answer_fezan_activity,
        answer_fezan_weekday,
        answer_fezan_week,
        answer_fezan_overview,
        answer_fezan_day_definition,
        answer_fezan_calendar,
    ):
        fezan_answer = handler(question)
        if fezan_answer:
            return fezan_answer

    asks_deities = bool(tokens & {"divinite", "vodoun", "vaudou", "dieu", "dieux", "orisha"})
    asks_definition = bool(tokens & {"definition", "definir", "explique", "role", "fonction", "signifie"})
    if asks_deities and not asks_definition:
        hits = search_knowledge("divinités vaudou vodoun Dan Sakpata Heviosso Ogou Fa Xoxo", limit=4)
        answer = "Voici les divinités que je peux citer :\n" + "\n".join(
            f"- {name}" for name in DEITY_LIST
        )
        return answer, hits

    return None

def _clean_answer(answer: str, hits: list[SearchHit]) -> str:
    answer = (answer or "").strip()
    for marker in ("\nQuestion utilisateur:", "\nContexte documentaire:", "\nContexte Fezan:", "\nUser question:"):
        if marker in answer:
            answer = answer.split(marker, 1)[0].strip()

    lines = []
    for line in answer.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        low = stripped.lower()
        if low.startswith("source:") or low.startswith("sources:"):
            continue
        if re.search(r"\b(page|passage)\s+\d+\b", low) and (".pdf" in low or ".docx" in low or ".mhtml" in low):
            continue
        lines.append(stripped)
    cleaned = "\n".join(lines).strip()
    if not cleaned:
        return "Je n'ai pas assez d'informations dans ma base Fezan pour répondre clairement à cette question."
    return cleaned


def answer_from_pdfs(question: str) -> tuple[str, list[SearchHit]]:
    social = answer_social_message(question)
    if social:
        return social, []

    structured = answer_structured_question(question)
    if structured:
        return structured

    hits = search_knowledge(question)
    if not hits:
        return (
            "Je n'ai pas assez d'informations dans ma base Fezan pour répondre clairement à cette question.",
            [],
        )

    context = "\n\n".join(
        f"[Passage {i}]\n{h.text}"
        for i, h in enumerate(hits, 1)
    )
    prompt = f"""Tu es Amangninou IA, un assistant spécialisé dans le Fezan.
Ta seule base de connaissances Fezan est constituée des PDF Fezan intégrés dans le système.
Réponds uniquement avec les informations présentes dans le contexte Fezan.
Si le contexte ne suffit pas, dis simplement que tu n'as pas assez d'informations pour répondre clairement.
Réponds toujours en français correct, simple, court et naturel, sauf si l'utilisateur demande explicitement une traduction.
Soigne les accords, les accents, les apostrophes et la ponctuation. Évite les tournures anglaises.
N'indique jamais de nom de fichier, de page, de score ou de source dans une réponse normale. N'utilise pas l'anglais dans une réponse normale.

Contexte Fezan:
{context}

Question utilisateur:
{question}
"""
    answer = call_llm_text(prompt, timeout=180).strip()
    if not answer:
        answer = hits[0].text
    answer = _clean_answer(answer, hits)

    target = detect_translation_target(question)
    if target:
        answer = translate_text(answer, target)

    return polish_french(answer), hits

























