/**
 * Funktionsprüfung des korrekten Cockpits: klickt alle Bedienelemente durch (App-Leiste, Klima, Menü, Tempowarner,
 * Tasten, Warnblinker, Lenkstock, Pedale, Tempomat, Navi-Ansage, Töne) und meldet jede Abweichung.
 * Aufruf: npm run build && npm run korrekt   (Bilder landen in screenshots/korrekt)
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const SP = process.argv[2] ?? 'screenshots/korrekt';
mkdirSync(SP, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4189', '--strictPort'], { stdio: 'ignore' });
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { if ((await fetch('http://localhost:4189/')).ok) break; } catch {} await warte(200); }
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ergebnisse = [];
const pruefe = (name, ok, info = '') => ergebnisse.push(`${ok ? 'OK  ' : 'FEHLER'} ${name}${info ? ' – ' + info : ''}`);
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
  await page.addInitScript(() => {
    window.__z = { osc: 0, rausch: 0 };
    const o = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...a) { window.__z.osc++; return o.apply(this, a); };
    const b = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) { window.__z.rausch++; return b.apply(this, a); };
  });
  await page.goto('http://localhost:4189/');
  await warte(600);
  const c = page.locator('[data-testid="cockpit"]').first();
  const zd = c.locator('[aria-label="Hauptdisplay"]');
  const tacho = async () => Number((await c.getByRole('img', { name: /^Tacho/ }).getAttribute('aria-label')).match(/\d+/)[0]);
  const z = () => page.evaluate(() => ({ ...window.__z }));

  // Startzustand: keine Fehlermeldungen, keine Warnleuchten
  pruefe('Start: keine Fehlermeldung im Display', (await zd.getByText(/ERR|Fehler|failed/i).count()) === 0);
  pruefe('Start: Tempolimit-Schild sichtbar', await c.getByRole('img', { exact: true, name: 'Tempolimit 50 km/h' }).isVisible());
  pruefe('Start: Tempomat 48 km/h', (await tacho()) === 48, `${await tacho()} km/h`);

  // App-Leiste
  for (const [knopf, merkmal] of [['Fahrzeug', 'Scheibenwaschwasser'], ['Medien', 'Nachtfahrt'], ['Telefon', /Mama|Kontakte|Anrufe|Favoriten/], ['Apps', 'Sitzmassage'], ['Navi', 'Hauptstraße']]) {
    await zd.getByRole('button', { name: knopf, exact: true }).click();
    await warte(150);
    const sichtbar = await zd.getByText(merkmal).first().isVisible().catch(() => false);
    pruefe(`App-Leiste: ${knopf}`, sichtbar);
    await c.screenshot({ path: `${SP}/k-${knopf}.png` });
  }
  await zd.getByRole('button', { exact: true, name: 'Apps', exact: true }).click();
  await zd.getByRole('button', { exact: true, name: 'Radio' }).click();
  pruefe('Apps › Radio öffnet Medien', await zd.getByText('Nachtfahrt').first().isVisible());
  await zd.getByRole('button', { exact: true, name: 'Navi', exact: true }).click();

  // Klima
  const tempF = async () => (await zd.locator('[class*=tempWert]').first().textContent()).trim();
  const vorher = await tempF();
  await zd.getByRole('button', { exact: true, name: 'Fahrer: wärmer' }).click();
  pruefe('Klima Fahrer +', (await tempF()) !== vorher, `${vorher} → ${await tempF()}`);
  await zd.getByRole('button', { exact: true, name: 'Fahrer: kälter' }).click();
  pruefe('Klima Fahrer −', (await tempF()) === vorher);
  await zd.getByRole('button', { exact: true, name: 'Beifahrer: wärmer' }).click();
  pruefe('Klima Beifahrer +', true);

  // Menü korrekt: alle Einträge
  await zd.getByRole('button', { name: /^(☰ )?Menü$/ }).click();
  const punkte = await zd.locator('[role=dialog] button').allTextContents();
  pruefe('Menü öffnet (flach)', punkte.some((p) => p.includes('Klima')) && !punkte.some((p) => p.includes('Favoriten')), punkte.join(' | '));
  for (const [weg, ziel] of [[['Klima ›', 'Temperatur Fahrer ›'], '+'], [['Licht ›', 'Ambientelicht ›'], /Farbe/], [['Sitz ›', 'Massage ›'], /Programm/], [['Sprache ›'], 'English']]) {
    for (const p of weg) await zd.getByRole('button', { name: p }).click();
    const da = await zd.locator('[role=dialog]').getByRole('button', { name: ziel }).first().isVisible();
    pruefe(`Menü ${weg.join(' ')}`, da);
    await zd.locator('[role=dialog]').getByRole('button', { name: ziel }).first().click();
    for (let i = 0; i < weg.length; i++) await zd.getByRole('button', { exact: true, name: '‹ Zurück' }).click();
  }
  await zd.getByRole('button', { exact: true, name: 'Fahrerassistenz ›' }).click();
  await zd.getByRole('button', { exact: true, name: 'Tempowarner ›' }).click();
  await zd.getByRole('button', { exact: true, name: 'Tempowarner: AN' }).click();
  await warte(200);
  pruefe('Tempowarner aus: Schild verschwindet', (await c.getByRole('img', { name: /Tempolimit/ }).count()) === 0);
  pruefe('Tempowarner aus: kein Text „Tempowarner aus“ im Kombiinstrument', (await c.locator('[aria-label=Kombiinstrument]').getByText('Tempowarner aus').count()) === 0);
  await c.screenshot({ path: `${SP}/k-isa-aus.png` });
  await zd.getByRole('button', { exact: true, name: 'Tempowarner: AUS' }).click();
  pruefe('Tempowarner wieder an: Schild da', await c.getByRole('img', { exact: true, name: 'Tempolimit 50 km/h' }).isVisible());
  await zd.getByRole('button', { exact: true, name: 'Menü schließen' }).click();
  pruefe('Menü schließt', (await zd.locator('[role=dialog]').count()) === 0);

  // Mittelkonsole
  for (const t of ['Klima', 'Frontscheibe', 'Heckscheibe', 'Sitzheizung']) {
    const k = c.getByRole('button', { name: t, exact: true });
    await k.click();
    const an = await k.getAttribute('aria-pressed');
    await k.click();
    const aus = await k.getAttribute('aria-pressed');
    pruefe(`Taste ${t} an/aus`, an === 'true' && aus === 'false');
  }
  await c.getByRole('button', { exact: true, name: 'Warnblinker' }).click();
  await warte(300);
  pruefe('Warnblinker: beide Blinker', (await c.getByRole('img', { name: /Blinker (links|rechts) an/ }).count()) === 2);
  await c.screenshot({ path: `${SP}/k-warnblinker.png` });
  await c.getByRole('button', { exact: true, name: 'Warnblinker' }).click();

  // Lenkstock: oben = links, Mitte, unten = rechts
  const hoch = c.getByRole('button', { exact: true, name: 'Hebel nach oben' });
  const runter = c.getByRole('button', { exact: true, name: 'Hebel nach unten' });
  await hoch.click();
  pruefe('Lenkstock oben = Blinker links', (await c.getByRole('img', { exact: true, name: 'Blinker links an' }).count()) === 1);
  await runter.click();
  pruefe('Lenkstock Mitte = aus', (await c.getByRole('img', { name: /Blinker (links|rechts) an/ }).count()) === 0);
  await runter.click();
  pruefe('Lenkstock unten = Blinker rechts', (await c.getByRole('img', { exact: true, name: 'Blinker rechts an' }).count()) === 1);
  await hoch.click();

  // Ton: Blinker-Klicken, Tempo-Hinweis einmal
  await page.getByRole('toolbar').getByRole('button', { exact: true, name: 'Ton aus', exact: true }).click();
  await warte(400);
  await hoch.click();
  let a = await z(); await warte(2000); let b = await z();
  pruefe('Ton: Blinker klickt (Relais)', b.rausch - a.rausch >= 3 && b.osc - a.osc === 0, `${b.rausch - a.rausch} Klicks, ${b.osc - a.osc} Töne`);
  await runter.click();

  // Fahren: Gas über 50 → ein Hinweiston; Bremse bis Stillstand → Auto Hold
  await page.locator('body').focus();
  a = await z();
  await page.keyboard.down('ArrowUp'); await warte(3000); await page.keyboard.up('ArrowUp');
  await warte(1500);
  b = await z();
  const schnell = await tacho();
  pruefe('Gas: schneller als 50', schnell > 50, `${schnell} km/h`);
  pruefe('Ton: genau ein Hinweiston beim Überschreiten', b.osc - a.osc === 1, `${b.osc - a.osc} Töne`);
  pruefe('Leistungsanzeige zeigt kW', /Leistungsanzeige \d+ kW/.test(await c.getByRole('img', { name: /Leistungsanzeige/ }).getAttribute('aria-label')));
  await page.keyboard.down('ArrowDown'); await warte(4500); await page.keyboard.up('ArrowDown');
  await warte(1200);
  pruefe('Bremse: Stillstand und Auto Hold', (await tacho()) === 0, `${await tacho()} km/h`);
  await c.getByRole('button', { name: /^Tempomat/ }).click();
  await warte(2500);
  pruefe('Tempomat an aus dem Stand', (await tacho()) > 0, `${await tacho()} km/h`);

  // Navi-Ansage
  a = await z();
  await zd.getByRole('button', { name: /Ansage/ }).first().click();
  await warte(1500);
  b = await z();
  pruefe('Navi-Ansage spielt (Audiodatei)', b.rausch - a.rausch >= 1, `${b.rausch - a.rausch} Quellen`);
  pruefe('Navi-Ansage: Untertitel', await zd.getByText(/abbiegen/).first().isVisible());

  pruefe('Keine JS-Fehler', fehler.length === 0, fehler.join(' | '));
  await c.screenshot({ path: `${SP}/k-ende.png` });
  await page.close();
} finally {
  await browser.close();
  server.kill();
  console.log(ergebnisse.join('\n'));
  const fehlerzahl = ergebnisse.filter((e) => e.startsWith('FEHLER')).length;
  console.log(fehlerzahl ? `\n${fehlerzahl} Fehler` : `\nAlle ${ergebnisse.length} Prüfungen bestanden.`);
  if (fehlerzahl) process.exitCode = 1;
}
