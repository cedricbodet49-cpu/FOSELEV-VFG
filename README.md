# FOSELEV VFG V2.0.0

Version connectée à Supabase pour PC et iPhone.

## Déploiement GitHub Pages
Téléverser **le contenu de ce dossier à la racine** du dépôt FOSELEV-VFG, en remplaçant les anciens fichiers.

## Première connexion
1. Ouvrir l’application depuis GitHub Pages.
2. Aller dans **Synchronisation**.
3. Renseigner l’URL Supabase et la clé publique `sb_publishable_...`.
4. Créer un compte ou se connecter.
5. Appuyer sur **Synchroniser**.

## Base de données
Les scripts `PHASE_2_MIGRATION.sql` et `IMPORT_REFERENTIEL.sql` ont déjà été exécutés si Supabase affiche 72 agences et 797 matériels. Il ne faut pas les relancer.

## Sécurité
Ne jamais saisir ni publier une clé secrète `sb_secret_...` ou `service_role`.
