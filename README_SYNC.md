# FOSELEV VFG V0.7.0 — Synchronisation PC / iPhone

## Ce qui fonctionne
- Mode local et hors connexion conservé.
- Connexion à un projet Supabase.
- Création ou connexion à un compte e-mail/mot de passe.
- Envoi des visites locales vers le cloud.
- Récupération et fusion de l'historique sur un autre appareil.
- Suppression cloud lors de la synchronisation.

## Mise en service
1. Créer un projet gratuit sur Supabase.
2. Ouvrir **SQL Editor** et exécuter `SUPABASE_SETUP.sql`.
3. Dans **Project Settings > API**, copier :
   - l'URL du projet ;
   - la clé publique `anon` / publishable.
4. Publier le dossier sur GitHub Pages ou un autre hébergement HTTPS.
5. Dans l'application, ouvrir **Synchronisation** et enregistrer l'URL et la clé.
6. Créer un compte, puis utiliser le même compte sur le PC et l'iPhone.
7. Appuyer sur **Synchroniser**.

## Sécurité
La clé publique peut être présente dans l'application : les données sont protégées par les politiques RLS du fichier SQL. Ne jamais intégrer la clé `service_role`.

## Important
Un fichier `index.html` ouvert directement depuis un ZIP est adapté aux tests locaux, mais la synchronisation et l'installation PWA doivent être testées depuis une adresse HTTPS.
