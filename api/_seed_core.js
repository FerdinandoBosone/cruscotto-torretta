// Dati di TEST (non reali) per dimostrare la procedura. Generati rispetto all'istante del ripristino.
function makeSeed(nowMs) {
  const H = 3600e3, D = 24 * H;
  const now = Math.floor(nowMs / H) * H;
  let s = 20261031;
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r1 = (v) => Math.round(v * 10) / 10, r2 = (v) => Math.round(v * 100) / 100;
  const hrs = (step) => { const a = []; for (let t = now - 14 * D; t <= now; t += step * H) a.push(t); return a; };
  const P2 = hrs(2);
  const hourOf = (t) => new Date(t).getUTCHours() + 1;

  // vento: andamento giornaliero, giornata ventosa 4 giorni fa
  const vento = P2.map((t) => { const h = hourOf(t); let v = 1.5 + 2.4 * Math.max(0, Math.sin((h - 7) / 24 * 2 * Math.PI)) + rnd() * 1.1;
    const d = (now - t) / D; if (d > 3.6 && d < 4.2) v += 8.5 * Math.sin((4.2 - d) / .6 * Math.PI); return [t, r1(v)]; });
  const pioggia = P2.map((t) => { const d = (now - t) / D; let v = 0; if (d > 8.2 && d < 8.9) v = r1(2 + rnd() * 6); return [t, v]; });
  const pm = (base, peakDay, peak) => P2.map((t) => { const h = hourOf(t); const d = (now - t) / D; let v = base + 6 * Math.max(0, Math.sin((h - 8) / 12 * Math.PI)) * (h > 7 && h < 18 ? 1 : 0) + rnd() * 4;
    if (Math.abs(d - peakDay) < .15) v += peak; return [t, r1(Math.max(0, v))]; });
  const pm1 = pm(4, 3.9, 14), pm2 = pm(5, 3.85, 24);
  // pozzo: risalita lenta e svuotamento automatico; 5 giorni fa blocco pompa (allarme)
  let liv = 1.1; const livello = [], pompa = [];
  P2.forEach((t) => { const d = (now - t) / D; liv += .05 + rnd() * .02; let on = 0;
    const blocco = d > 4.9 && d < 5.3;
    if (liv > 1.85 && !blocco) { liv = 1.05 + rnd() * .1; on = 1; }
    if (blocco) liv = Math.min(liv + .22, 2.28);
    livello.push([t, r2(liv)]); pompa.push([t, blocco ? 0 : on]); });
  const days = []; for (let t = now - 13 * D; t <= now; t += D) days.push(t);
  const volumi = days.map((t) => [t, r1(6 + rnd() * 3)]);
  // vasca: riempimento, svuotamento con autobotte 7 giorni fa
  let fill = 38; const riemp = P2.map((t) => { const d = (now - t) / D; fill += .28 + rnd() * .1; if (d > 6.9 && d < 7.05) fill = 14; return [t, r1(fill)]; });
  const interc = P2.filter((_, i) => i % 6 === 0).map((t) => [t, 0]);

  const man = (every, from, gen) => { const a = []; for (let t = now - 14 * D + from * D; t <= now - 2 * H; t += every * D) a.push([t + 9 * H, gen(t)]); return a; };
  const gas = (b, last) => { const a = man(3.5, .3, () => r2(b + rnd() * .3)); if (last != null) a[a.length - 1][1] = last; return a; };
  const cp = (drift) => { let v = 0; return man(3, 1, () => (v = r1(v + drift * (.6 + rnd())))); };

  const Z = (k, label, unit, serie, o = {}) => ({ k, label, unit, serie, ...o });
  const pub = {
    demo: true, generato: new Date(now).toISOString(),
    aree: [
      { id: "A1", nome: "Corpo rifiuti e conci", desc: "Risagomatura per conci del versante nord, capisaldi topografici" },
      { id: "A2", nome: "Percolato: pozzo e vasca", desc: "Pozzo di drenaggio con pompa e telecontrollo, vasca a doppia intercapedine" },
      { id: "A3", nome: "Aria e gas al perimetro", desc: "Centralina meteo, PM10, gas nel suolo, rumore al ricettore" },
      { id: "A4", nome: "Acque e fossi di guardia", desc: "Pozzetti di confluenza dei fossi, controllo visivo delle acque" },
      { id: "A5", nome: "Strada e campo base", desc: "Strada di accesso, lavaggio gomme, area di cantiere" },
    ],
    punti: [
      { id: "MET", area: "A3", tipo: "auto", nome: "Centralina meteo", x: 1395, y: 505, par: [
        Z("vento", "Velocità del vento", "m/s", vento, { att: 5, all: 10 }), Z("pioggia", "Pioggia", "mm/h", pioggia)] },
      { id: "PM1", area: "A3", tipo: "auto", nome: "PM10 lato strada nord", x: 880, y: 500, par: [
        Z("pm10", "PM10 in più rispetto al fondo", "µg/m³", pm1, { att: 20, all: 50 })] },
      { id: "PM2", area: "A3", tipo: "auto", nome: "PM10 lato fabbricati agricoli", x: 1060, y: 1660, par: [
        Z("pm10", "PM10 in più rispetto al fondo", "µg/m³", pm2, { att: 20, all: 50 })] },
      { id: "POZ", area: "A2", tipo: "auto", nome: "Pozzo di drenaggio", x: 1275, y: 526, par: [
        Z("livello", "Livello del percolato", "m", livello, { att: 1.9, all: 2.2 }),
        Z("pompa", "Pompa", "", pompa, { stati: ["ferma", "in funzione"] }),
        Z("volumi", "Volume estratto", "m³/giorno", volumi)] },
      { id: "VAS", area: "A2", tipo: "auto", nome: "Vasca a doppia intercapedine", x: 1462, y: 316, par: [
        Z("riemp", "Riempimento", "%", riemp, { att: 80, all: 90 }),
        Z("interc", "Sensore d'intercapedine", "", interc, { stati: ["asciutta", "liquido rilevato"], all: 1 })] },
      { id: "GS1", area: "A3", tipo: "manuale", nome: "Gas nel suolo – nord-ovest", x: 625, y: 800, par: [
        Z("ch4", "Metano", "% vol", gas(.1), { att: 1, all: 2.5 }), Z("co2", "Anidride carbonica", "% vol", gas(.4), { att: 1.5, all: 3 })] },
      { id: "GS2", area: "A3", tipo: "manuale", nome: "Gas nel suolo – ovest", x: 650, y: 1150, par: [
        Z("ch4", "Metano", "% vol", gas(.2, 1.2), { att: 1, all: 2.5 }), Z("co2", "Anidride carbonica", "% vol", gas(.6), { att: 1.5, all: 3 })] },
      { id: "GS3", area: "A3", tipo: "manuale", nome: "Gas nel suolo – sud", x: 1000, y: 1630, par: [
        Z("ch4", "Metano", "% vol", gas(.05), { att: 1, all: 2.5 }), Z("co2", "Anidride carbonica", "% vol", gas(.3), { att: 1.5, all: 3 })] },
      { id: "GS4", area: "A3", tipo: "manuale", nome: "Gas nel suolo – est", x: 1690, y: 1330, par: [
        Z("ch4", "Metano", "% vol", gas(.1), { att: 1, all: 2.5 }), Z("co2", "Anidride carbonica", "% vol", gas(.5), { att: 1.5, all: 3 })] },
      { id: "FON", area: "A3", tipo: "manuale", nome: "Rumore al fabbricato più vicino", x: 1170, y: 1745, par: [
        Z("leq", "Livello equivalente diurno", "dB(A)", man(7, 2, () => r1(48 + rnd() * 6)), { att: 60, all: 65 })] },
      { id: "CP1", area: "A1", tipo: "manuale", nome: "Caposaldo ciglio nord-ovest", x: 850, y: 690, par: [Z("spost", "Spostamento", "mm", cp(.6), { att: 10, all: 20 })] },
      { id: "CP2", area: "A1", tipo: "manuale", nome: "Caposaldo ciglio nord", x: 980, y: 600, par: [Z("spost", "Spostamento", "mm", cp(1.5), { att: 10, all: 20 })] },
      { id: "CP3", area: "A1", tipo: "manuale", nome: "Caposaldo ciglio nord-est", x: 1180, y: 540, par: [Z("spost", "Spostamento", "mm", cp(.8), { att: 10, all: 20 })] },
      { id: "CP4", area: "A1", tipo: "manuale", nome: "Caposaldo sommità", x: 1120, y: 1170, par: [Z("spost", "Spostamento", "mm", cp(.3), { att: 10, all: 20 })] },
      { id: "CP5", area: "A1", tipo: "manuale", nome: "Caposaldo piede est", x: 1560, y: 1080, par: [Z("spost", "Spostamento", "mm", cp(.4), { att: 10, all: 20 })] },
      { id: "AQ1", area: "A4", tipo: "manuale", nome: "Pozzetto di confluenza ovest", x: 707, y: 709, par: [
        Z("torb", "Stato delle acque", "", man(1, 0, () => 0), { stati: ["limpide", "torbide", "tracce di percolato"], att: 1, all: 2 })] },
      { id: "AQ2", area: "A4", tipo: "manuale", nome: "Pozzetto di confluenza nord-est", x: 1297, y: 430, par: [
        Z("torb", "Stato delle acque", "", man(1, 0, () => (rnd() < .12 ? 1 : 0)), { stati: ["limpide", "torbide", "tracce di percolato"], att: 1, all: 2 })] },
      { id: "STR", area: "A5", tipo: "manuale", nome: "Strada di accesso", x: 1360, y: 290, par: [
        Z("fango", "Pulizia della carreggiata", "", man(1, 0, () => (rnd() < .15 ? 1 : 0)), { stati: ["pulita", "fango presente", "sporca: intervento"], att: 1, all: 2 }),
        Z("transiti", "Transiti di mezzi pesanti", "n./giorno", man(1, 0, () => Math.round(8 + rnd() * 10)))] },
      { id: "LAV", area: "A5", tipo: "manuale", nome: "Lavaggio gomme", x: 1335, y: 455, par: [
        Z("riuso", "Acqua riusata per la bagnatura", "m³/giorno", man(1, 0, () => r1(1.5 + rnd() * 2)))] },
    ],
    conci: [
      { id: "C1", fase: 4, data: new Date(now - 11 * D).toISOString().slice(0, 10), nota: "collaudo topografico consegnato alla DL" },
      { id: "C2", fase: 3, data: new Date(now - 6 * D).toISOString().slice(0, 10), nota: "posa del capping in corso" },
      { id: "C3", fase: 2, data: new Date(now - 4 * D).toISOString().slice(0, 10), nota: "risagomatura dall'alto, guida 3D" },
      { id: "C4", fase: 1, data: new Date(now - 2 * D).toISOString().slice(0, 10), nota: "gabbionata al piede per tratti alterni" },
      { id: "C5", fase: 0, data: "", nota: "" },
      { id: "C6", fase: 0, data: "", nota: "" },
    ],
    fasi: ["da aprire", "gabbionata al piede", "risagomatura", "capping in posa", "chiuso e collaudato"],
  };

  const fmt = (v) => String(v).replace(".", ",");
  const vmax = Math.max(...vento.map((a) => a[1])), pmax = Math.max(...pm2.map((a) => a[1]));
  const T = (d, h, m) => new Date(now - d * D + (h || 0) * H + (m || 0) * 60e3).toISOString();
  const riserv = {
    comunicazioni: [
      { id: "COM-001", t: T(11, 2), tipo: "Verbale", area: "A1", punto: "CP1", oggetto: "Collaudo topografico concio C1", testo: "Sezioni di controllo e rilievo GNSS del concio C1 conformi al progetto. Si chiede il nulla osta all'apertura del concio C2.", a: ["DL"], visti: [{ ruolo: "DL", t: T(11, 4) }] },
      { id: "COM-002", t: T(8, -1), tipo: "Rapporto", area: "A3", punto: "", oggetto: "Rapporto ambientale settimanale n. 1", testo: "Vento, PM10, gas, rumore e acque nella settimana: nessun superamento delle soglie di allarme.", a: ["DL"], visti: [{ ruolo: "DL", t: T(7, 3) }] },
      { id: "COM-003", t: T(7, 1), tipo: "Documento", area: "A5", punto: "", oggetto: "Cronoprogramma aggiornato – settimana 2", testo: "Aggiornamento settimanale del cronoprogramma per il coordinamento.", a: ["CSE"], visti: [{ ruolo: "CSE", t: T(7, 5) }] },
      { id: "COM-004", t: T(5, -2, 12), tipo: "Allarme", area: "A2", punto: "POZ", oggetto: "Livello alto nel pozzo di drenaggio (2,28 m)", testo: "Pompa in blocco termico. Avviso automatico via SMS e piattaforma 18 minuti dopo l'evento. Pompa ripristinata dal tecnico alle ore successive; livello rientrato.", a: ["DL", "RUP"], visti: [{ ruolo: "DL", t: T(5, -2, 41) }, { ruolo: "RUP", t: T(5, 1) }], chiusa: T(5, 6) },
      { id: "COM-005", t: T(4, -2), tipo: "Allarme", area: "A3", punto: "MET", oggetto: "Vento oltre la soglia di allarme (" + fmt(vmax) + " m/s)", testo: "Sospesi scavo e movimentazione sul concio C3; fronte coperto. Ripresa dopo il rientro sotto la soglia di attenzione.", a: ["DL"], visti: [{ ruolo: "DL", t: T(4, -1, 30) }], chiusa: T(4, 3) },
      { id: "COM-006", t: T(4, -2, 20), tipo: "Attenzione", area: "A3", punto: "PM2", oggetto: "PM10 in aumento al lato dei fabbricati (+" + fmt(pmax) + " µg/m³)", testo: "Bagnatura intensificata con il cannone nebulizzatore e riduzione della velocità dei mezzi.", a: ["DL"], visti: [{ ruolo: "DL", t: T(4, 0) }], chiusa: T(4, 2) },
      { id: "COM-007", t: T(3, 2), tipo: "Non conformità", area: "A1", punto: "", oggetto: "NC-02 – pezzatura del pietrame dei gabbioni", testo: "Fornitura n. 4 con pezzatura inferiore alla maglia. Lotto respinto, richiesta nuova fornitura.", a: ["DL", "RUP"], visti: [{ ruolo: "DL", t: T(3, 4) }] },
      { id: "COM-008", t: T(1, 1), tipo: "Documento", area: "A5", punto: "", oggetto: "Certificati End of Waste – aggregato riciclato, fornitura n. 3", testo: "Marcatura CE, dichiarazione di conformità End of Waste e DDT della fornitura per la strada di accesso.", a: ["DL"], visti: [] },
      { id: "COM-009", t: T(0, -5), tipo: "Attenzione", area: "A3", punto: "GS2", oggetto: "Metano nel suolo, lato ovest (GS2): 1,2 % vol", testo: "Valore sopra la soglia di attenzione. Misura ripetuta entro 24 ore e verifica del drenaggio sotto il capping.", a: ["DL"], visti: [] },
    ],
    nc: [
      { id: "NC-01", data: T(9, 1).slice(0, 10), area: "A1", descr: "Sormonto tra teli della geomembrana inferiore al minimo in un tratto del concio C1", rilevata: "DL", azione: "Ripresa con saldatura per estrusione e prova a vuoto, esito positivo", stato: "chiusa" },
      { id: "NC-02", data: T(3, 2).slice(0, 10), area: "A1", descr: "Pietrame per gabbioni con pezzatura inferiore alla maglia (fornitura n. 4)", rilevata: "Impresa", azione: "Lotto respinto e nuova fornitura richiesta al fornitore qualificato", stato: "in corso" },
    ],
    documenti: [
      { id: "DOC-01", tipo: "Qualità", titolo: "Piano Generale Controllo Qualità (UNI ISO 10005)", stato: "approvato da DL e RUP", data: T(13).slice(0, 10) },
      { id: "DOC-02", tipo: "Qualità", titolo: "Piano Controllo Qualità – capping", stato: "approvato da DL", data: T(12).slice(0, 10) },
      { id: "DOC-03", tipo: "Qualità", titolo: "Quaderno qualità – concio C1", stato: "consegnato", data: T(10).slice(0, 10) },
      { id: "DOC-04", tipo: "Posa", titolo: "Registro di posa geomembrana – concio C1", stato: "consegnato", data: T(10).slice(0, 10) },
      { id: "DOC-05", tipo: "Sicurezza", titolo: "Piano Operativo di Sicurezza", stato: "verificato dal CSE", data: T(14).slice(0, 10) },
      { id: "DOC-06", tipo: "Materiali", titolo: "Certificato CE geomembrana HDPE – lotto 1", stato: "accettato dalla DL", data: T(12).slice(0, 10) },
      { id: "DOC-07", tipo: "Materiali", titolo: "Dichiarazione End of Waste – aggregato riciclato, fornitura 3", stato: "in attesa di presa visione", data: T(1).slice(0, 10) },
    ],
    video: [
      { id: "EV-01", t: T(12, -3), cam: "TV1", tipo: "Movimento fuori orario", descr: "Animale selvatico rilevato davanti al cancello d'ingresso.", azione: "Verifica da remoto del responsabile di cantiere: falso allarme, nessun intervento.", a: ["DL"], visti: [{ ruolo: "DL", t: T(12, 1) }], chiuso: T(12, -2) },
      { id: "EV-02", t: T(6, -4), cam: "TV2", tipo: "Intrusione", descr: "Persona non autorizzata nell'area deposito materiali; sirena e faro attivati in automatico.", azione: "Intervento della vigilanza; nessun ammanco né danno. Avviso a DL e CSE, verifica della recinzione il mattino successivo.", a: ["DL", "CSE"], visti: [{ ruolo: "DL", t: T(6, -3, 40) }, { ruolo: "CSE", t: T(6, 1) }], chiuso: T(6, 3) },
      { id: "EV-03", t: T(3, 5), cam: "TV4", tipo: "Verifica periodica", descr: "Controllo settimanale di inquadrature, registrazione e cartelli informativi.", azione: "Esito regolare.", a: ["CSE"], visti: [{ ruolo: "CSE", t: T(3, 7) }], chiuso: T(3, 5) },
      { id: "EV-04", t: T(1, -3), cam: "TV3", tipo: "Perdita del segnale", descr: "Telecamera non raggiungibile per 35 minuti (interruzione della rete mobile).", azione: "Ripristino automatico; registrazione locale completa sulla scheda di memoria.", a: ["DL"], visti: [], chiuso: T(1, -2) },
      { id: "EV-05", t: T(0, -6), cam: "TV1", tipo: "Movimento fuori orario", descr: "Veicolo fermo davanti al cancello per alcuni minuti, poi ripartito.", azione: "Nessun accesso all'area; in attesa di presa visione della DL.", a: ["DL"], visti: [] },
    ],
  };
  return { pub, riserv };
}
if (typeof module !== "undefined") module.exports = { makeSeed };
