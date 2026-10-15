/**
 * Screenshots und Prüfungen in Handy- und Beamer-Größe.
 * Aufruf: npm run build && npm run screenshots
 * Ergebnis: Ordner screenshots/ (Bilder + report.json)
 */
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const PORT = 4173;
const BASIS = `http://localhost:${PORT}/`;
const AUSGABE = path.resolve('screenshots');

const GERAETE = [
  { name: 'handy', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: 'beamer', viewport: { width: 1920, height: 1080 } },
];

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

async function starteServer() {
  const server = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'],
    { stdio: 'ignore' },
  );
  for (let i = 0; i < 75; i++) {
    try {
      const r = await fetch(BASIS);
      if (r.ok) return server;
    } catch {
      /* Server startet noch */
    }
    await warte(200);
  }
  server.kill();
  throw new Error('Vorschau-Server nicht erreichbar. Vorher "npm run build" ausführen.');
}

const knopf = (page, name) => page.getByRole('button', { name, exact: true });
const leiste = (page, name) => page.getByRole('toolbar').getByRole('button', { name, exact: true });

async function horizontalerUeberlauf(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function axe(page, selektor) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
  if (selektor) builder = builder.include(selektor);
  const r = await builder.analyze();
  return {
    verstoesse: r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      anzahl: v.nodes.length,
      beispiele: v.nodes.slice(0, 3).map((n) => n.failureSummary?.split('\n').slice(0, 2).join(' ')),
      ziele: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
    })),
    unklar: r.incomplete.map((v) => ({ id: v.id, anzahl: v.nodes.length })),
  };
}

async function laufFuerGeraet(browser, geraet, bericht) {
  const context = await browser.newContext({ ...geraet, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const fremd = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(BASIS) && !url.startsWith('data:') && !url.startsWith('blob:')) fremd.push(url);
  });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));

  const foto = async (name, optionen = {}) => {
    await page.screenshot({ path: path.join(AUSGABE, `${geraet.name}-${name}.png`), ...optionen });
  };

  await page.goto(BASIS);
  await page.evaluate(() => document.fonts.ready);
  await warte(400);
  await foto('02-start');
  await foto('02-start-ganz', { fullPage: true });
  const ergebnis = { ueberlauf: {} };
  ergebnis.ueberlauf.start = await horizontalerUeberlauf(page);
  ergebnis.axeStart = await axe(page);

  // Ton einschalten, damit Fehler der Audio-Engine auffallen; danach wieder aus.
  await leiste(page, 'Ton aus').click();
  await leiste(page, 'Alles invertieren').click();
  await warte(1500);
  ergebnis.tonLief = await leiste(page, 'Ton an').isVisible();
  await foto('03-invertiert');
  await leiste(page, 'Ton an').click();
  ergebnis.ueberlauf.invertiert = await horizontalerUeberlauf(page);

  await leiste(page, 'Alles korrigieren').click();
  await warte(900);
  await foto('04-korrekt');
  ergebnis.ueberlauf.korrekt = await horizontalerUeberlauf(page);
  ergebnis.axeKorrekt = await axe(page, '[data-testid="cockpit"]');

  // Vergleich: links der aktuelle Stand (2 Karten invertiert), rechts korrekt; danach eine Karte mehr
  // Direkt per DOM klicken: Gruppen sind eingeklappt, und auf dem Handy liegt das Cockpit über der Kartenliste.
  const invertiereKarte = () =>
    page
      .locator('article[data-zustand="korrekt"]')
      .first()
      .locator('button.btn-inversion')
      .evaluate((knopf) => knopf.click());
  await invertiereKarte();
  await invertiereKarte();
  await leiste(page, 'Vergleich').click();
  await warte(900);
  await foto('05-vergleich');
  await invertiereKarte();
  await warte(600);
  ergebnis.vergleichBearbeitbar = await page.getByText('3 von 12 invertiert').isVisible();
  ergebnis.ueberlauf.vergleich = await horizontalerUeberlauf(page);
  await leiste(page, 'Vergleich').click();
  await leiste(page, 'Alles invertieren').click();
  await warte(300);

  // Menü im invertierten Cockpit (Blickabwendung und Tempowarner stecken im Menü)
  await page.locator('[data-testid="cockpit"]').getByRole('button', { name: /Menu|Menü/ }).first().click();
  await page.locator('[data-testid="cockpit"]').scrollIntoViewIfNeeded();
  await warte(300);
  await foto('06-menue');

  // Korrektes Cockpit mit Warnblinker: beide Blinker auf einer Höhe
  await leiste(page, 'Alles korrigieren').click();
  await warte(900);
  await page.getByRole('button', { name: 'Warnblinker' }).first().click();
  await warte(300);
  await foto('07-warnblinker');
  await page.getByRole('button', { name: 'Warnblinker' }).first().click();

  // Gruppen sind anfangs eingeklappt: erste Gruppe öffnen, dann die Info der ersten Karte
  await page.locator('details > summary').first().evaluate((s) => s.click());
  await page.locator('summary', { hasText: 'Info zur Vorgabe' }).first().click();
  await page.locator('summary', { hasText: 'Info zur Vorgabe' }).first().scrollIntoViewIfNeeded();
  await warte(300);
  await foto('08-info');

  await leiste(page, 'QR-Code').click();
  await warte(500);
  await foto('09-qr');

  ergebnis.fremdeAnfragen = fremd;
  ergebnis.fehler = fehler;
  bericht[geraet.name] = ergebnis;
  await context.close();
}

async function reduzierteBewegung(browser, bericht) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(BASIS);
  await leiste(page, 'Alles invertieren').click();
  await warte(500);
  bericht.reduzierteBewegung = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => a.animationName ?? a.constructor.name),
  );
  await context.close();
}

await mkdir(AUSGABE, { recursive: true });
const server = await starteServer();
const browser = await chromium.launch();
const bericht = {};
try {
  for (const geraet of GERAETE) await laufFuerGeraet(browser, geraet, bericht);
  await reduzierteBewegung(browser, bericht);
} finally {
  await browser.close();
  server.kill();
}
await writeFile(path.join(AUSGABE, 'report.json'), JSON.stringify(bericht, null, 2));

for (const [name, r] of Object.entries(bericht)) {
  if (name === 'reduzierteBewegung') continue;
  console.log(`\n== ${name} ==`);
  console.log('Horizontaler Überlauf (px):', JSON.stringify(r.ueberlauf));
  console.log('axe Startseite, Verstöße:', JSON.stringify(r.axeStart.verstoesse, null, 1));
  console.log('axe korrektes Cockpit, Verstöße:', JSON.stringify(r.axeKorrekt.verstoesse, null, 1));
  console.log('axe korrektes Cockpit, unklar:', JSON.stringify(r.axeKorrekt.unklar));
  console.log('Ton ließ sich einschalten:', r.tonLief);
  console.log('Vergleich bleibt bearbeitbar:', r.vergleichBearbeitbar);
  console.log('Fremde Netzwerkanfragen:', r.fremdeAnfragen.length ? r.fremdeAnfragen : 'keine');
  console.log('JS-Fehler:', r.fehler.length ? r.fehler : 'keine');
}
console.log('\nLaufende Animationen bei reduzierter Bewegung:', bericht.reduzierteBewegung);
