export const navigationItems = [
  { id: "accueil", label: "Accueil", href: "#accueil", icon: "Home" },
  { id: "services", label: "Services", href: "#services", icon: "ShieldCheck" },
  { id: "temoignages", label: "Confiance", href: "#temoignages", icon: "MessageCircle" },
  { id: "boutique", label: "Boutique", href: "#boutique", icon: "ShoppingBag" },
  { id: "rituel", label: "Rituels", href: "#rituel", icon: "BookOpenText" },
  { id: "profil", label: "Profil", href: "#profil", icon: "UserRound" },
  { id: "contact", label: "Contact", href: "#contact", icon: "MessageCircle" },
];

export const primaryTabIds = ["accueil", "services", "boutique", "rituel", "profil"];

export const secondaryNavigationItems = [
  { id: "contact", label: "Contact", href: "#contact", icon: "MessageCircle" },
  { id: "temoignages", label: "Confiance", href: "#temoignages", icon: "BadgeCheck" },
  { id: "securite", label: "Sécurité", href: "#profil", icon: "LockKeyhole" },
  { id: "mentions", label: "Mentions", href: "#contact", icon: "FileText" },
  { id: "parametres", label: "Paramètres", href: "#profil", icon: "Settings" },
];

export const pageIntros = {
  services: {
    eyebrow: "Services",
    title: "Accompagnement spirituel",
    description:
      "Les besoins sont regroupés clairement pour trouver le bon échange sans confusion.",
    icon: "ShieldCheck",
    action: { label: "Demander conseil", href: "#contact", icon: "MessageCircle" },
  },
  temoignages: {
    eyebrow: "Confiance",
    title: "Preuves et retours d’expérience",
    description:
      "Retours d’expérience, règles de prudence et preuves présentées sans promesse automatique.",
    icon: "BadgeCheck",
    action: { label: "Poser une question", href: "#contact", icon: "MessageCircle" },
  },
  boutique: {
    eyebrow: "Boutique",
    title: "Boutique traditionnelle",
    description:
      "Des catégories simples, des précautions lisibles et un panier clair avant toute commande.",
    icon: "ShoppingBag",
    action: { label: "Voir les produits", href: "#boutique", icon: "ShoppingBag" },
  },
  rituel: {
    eyebrow: "Rituels",
    title: "Rituels Vodou africains",
    description:
      "Fa, Dan, Sakpata et Hebiesso sont présentés avec sobriété, contexte et orientation.",
    icon: "BookOpenText",
    action: { label: "Demander une consultation", href: "#contact", icon: "MessageCircle" },
  },
  profil: {
    eyebrow: "Profil",
    title: "Espace profil",
    description:
      "Compte facultatif, notifications choisies, sécurité renforcée et paramètres simples.",
    icon: "UserRound",
    action: { label: "Configurer le profil", href: "#profil", icon: "Settings" },
  },
  contact: {
    eyebrow: "Contact",
    title: "Contact discret",
    description:
      "Un message clair permet d’orienter la demande avant toute consultation ou commande.",
    icon: "MessageCircle",
    action: { label: "Écrire sur WhatsApp", href: "https://wa.me/22900000000", icon: "MessageCircle" },
  },
};

export const heroStats = [
  { value: "24h", label: "réponse prioritaire" },
  { value: "Sécurité", label: "compte protégé" },
];

export const ownerProfile = {
  name: "Togbe Amangninou",
  role: "Propriétaire du site",
  specialty: "Spiritualité africaine, plantes traditionnelles et accompagnement discret",
  imageSrc: "images/proprietaire.jpg",
  initials: "TA",
};

export const serviceHighlights = [
  "Contact discret",
  "Compte facultatif",
  "Boutique sécurisée",
];

export const quickProofs = [
  { title: "Contact discret", icon: "MessageCircle", text: "Un premier échange simple, sans inscription obligatoire." },
  { title: "Compte facultatif", icon: "UserRound", text: "Le profil sert au suivi, mais le contenu reste consultable." },
  { title: "Boutique sécurisée", icon: "ShoppingBag", text: "Produits, précautions et panier restent lisibles avant commande." },
];

export const serviceCategories = [
  { label: "Spiritualité", icon: "Sparkles" },
  { label: "Couple", icon: "HeartHandshake" },
  { label: "Protection", icon: "ShieldCheck" },
  { label: "Plantes", icon: "Leaf" },
  { label: "Géomancie", icon: "Rows3" },
];

export const processSteps = [
  {
    title: "Contact",
    icon: "MessageCircle",
    text: "Vous expliquez votre situation et choisissez le canal le plus discret.",
  },
  {
    title: "Orientation",
    icon: "Compass",
    text: "La demande est clarifiée avant de proposer une consultation, un rituel ou un produit.",
  },
  {
    title: "Suivi",
    icon: "CalendarClock",
    text: "Le compte et les rappels servent uniquement si vous souhaitez garder un historique.",
  },
];

export const services = [
  {
    title: "Consultation spirituelle",
    label: "Diagnostic",
    category: "Spiritualité",
    icon: "Sparkles",
    problem: "Comprendre une situation confuse",
    description:
      "Échange confidentiel pour comprendre la situation, poser les bonnes questions et orienter vers un accompagnement adapté.",
    points: ["Analyse du besoin", "Conseil personnalisé", "Suivi clair"],
  },
  {
    title: "Protection et purification",
    label: "Rituel",
    category: "Protection",
    icon: "ShieldCheck",
    problem: "Assainir un lieu ou renforcer une protection",
    description:
      "Accompagnement traditionnel pour purifier un lieu, renforcer la protection personnelle ou préparer une démarche spirituelle.",
    points: ["Maison", "Travail", "Protection personnelle"],
  },
  {
    title: "Couple et affection",
    label: "Relation",
    category: "Couple",
    icon: "HeartHandshake",
    problem: "Apaiser les blocages affectifs",
    description:
      "Écoute et orientation autour des blocages affectifs, des tensions de couple et des situations familiales sensibles.",
    points: ["Dialogue", "Apaisement", "Stabilité"],
  },
  {
    title: "Plantes traditionnelles",
    label: "Bien-être",
    category: "Plantes",
    icon: "Leaf",
    problem: "Choisir une préparation avec prudence",
    description:
      "Présentation de plantes et préparations traditionnelles utilisées pour le bien-être général, avec conseils de prudence.",
    points: ["Bains", "Infusions", "Huiles"],
  },
  {
    title: "Géomancie Fa",
    label: "Orientation",
    category: "Géomancie",
    icon: "Rows3",
    problem: "Éclairer une décision importante",
    description:
      "Lecture traditionnelle pour éclairer une décision, comprendre un blocage et choisir une démarche avec plus de recul.",
    points: ["Questions", "Lecture", "Orientation"],
  },
  {
    title: "Accompagnement discret",
    label: "Suivi",
    category: "Spiritualité",
    icon: "MessagesSquare",
    problem: "Garder un fil clair après le premier échange",
    description:
      "Canal de contact clair, rappels, suivi des demandes et historique personnel si vous choisissez de créer un compte.",
    points: ["Rappels", "Notifications", "Historique"],
  },
];

export const trustItems = [
  {
    title: "Transparence",
    icon: "BadgeCheck",
    text: "Les étapes sont expliquées avant tout engagement. Le site évite les promesses impossibles et les garanties abusives.",
  },
  {
    title: "Preuves vérifiables",
    icon: "FileCheck2",
    text: "Les témoignages sont présentés comme des retours d’expérience, anonymisés et séparés des informations de vente.",
  },
  {
    title: "Respect de la santé",
    icon: "Cross",
    text: "Les plantes sont présentées pour le bien-être traditionnel et ne remplacent pas un médecin ou un traitement prescrit.",
  },
];

export const testimonials = [
  {
    name: "A. K.",
    context: "Accompagnement personnel",
    quote:
      "J’ai apprécié la clarté de l’échange et le suivi. Les étapes étaient simples à comprendre et je me suis senti respecté.",
  },
  {
    name: "M. D.",
    context: "Conseil autour du couple",
    quote:
      "La consultation m’a aidé à prendre du recul. Le contact est resté discret, avec des rappels utiles après le premier échange.",
  },
  {
    name: "S. F.",
    context: "Produit traditionnel",
    quote:
      "La boutique explique bien l’usage conseillé et les précautions. J’ai pu poser mes questions avant de commander.",
  },
];

export const products = [
  {
    id: "purification-maison",
    name: "Pack purification maison",
    category: "Protection",
    filter: "Rituels",
    price: 12000,
    icon: "Home",
    badges: ["Produit traditionnel", "Conseils inclus", "Usage prudent"],
    description:
      "Ensemble traditionnel pour purifier un espace de vie avec une fiche de conseils et de précautions.",
  },
  {
    id: "bain-protection",
    name: "Bain de protection",
    category: "Rituel",
    filter: "Rituels",
    price: 9500,
    icon: "Droplets",
    badges: ["Produit traditionnel", "Conseils inclus"],
    description:
      "Préparation rituelle destinée aux démarches de protection personnelle et de recentrage.",
  },
  {
    id: "infusion-bien-etre",
    name: "Infusion bien-être",
    category: "Plantes",
    filter: "Plantes",
    price: 6500,
    icon: "Leaf",
    badges: ["Usage prudent", "Bien-être"],
    description:
      "Mélange traditionnel de plantes pour accompagner une routine de bien-être, avec usage prudent.",
  },
  {
    id: "encens-rituel",
    name: "Encens rituel",
    category: "Ambiance",
    filter: "Bien-être",
    price: 5000,
    icon: "Flame",
    badges: ["Produit traditionnel", "Bien-être"],
    description:
      "Encens pour les temps de prière, de purification symbolique et de préparation spirituelle.",
  },
];

export const productFilters = ["Tous", "Plantes", "Protection", "Rituels", "Bien-être"];

export const rituals = [
  {
    name: "Fa",
    subtitle: "Géomancie et orientation",
    icon: "Rows3",
    tone: "Orientation",
    details: ["Question posée", "Lecture guidée", "Décision éclairée"],
    text: "Lecture traditionnelle utilisée pour éclairer une situation, comprendre un blocage et choisir une direction.",
  },
  {
    name: "Dan",
    subtitle: "Équilibre et force vitale",
    icon: "Infinity",
    tone: "Équilibre",
    details: ["Force vitale", "Continuité", "Stabilité"],
    text: "Symbolique liée au mouvement, à l’équilibre et à la continuité dans plusieurs traditions Vodou africaines.",
  },
  {
    name: "Sakpata",
    subtitle: "Terre, protection, responsabilité",
    icon: "Mountain",
    tone: "Protection",
    details: ["Terre", "Responsabilité", "Encadrement"],
    text: "Rituel présenté avec respect, en rappelant l’importance de l’encadrement traditionnel et de la prudence.",
  },
  {
    name: "Hebiesso",
    subtitle: "Feu, justice, décision",
    icon: "Flame",
    tone: "Décision",
    details: ["Force", "Vérité", "Clarté"],
    text: "Référence spirituelle associée à la force, à la vérité et à l’énergie de décision.",
  },
  {
    name: "Autres rituels",
    subtitle: "Selon la situation",
    icon: "CircleEllipsis",
    tone: "Personnalisation",
    details: ["Écoute", "Besoin réel", "Orientation"],
    text: "L’accompagnement dépend du besoin, de l’histoire personnelle et de l’orientation donnée pendant la consultation.",
  },
];

export const profileFeatures = [
  { title: "Compte facultatif", text: "Vous pouvez consulter le site sans compte et créer un profil seulement si nécessaire." },
  { title: "Informations personnelles", text: "Nom, contact, préférences de notification et historique de demandes restent modifiables." },
  { title: "Double authentification", text: "Une vérification supplémentaire est prévue pour renforcer la sécurité du compte." },
];

export const notifications = [
  { title: "Bienvenue", icon: "BellRing", text: "Message d’accueil après inscription ou premier contact." },
  { title: "Rappels", icon: "CalendarClock", text: "Rappels de consultation, suivi et commandes." },
  { title: "Mises à jour", icon: "Megaphone", text: "Nouvelles informations, conseils utiles et promotions." },
];

export const securityItems = [
  "Chiffrement prévu pour les données sensibles",
  "Protection contre les fraudes et abus",
  "Aucune promesse automatique de résultat",
  "Consentement clair pour notifications et compte",
];

export const contactChannels = [
  { label: "WhatsApp", value: "+229 00 00 00 00", href: "https://wa.me/22900000000", icon: "MessageCircle" },
  { label: "Téléphone", value: "+229 00 00 00 00", href: "tel:+22900000000", icon: "Phone" },
  { label: "Email", value: "contact@amangninou.app", href: "mailto:contact@amangninou.app", icon: "Mail" },
];

export const formatPrice = (price) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(price);
