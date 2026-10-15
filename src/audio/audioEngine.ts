/**
 * Alle Töne werden hier per Web Audio API erzeugt. Die Navi-Ansagen sind kleine, vorab erzeugte
 * Audiodateien (public/audio, siehe scripts/ansagen.ps1) und laufen über denselben AudioContext.
 * So klingt es in jedem Browser gleich, ohne die unzuverlässige Sprachausgabe des Browsers.
 * Töne sind hart auf MAX_PEGEL begrenzt, Ansagen auf MAX_SPRACHE.
 */
const MAX_PEGEL = 0.15;
const MAX_SPRACHE = 0.9;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sprache: GainNode | null = null;
let aktiv = false;
let lautstaerke = 0.6;

const sprachPegel = () => MAX_SPRACHE * (0.35 + 0.65 * lautstaerke);

/** Muss direkt aus einem Klick-Handler aufgerufen werden (Autoplay-Regeln, v. a. iOS). */
export async function audioEinschalten(): Promise<void> {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = MAX_PEGEL * lautstaerke;
    master.connect(ctx.destination);
    sprache = ctx.createGain();
    sprache.gain.value = sprachPegel();
    sprache.connect(ctx.destination);
  }
  aktiv = true;
  await ctx.resume();
  signale.bestaetigung();
}

export async function audioAusschalten(): Promise<void> {
  aktiv = false;
  stoppeAnsage();
  await ctx?.suspend();
}

export function setzeLautstaerke(wert: number) {
  lautstaerke = Math.min(1, Math.max(0, wert));
  if (ctx && master) master.gain.setTargetAtTime(MAX_PEGEL * lautstaerke, ctx.currentTime, 0.02);
  if (ctx && sprache) sprache.gain.setTargetAtTime(sprachPegel(), ctx.currentTime, 0.02);
}

/* ---------- Navi-Ansagen aus Audiodateien ---------- */

export type SprachStatus = 'still' | 'spricht' | 'fehler';
let sprachStatus: SprachStatus = 'still';
const statusHoerer = new Set<(s: SprachStatus) => void>();
const puffer = new Map<string, Promise<AudioBuffer>>();
let laufend: AudioBufferSourceNode | null = null;

function setzeStatus(neu: SprachStatus) {
  sprachStatus = neu;
  statusHoerer.forEach((h) => h(neu));
}

export function sprachStatusAbonnieren(hoerer: (s: SprachStatus) => void): () => void {
  statusHoerer.add(hoerer);
  hoerer(sprachStatus);
  return () => statusHoerer.delete(hoerer);
}

const rohdaten = new Map<string, Promise<ArrayBuffer>>();

/** Holt eine Ansage-Datei (einmal); wird schon beim Seitenstart angestoßen, damit der erste Knopfdruck sofort klingt. */
export function ansageVorladen(datei: string): Promise<ArrayBuffer> {
  let p = rohdaten.get(datei);
  if (!p) {
    const url = `${import.meta.env.BASE_URL}audio/${datei}`;
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return r.arrayBuffer();
    });
    p.catch(() => rohdaten.delete(datei));
    rohdaten.set(datei, p);
  }
  return p;
}

/** Dekodiert eine Ansage einmal; danach kommt sie aus dem Zwischenspeicher. */
function lade(datei: string): Promise<AudioBuffer> {
  let p = puffer.get(datei);
  if (!p) {
    p = ansageVorladen(datei)
      // Kopie, weil decodeAudioData die Daten übernimmt; Callback-Form für ältere Safari-Versionen.
      .then((daten) => new Promise<AudioBuffer>((ok, fehler) => ctx!.decodeAudioData(daten.slice(0), ok, fehler)));
    p.catch(() => puffer.delete(datei));
    puffer.set(datei, p);
  }
  return p;
}

function stoppeAnsage() {
  if (laufend) {
    laufend.onended = null;
    try {
      laufend.stop();
    } catch {
      /* war schon beendet */
    }
    laufend = null;
  }
  setzeStatus('still');
}

/** Spielt eine Ansage ab; eine laufende Ansage wird dabei abgebrochen. */
export async function ansageAbspielen(datei: string): Promise<void> {
  if (!aktiv || !ctx || !sprache) return;
  try {
    const buffer = await lade(datei);
    if (!aktiv || !ctx || !sprache) return;
    stoppeAnsage();
    const quelle = ctx.createBufferSource();
    quelle.buffer = buffer;
    quelle.connect(sprache);
    quelle.onended = () => {
      if (laufend === quelle) {
        laufend = null;
        setzeStatus('still');
      }
    };
    laufend = quelle;
    quelle.start();
    setzeStatus('spricht');
  } catch (e) {
    console.warn('Ansage konnte nicht abgespielt werden:', e);
    setzeStatus('fehler');
  }
}

/* ---------- Erzeugte Töne ---------- */

interface Ton {
  frequenz: number;
  dauerMs: number;
  startMs?: number;
  form?: OscillatorType;
  pegel?: number;
}

function spieleTon({ frequenz, dauerMs, startMs = 0, form = 'sine', pegel = 1 }: Ton) {
  if (!aktiv || !ctx || !master) return;
  const t0 = ctx.currentTime + startMs / 1000;
  const t1 = t0 + dauerMs / 1000;
  const osc = ctx.createOscillator();
  const huelle = ctx.createGain();
  osc.type = form;
  osc.frequency.value = frequenz;
  huelle.gain.setValueAtTime(0, t0);
  huelle.gain.linearRampToValueAtTime(pegel, t0 + 0.01);
  huelle.gain.setValueAtTime(pegel, Math.max(t0 + 0.01, t1 - 0.02));
  huelle.gain.linearRampToValueAtTime(0, t1);
  osc.connect(huelle).connect(master);
  osc.start(t0);
  osc.stop(t1 + 0.02);
}

export const signale = {
  /** Kurzer, leiser Zweiklang als Bestätigung beim Einschalten. */
  bestaetigung: () => {
    spieleTon({ frequenz: 660, dauerMs: 120, pegel: 0.5 });
    spieleTon({ frequenz: 880, dauerMs: 160, startMs: 130, pegel: 0.5 });
  },
  /** Blinker: leises Klicken, abwechselnd „tick“ und „tack“. */
  blinkerTick: (hell: boolean) => spieleTon({ frequenz: hell ? 1900 : 1400, dauerMs: 14, form: 'square', pegel: 0.35 }),
  /** Inversion Tempowarner: aufdringlicher Piepton bei jeder Überschreitung. */
  einheitsPiep: () => spieleTon({ frequenz: 1000, dauerMs: 110, form: 'square', pegel: 0.55 }),
};
