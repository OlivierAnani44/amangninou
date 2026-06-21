from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import json


HOST = "0.0.0.0"
PORT = 8000

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

        routes = {
            "/api/health": {
                "status": "ok",
                "application": "Amangninou",
                "message": "Backend Python actif",
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

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), AmangninouHandler)
    print(f"Backend Amangninou actif sur http://{HOST}:{PORT}")
    server.serve_forever()
