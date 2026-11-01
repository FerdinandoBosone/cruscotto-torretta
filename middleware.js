// Chiusura temporanea del sito.
// Se su Vercel esiste la variabile SITO_CHIUSO, il sito (pagine e API) risponde
// "pagina non disponibile" a chiunque, senza rivelare nulla del contenuto.
// Per entrare comunque (uso interno): aprire una volta  /?apri=<valore di SITO_CHIUSO>
// Il browser ricorda l'accesso per 30 giorni.
// Per riaprire a tutti: cancellare la variabile SITO_CHIUSO e fare Redeploy.

export const config = { matcher: "/:path*" };

const PAGE = `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Pagina non disponibile</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f6f4;
font-family:system-ui,sans-serif;color:#444}p{font-size:18px}</style></head>
<body><p>Pagina non disponibile.</p></body></html>`;

export default function middleware(request) {
  const chiave = process.env.SITO_CHIUSO;
  if (!chiave) return; // sito aperto: prosegue normalmente

  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") || "";
  const ok = cookie.split(/;\s*/).includes("accesso=" + encodeURIComponent(chiave));

  if (url.searchParams.get("apri") === chiave) {
    url.searchParams.delete("apri");
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.pathname + url.search,
        "Set-Cookie": `accesso=${encodeURIComponent(chiave)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }
  if (ok) return;

  return new Response(PAGE, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" },
  });
}
