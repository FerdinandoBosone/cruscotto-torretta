const { configured, readState, writeState } = require("./_db");
const { checkPin } = require("./_auth");
const seed = require("./_seed");

function valid(d) {
  return d && typeof d === "object" && d.pub && Array.isArray(d.pub.punti) && Array.isArray(d.pub.conci) &&
    d.riserv && Array.isArray(d.riserv.comunicazioni) && Array.isArray(d.riserv.nc) && Array.isArray(d.riserv.documenti);
}

// GET senza codice: solo i dati pubblici del cruscotto. GET con codice (x-pin): anche l'area riservata.
// POST con codice: salvataggio con controllo di revisione.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!configured()) return res.status(500).json({ error: "Database non collegato al progetto." });
  try {
    let s = await readState();
    if (!s.data) {
      const rev = await writeState(s.rev, seed());
      s = await readState();
    }
    if (req.method === "GET") {
      if (req.headers["x-pin"]) {
        const a = await checkPin(req);
        if (!a.ok) return res.status(a.status).json({ error: a.error });
        return res.status(200).json({ rev: s.rev, data: s.data });
      }
      return res.status(200).json({ rev: s.rev, data: { pub: s.data.pub } });
    }
    if (req.method === "POST") {
      const a = await checkPin(req);
      if (!a.ok) return res.status(a.status).json({ error: a.error });
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      if (!valid(body.data)) return res.status(400).json({ error: "Dati non validi: il salvataggio è stato rifiutato." });
      if (JSON.stringify(body.data).length > 900000) return res.status(413).json({ error: "Archivio troppo grande." });
      const rev = await writeState(Number(body.rev || 0), body.data);
      if (rev === -1) {
        const cur = await readState();
        return res.status(409).json({ rev: cur.rev, data: cur.data });
      }
      return res.status(200).json({ rev, data: body.data });
    }
    return res.status(405).json({ error: "Metodo non consentito" });
  } catch (e) {
    return res.status(500).json({ error: "Errore del server: riprova tra poco." });
  }
};
