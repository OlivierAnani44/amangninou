# Amangninou

Web app mobile React + Python pour présenter Togbe Amangninou, ses services, les rituels Vodou africains, les plantes traditionnelles et une boutique simple.

Le frontend est configuré comme PWA avec manifeste, icônes, visuel d’accueil et service worker. L’interface est responsive pour mobile, tablette et ordinateur.

## Structure

```text
backend/
  server.py                  API Python locale
  requirements.txt           dépendances Python du backend
frontend/
  public/                    fichiers PWA et images publiques
  src/
    components/              composants React réutilisables
    components/sections/     sections du site
    data/siteContent.js      contenu éditable du site
    hooks/useActiveTab.js    gestion des onglets via l'URL
    pages/                   un fichier par onglet du site
    App.jsx                  assemblage de l'application
    styles.css               système responsive global
Mark-XLVI-main/              noyau IA local Amangninou IA Fezan
```

## Lancer le frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Le frontend dev est disponible sur `http://127.0.0.1:5173`.

Pour tester depuis un téléphone sur le même Wi-Fi :

```powershell
cd frontend
npm.cmd run dev:mobile
```

Dans un autre terminal, trouvez l’adresse IPv4 du PC :

```powershell
ipconfig
```

Ouvrez ensuite sur le téléphone : `http://ADRESSE-IP-DU-PC:5173`.

Exemple : `http://192.168.1.25:5173`.

## Lancer le backend Python

Installez d'abord la synthèse vocale du backend :

```powershell
python -m pip install -r backend/requirements.txt
```

Pour utiliser toute la base IA Mark-XLVI, installez aussi ses dépendances :

```powershell
python -m pip install -r Mark-XLVI-main/requirements.txt
```

Dans un autre terminal, depuis la racine du projet :

```powershell
python backend/server.py
```

API locale :

- `GET http://127.0.0.1:8000/api/health`
- `GET http://127.0.0.1:8000/api/site`
- `GET http://127.0.0.1:8000/api/services`
- `GET http://127.0.0.1:8000/api/products`
- `GET http://127.0.0.1:8000/api/rituals`
- `POST http://127.0.0.1:8000/api/contact`
- `GET http://127.0.0.1:8000/api/ai/health`
- `GET http://127.0.0.1:8000/api/ai/today`
- `POST http://127.0.0.1:8000/api/ai/chat`

Le backend écoute aussi sur le réseau local pour le test mobile. Depuis le téléphone, l’API sera appelée via `http://ADRESSE-IP-DU-PC:8000`.

L'IA utilise `Mark-XLVI-main` comme noyau Fezan. Elle répond sur le calendrier Fezan, les dates, les jours favorables ou défavorables, les types de jours et les usages Fezan à partir des PDF intégrés dans `Mark-XLVI-main/documents_pdf/`.

Elle peut aussi répondre aux informations utiles du site : services, boutique, rituels, contact, profil, témoignages, astuces et réseaux sociaux. Pour les questions hors périmètre, elle oriente vers Togbe Amangninou.

Quand l'utilisateur pose une question, le frontend envoie aussi à l'API IA un résumé du contenu actif de l'app : services, produits, rituels, vidéos, témoignages, contacts et éléments de confiance. Les produits ou services ajoutés depuis l'admin sont donc repris automatiquement par l'IA dans ses réponses.

La synthèse vocale utilise `edge_tts` avec la voix `fr-FR-HenriNeural`, puis renvoie l'audio MP3 au frontend en base64.

L'onglet IA Fezan permet aussi d'activer une notification quotidienne du type de jour Fezan. Le navigateur demande l'autorisation à l'utilisateur, puis l'app envoie une notification par jour avec le type de jour et sa définition quand la PWA est ouverte, relancée ou redevient active.

## Build et preview PWA

```powershell
cd frontend
npm.cmd run build
npm.cmd run preview
```

Le preview de production est disponible sur `http://127.0.0.1:4173`.

Preview PWA accessible sur mobile :

```powershell
cd frontend
npm.cmd run preview:mobile
```

Puis ouvrez `http://ADRESSE-IP-DU-PC:4173` sur le téléphone.

## Déployer sur GitHub Pages

GitHub Pages héberge le frontend statique. Le backend Python ne tourne pas sur GitHub Pages ; en ligne, le formulaire prépare donc un message WhatsApp si aucune API externe n’est configurée.
L'onglet IA Fezan fonctionne seulement si un backend Python accessible est lancé pour répondre aux routes `/api/ai/*`.

1. Créez un repository GitHub, par exemple `amangninou`.
2. Depuis la racine du projet, liez le repository distant :

```powershell
git remote add origin https://github.com/OlivierAnani44/amangninou.git
git branch -M main
git add .
git commit -m "Prepare GitHub Pages deployment"
git push -u origin main
```

3. Sur GitHub, ouvrez le repository puis allez dans `Settings > Pages`.
4. Dans `Build and deployment`, choisissez `Source: GitHub Actions`.
5. Le workflow `.github/workflows/deploy-pages.yml` construira `frontend` et publiera `frontend/dist`.

L’URL sera généralement :

```text
https://VOTRE-UTILISATEUR.github.io/amangninou/
```

Pour un repository spécial nommé `VOTRE-UTILISATEUR.github.io`, l’URL sera :

```text
https://VOTRE-UTILISATEUR.github.io/
```

## Modifier le contenu

La majorité des textes, produits, services, témoignages et contacts se modifie dans `frontend/src/data/siteContent.js`.

## Ajouter la photo du propriétaire

Placez la photo dans `frontend/public/images/proprietaire.jpg`.

Le cadre de l'accueil l'utilise automatiquement. Si le fichier n'existe pas encore, l'application affiche un emplacement propre avec les initiales.

## Travailler par onglet

Chaque onglet du site a son fichier dédié :

- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/AiPage.jsx`
- `frontend/src/pages/ServicesPage.jsx`
- `frontend/src/pages/TestimonialsPage.jsx`
- `frontend/src/pages/ShopPage.jsx`
- `frontend/src/pages/RitualsPage.jsx`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/ContactPage.jsx`

Les URL restent simples : `#accueil`, `#ia`, `#services`, `#temoignages`, `#boutique`, `#rituel`, `#profil`, `#contact`.
