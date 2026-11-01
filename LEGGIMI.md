# Cruscotto di monitoraggio – ex discarica C.da Torretta (dati di TEST)

Pubblicazione su Vercel, come per il sito di Scampia:

1. Crea un nuovo repository GitHub (es. `monitoraggio-torretta`) e carica TUTTI i file mantenendo la cartella `api/`
   (index.html, package.json, vercel.json, LEGGIMI.md, api/state.js, api/auth.js, api/reset.js, api/_db.js, api/_auth.js, api/_seed.js, api/_seed_core.js).
2. Su Vercel: Add New > Project > importa il repository > Deploy.
3. Su Vercel: Storage > Create Database > Upstash (Redis) > collegalo al progetto (crea da solo KV_REST_API_URL e KV_REST_API_TOKEN).
4. Su Vercel: Settings > Environment Variables > aggiungi `ADMIN_PIN` = `Torretta2026` (è la password di prova già scritta nel campo di accesso).
5. Deployments > Redeploy.

Al primo accesso il database si riempie da solo con i dati di test. Dall'area riservata > Impostazioni si ripristinano in qualsiasi momento.

Uso reale: cambiare ADMIN_PIN su Vercel e togliere la password precompilata (costante DEMO_PIN in index.html), poi sostituire i dati di test con quelli delle sonde.
