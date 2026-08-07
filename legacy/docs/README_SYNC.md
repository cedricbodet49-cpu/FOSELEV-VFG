# Synchronisation FOSELEV VFG 2.1.0

1. Configure l’URL Supabase sans `/rest/v1` et la clé publique.
2. Connecte le PC et l’iPhone avec le même compte.
3. À l’enregistrement d’une visite, l’application écrit immédiatement dans `public.vfg_visits`.
4. Si Internet ou Supabase est indisponible, la visite reste locale et sera envoyée avec le bouton **Synchroniser**.
5. Pour vérifier, ouvre Supabase > Table Editor > `vfg_visits`. Une ligne doit apparaître dès l’enregistrement.
