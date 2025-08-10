# AntiPhish — Protection contre le phishing

Front-end simple et accessible pour scanner des URL et fichiers via l’API VirusTotal, avec interface multilingue (Français/Eʋe) et un chatbot local d’aide sur le phishing.

## Démarrer
- Ouvrez `index.html` dans un serveur statique (ex: VS Code Live Server) ou double‑cliquez.
- Renseignez votre clé VirusTotal dans `script.js` (variable `API_KEY`). Ne commitez jamais votre clé réelle.

## Fonctionnalités
- Scan d’URL et de fichiers (jusqu’à 32 Mo) via VirusTotal
- Rapport visuel: verdict, barres de progression, détails par moteur
- Multilingue: FR/Eʋe (sélecteur en en‑tête)
- Chatbot local (FR/Eʋe) avec conseils anti‑phishing
- Accessibilité: labels, aria‑roles, aria‑live
- Responsive: mobile et desktop

## À faire côté back‑end
- Proxifier l’API VirusTotal (sécurité de la clé) et ajouter un endpoint `/chat` pour un futur chatbot connecté si besoin.

## Crédit
Travail initial par l’équipe. Refonte UI/UX et multilingue ajoutés pour hackathon.
