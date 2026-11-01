// Dati di TEST, non reali: servono solo a mostrare la procedura.
const { makeSeed } = require("./_seed_core");
module.exports = () => makeSeed(Date.now());
