# Amangninou

Web app mobile React + Python pour présenter Togbe Amangninou, ses services, les rituels Vodou africains, les plantes traditionnelles et une boutique simple.

Le frontend est configuré comme PWA avec manifeste, icônes, visuel d’accueil et service worker. L’interface est responsive pour mobile, tablette et ordinateur.

## Structure

```text
backend/
  server.py                  API Python locale
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

Le backend écoute aussi sur le réseau local pour le test mobile. Depuis le téléphone, l’API sera appelée via `http://ADRESSE-IP-DU-PC:8000`.

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

1. Créez un repository GitHub, par exemple `amangninou`.
2. Depuis la racine du projet, liez le repository distant :

```powershell
git remote add origin https://github.com/VOTRE-UTILISATEUR/amangninou.git
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

## Travailler par onglet

Chaque onglet du site a son fichier dédié :

- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/ServicesPage.jsx`
- `frontend/src/pages/TestimonialsPage.jsx`
- `frontend/src/pages/ShopPage.jsx`
- `frontend/src/pages/RitualsPage.jsx`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/ContactPage.jsx`

Les URL restent simples : `#accueil`, `#services`, `#temoignages`, `#boutique`, `#rituel`, `#profil`, `#contact`.
