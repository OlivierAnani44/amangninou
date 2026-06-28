# Amangninou IA Fezan

Assistant IA local specialise dans le Fezan. Il repond aux questions a partir des PDF Fezan integres dans le systeme.

## Fonctionnalites

- Calendrier Fezan charge depuis `documents_pdf/`
- Questions sur les jours, les mois et les dates
- Identification du type de jour : Medjo, Mekou, Vodoun, Azon, Vo, Akoue / Houe, Bo, Hin / Fo, Fa
- Definitions des types de jours Fezan
- Recommandations pour ouvrir une boutique, une entreprise, un marche ou commencer un projet
- Liste des jours favorables et defavorables par mois
- Reponse texte en francais avec lecture audio automatique
- Interface locale et acces mobile
- Backend local avec LiteRT-LM

## Architecture

```text
documents_pdf/   PDF Fezan utilises comme connaissances
cerveau_IA/      analyse, indexation et reponses Fezan
audio/           lecture vocale
application/     interface utilisateur
memory/          memoire et index Fezan
dashboard/       acces mobile local
```

## Demarrage

```bash
pip install -r requirements.txt
playwright install
litert-lm list
python main.py
```

`python main.py` demarre automatiquement `litert-lm serve` si necessaire.

## Ajouter ou remplacer les PDF Fezan

Ajoutez les fichiers PDF Fezan dans `documents_pdf/`, puis relancez `python main.py`.
L'index Fezan est reconstruit automatiquement quand les PDF changent.
