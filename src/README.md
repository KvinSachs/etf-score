# ETF Score — Expert

Analyseur de diversification de portefeuille ETF avec scoring multicritères.

## Stack
- React 18 + Vite
- PWA (installable sur mobile)
- localStorage pour la persistance

## Déploiement local

```bash
npm install
npm run dev
```

## Déploiement Vercel

1. Poussez ce dossier sur GitHub
2. Connectez-vous sur vercel.com avec votre compte GitHub
3. Cliquez "New Project" → importez le repo
4. Framework preset : **Vite**
5. Cliquez Deploy → c'est fait ✓

## Fonctionnalités

- Score /20 multicritères (géographie, secteurs, chevauchement, classes d'actifs, devises)
- Détection de chevauchement entre ETF
- Recommandations dynamiques contextuelles
- Suggestions par catégorie avec bottom sheet explicative
- Sauvegarde automatique (localStorage)
- PWA installable sur iPhone et Android
- Disclaimer réglementaire AMF
