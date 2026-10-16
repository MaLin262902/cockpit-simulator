# Invertiertes Cockpit

Interaktiver Cockpit-Simulator zum mentalen Modell **Inversion** (Modul „Digitale Intelligenz“, M.Sc. Human Factors, HFU Tuttlingen).

Karten stehen für etablierte Gestaltungsvorgaben. Am Anfang sind alle korrekt umgesetzt. Ein Klick **invertiert** die Vorgabe, und das Cockpit wird sichtbar und hörbar schlechter. Ein weiterer Klick (**„Korrigieren“**) stellt die korrekte Umsetzung wieder her. Jede Karte ist also entweder korrekt oder invertiert.

Farben in der ganzen App: **Grün** heißt „korrekt umgesetzt“, **Rot** heißt „invertiert“. Die Inversion ist ein reines Denkwerkzeug, keine Anleitung.

## Das Cockpit

- **Kombiinstrument** hinter dem Lenkrad: Tacho und Leistungsanzeige (kW, Elektroauto) als Rundinstrumente, Akkustand in der Statusleiste, Fahrerassistenz-Ansicht mit Fahrspuren, Kontrollleuchten, Statusleiste.
- **Hauptdisplay** in der Mitte: Navigationskarte mit Abbiegehinweis, Fahrspurempfehlung, Ankunftszeit und Zoom; Medienplayer; Reifendruck und Verbrauch; Klimaleiste mit Temperaturen und App-Leiste.
- **Armaturenbrett** mit gepolsterter Oberkanteund Hutze über dem Kombiinstrument.
- **Mittelkonsole**: Lüftungsdüsen und echte Tasten (Klima, Scheibenheizung, Sitzheizung, Lautstärke). Der Warnblinker lässt sich einschalten und blinkt im Kombiinstrument mit.

Die Kopfleiste mit Ton, Vergleich und „Alles invertieren“ bleibt beim Scrollen stehen. Die Karten liegen in der **Menü-Blase „Gestaltungsvorgaben“** oben links (auf dem Handy unten links). Sie zeigt, wie viele Karten invertiert sind, und klappt beim Darüberfahren mit der Maus auf; beim Verlassen klappt sie wieder zu, damit die Sicht aufs Cockpit frei ist. Mit Finger oder Tastatur öffnet ein Tippen bzw. Enter, Tippen daneben oder Esc schließt. Das Cockpit nutzt dadurch die volle Breite und passt auf Full-HD-Bildschirmen ganz in die Höhe. In der Blase sind die Karten nach Bereichen der Oberfläche gruppiert und beim Start eingeklappt (Farben, Icons und Kontrast; Anordnung; Bedienung; Inhalte, Sprache und Ton; Assistenzsysteme). Die App-Leiste im Hauptdisplay schaltet echte Ansichten um (Navi, Medien, Telefon, Fahrzeug, Apps).

**Fahren:** Das Cockpit ist fahrbar (Automatik). Unter dem Lenkrad liegen rechts **Bremse** und **Gas** (gedrückt halten) und mittig die **Tempomat**-Taste. Der **Lenkstockschalter** für die Blinker kommt mittig hinter dem Lenkrad aus der Lenksäule und ragt rechts heraus. Er hat drei Stellungen und bewegt sich wie der Lenkradkranz auf seiner Seite: oben = Blinker links, Mitte = aus, unten = Blinker rechts. Über dem Hebel antippen drückt ihn eine Raste nach oben, darunter eine Raste nach unten. Beim Start hält der Tempomat 48 km/h; Bremsen schaltet ihn ab, nach dem Anhalten hält das Auto (Auto Hold), bis Gas gegeben wird. Tastatur: ↑/W Gas, ↓/S Bremse, ←/A und →/D Blinker, T Tempomat. Die Fahrphysik ist frei gewählt und steht in `src/sim/fahrphysik.ts`.

**Navi:** Die Entfernung zur Kreuzung zählt mit dem gefahrenen Tempo herunter, die Karte rollt mit. Nach dem Abbiegen beginnt die Anfahrt in einer Schleife von vorn, und der Blinker stellt sich zurück. Der Lautsprecher-Knopf spielt die Ansage passend zur Entfernung (300 m, 200 m, 100 m, „Jetzt“).

**Verschiebbare Kacheln (nur invertiert):** Ist „Blickführung und Informationshierarchie“ invertiert, lassen sich Karte, Medien, Reifendruck, Werbung und Meldung im Hauptdisplay mit der Maus ziehen (auf dem Handy an der Griffleiste oben). Die zuletzt angeklickte Kachel liegt vorn, ein Doppelklick setzt sie zurück. Im korrekten Cockpit hat jedes Element seinen festen Platz. Umgesetzt in `src/components/Cockpit/Kachel.tsx`.

**Vergleich:** Links steht der aktuelle Stand, rechts das vollständig korrekte Cockpit. Die Karten bleiben dabei bedienbar, der linke Stand ändert sich mit.

Viele Karten wirken auch im Hauptdisplay, zum Beispiel Werbung und Benachrichtigungen (Ablenkung), ein Auto statt der Geschwindigkeit im Tacho und keine echten Tasten mehr (Blickabwendung), psi, °F und Fehlermeldungen wie „Operation failed successfully“ (reale Welt), ein Reifendruck-Warnwert in Grün (Farblogik) oder „Autopilot auf gesamter Strecke“ statt der Strecke, auf der der Assistent tatsächlich verfügbar ist (Systemgrenzen).

**Das korrekte Cockpit ist fehlerfrei.** Es zeigt keine Warnleuchte, keinen niedrigen Reifendruck, keine Fehlermeldung und keine Tempoüberschreitung, sonst widerlegt es sich selbst. Solche Störungen entstehen nur durch die jeweilige Inversion: Die invertierte Akustik piept ohne Pause, sobald das Auto schneller als erlaubt fährt, die invertierte Farblogik zeigt einen Druckverlust in Grün.

**Jede Inversion hat ihren eigenen Ort** und verdeckt keine andere. So bleibt bei „Alles invertieren“ jede einzelne erkennbar, und das Cockpit wirkt wie ein schlecht gestaltetes, aber echtes Produkt statt wie Chaos.

## Starten (lokal)

Voraussetzung: [Node.js](https://nodejs.org/) ab Version 20.

```bash
npm install        # einmalig
npm run dev        # Entwicklungsserver, Adresse steht im Terminal (meist http://localhost:5173)
```

Weitere Befehle:

| Befehl | Zweck |
|---|---|
| `npm run build` | Fertige Seite nach `dist/` bauen (inkl. TypeScript-Prüfung) |
| `npm run preview` | Gebaute Seite lokal ansehen |
| `npm test` | Tests, u. a. Prüfung der Kartendaten |
| `npm run screenshots` | Screenshots in Handy- und Beamer-Größe nach `screenshots/`, plus Kontrast-Check (axe), Prüfung auf horizontales Scrollen, fremde Netzwerkanfragen und reduzierte Bewegung. Vorher `npm run build`; beim ersten Mal `npx playwright install chromium`. |
| `npm run korrekt` | Funktionsprüfung des korrekten Cockpits: klickt App-Leiste, Klima, Menü, Tempowarner, Tasten, Warnblinker, Lenkstock, Pedale, Tempomat, Navi-Ansage und Töne durch und meldet jede Abweichung. Vorher `npm run build`. |

Im Hörsaal mit eigenem Laptop im selben WLAN geht auch `npm run dev -- --host`; die angezeigte Netzwerkadresse funktioniert dann auf Handys im selben Netz.

## Deployment auf GitHub Pages

Der Workflow `.github/workflows/deploy.yml` ist schon angelegt. Er baut und veröffentlicht die Seite bei jedem Push auf `main` automatisch. Ihr müsst einmalig Folgendes tun:

1. **Repo anlegen:** Auf github.com → „New repository“, z. B. `cockpit-simulator`. **Öffentlich** wählen; GitHub Pages für private Repos gibt es nur mit GitHub Pro (im kostenlosen Student Developer Pack enthalten). Kein README o. Ä. anhaken.
2. **Hochladen:** Wichtig ist, dass der Ordner `cockpit-simulator` selbst die Wurzel des Repos ist (sonst findet GitHub den Workflow nicht). Im Terminal in diesem Ordner:
   ```bash
   git init
   git add .
   git commit -m "Erste Version"
   git branch -M main
   git remote add origin https://github.com/<euer-name>/cockpit-simulator.git
   git push -u origin main
   ```
3. **Pages einschalten:** Im Repo unter **Settings → Pages** bei „Build and deployment → Source“ die Option **GitHub Actions** wählen.
4. **Warten:** Unter dem Reiter **Actions** läuft „Deploy auf GitHub Pages“ (ca. 1–2 Minuten). Danach steht die Adresse unter Settings → Pages, meist `https://<euer-name>.github.io/cockpit-simulator/`.
5. Ab jetzt aktualisiert jeder `git push` die öffentliche Seite. Schlagen die Tests fehl, wird nicht veröffentlicht; die Fehlermeldung steht unter **Actions**.

Der Button **QR-Code** in der App zeigt immer die Adresse, unter der die Seite gerade läuft. Öffnet ihn also auf der veröffentlichten Seite, nicht lokal.

## Karten bearbeiten und ergänzen

Alle Inhalte stehen in **`src/data/cards.ts`**. Eine Karte sieht so aus:

```ts
{
  id: 'neue-karte',                // eindeutig, nur a–z, 0–9 und Bindestrich
  kategorie: 'Assistenzsysteme', // Gruppe in der Kartenliste
  vorgabe: 'Name der Gestaltungsvorgabe',
  quelle: 'Fundstelle …',
  quelleUrl: '',                   // nur einen geprüften Link eintragen
  quelleStatus: 'prüfen',          // 'geprüft' oder 'prüfen'
  quelleHinweis: 'Angaben am Verordnungstext prüfen.', // optional
  regel: 'Die Regel in einem Satz.',
  sabotage: 'Was die Inversion im Cockpit bewirkt.',
  korrekt: 'Wie die korrekte Umsetzung aussieht.',
  effekt: 'hinweis',               // welcher Cockpit-Effekt ausgelöst wird
},
```

- Bei `quelleStatus: 'prüfen'` zeigt die Info-Ansicht dezent „Quelle wird noch geprüft“. Sobald die Fundstelle bestätigt ist, auf `'geprüft'` setzen.
- Stand: Alle Quellen sind geprüft (Oktober 2026). Die EU-Texte sind über ihre CELEX-Nummer auf EUR-Lex verlinkt. Bei ISO 15006 und DIN EN 894-3 ist der Normtext kostenpflichtig; geprüft sind dort Titel und Anwendungsbereich, das steht auch im Hinweis der jeweiligen Karte.
- **Neue Karte:** Einfach unten im Array anhängen. Als `effekt` könnt ihr einen vorhandenen Effekt wiederverwenden:

  | `effekt` | Was im Cockpit passiert |
  |---|---|
  | `systemstatus` | Statusanzeige des Spurhalteassistenten |
  | `farblogik` | Kontrollleuchten: Symbole und Farben |
  | `kontrast` | Dunkelgrau auf Schwarz bei Tacho, Leistungsanzeige, Statusleiste, Abbiegehinweis und Ankunftszeit |
  | `akustik` | Navi-Ansage ohne Inhalt („Weiter vorne abbiegen.“) bzw. mit Entfernung, Richtung und Straße |
  | `ablenkung` | Laufschrift, Werbung, Mini-Anzeigen |
  | `blickabwendung` | Geschwindigkeit im Untermenü bzw. immer sichtbar |
  | `realeWelt` | Unverständliche Fehlermeldungen, mph, Akku in Volt, Englisch bzw. Klartext und Akku in % |
  | `systemgrenzen` | „Autopilot 100 % sicher“ bzw. Systemgrenzen |
  | `gruppierung` | App-Leiste gemischt bzw. thematisch gruppiert |
  | `lesefluss` | Layout gespiegelt, Blinker übereinander und vertauscht bzw. F-Muster |
  | `stellteile` | Klima als verdrehter Schieberegler, Warnblinker als Drehregler, Lautstärke als Touch-Leiste, Sensorflächen bzw. große Plus-/Minus-Tasten, Warnblinktaste, Lautstärkeknopf |
  | `hinweis` | Kein eigener Effekt: Bei Inversion erscheint der Text aus `sabotage` als Meldung im Hauptdisplay |

- `kategorie` ist der **Bereich der Oberfläche**, nach dem die Kartenliste gruppiert wird (Farben, Icons und Kontrast; Anordnung; Bedienung; Inhalte, Sprache und Ton; Assistenzsysteme). Die Quelle (WCAG, Nielsen, EU-Verordnung …) steht in der Info zur Karte. Ein neuer Wert erscheint automatisch als eigene Gruppe am Ende. Die Reihenfolge in `cards.ts` bestimmt die Kartennummern.

  Unbekannte Schlüssel werden automatisch wie `hinweis` behandelt, `npm test` meldet sie aber als möglichen Tippfehler.
- **Jede Inversion braucht einen eigenen Ort im Cockpit** und darf andere nicht verdecken. Im korrekten Zustand darf ein neuer Effekt keine Fehler oder Warnungen zeigen.
- Ein **wirklich neuer visueller Effekt** braucht Code: Schlüssel in `src/effects/registry.ts` ergänzen, ihn im Modell in `src/effects/deriveCockpit.ts` aufnehmen und die Darstellung in `src/components/Cockpit/` (Komponenten + `Cockpit.module.css`) einbauen.
- Nach Änderungen `npm test` ausführen: Der Test prüft Pflichtfelder, doppelte IDs und Effekt-Schlüssel.

## Gestaltung, Sicherheit, Datenschutz

- **Kein Flackern:** Nichts blinkt schneller als 1 Hz (WCAG 2.3.1 erlaubt bis 3 Blitze/s). Hektik entsteht über Menge, Farbe, Laufschrift und Ton. Blinker und Warnblinker blinken per Taktgeber (`src/hooks/useBlinktakt.ts`) und deshalb auch bei „Bewegung reduzieren“, weil sie eine Funktion haben und keine Dekoration sind.
- **Reduzierte Bewegung:** Ist im Betriebssystem „Bewegung reduzieren“ aktiv, entfallen Kartendrehung, Fahranimation, Laufschrift und Farbwechsel.
- **Ton:** Alle Töne werden per Web Audio API im Browser erzeugt. Standardmäßig aus; die Lautstärke ist hart begrenzt. Auf dem iPhone muss der Stummschalter aus sein.
- **Navi-Ansage:** Kurze Audiodateien in `public/audio/` (korrekt je nach Entfernung „In dreihundert/zweihundert/hundert Metern …“ bzw. „Jetzt rechts abbiegen, auf die Hauptstraße.“, invertiert immer „Weiter vorne abbiegen.“). Sie wurden einmalig mit der lokalen Windows-Stimme „Katja“ erzeugt und laufen über dieselbe Web-Audio-Ausgabe wie die Töne. Deshalb klingt es auf jedem Gerät gleich, und es wird kein Sprachdienst gebraucht. Die Ansage spielt nicht automatisch, sondern über den **Lautsprecher-Knopf in der Navi-Karte** (unter Zoom und Kompass); ist der Ton aus, schaltet der Knopf ihn ein. Der Untertitel erscheint während der Ansage.
  - **Text ändern:** In `scripts/ansagen.ps1` den Text anpassen und unter Windows ausführen: `powershell -ExecutionPolicy Bypass -File scripts/ansagen.ps1 -Ziel public/audio`. Den Text auch in `src/effects/ansage.ts` (Untertitel) nachziehen.
- **Datenschutz:** Keine Anmeldung, keine Cookies, kein localStorage, kein Tracking, keine externen Schriften oder Dienste.
- **Keine Marken:** Alle Symbole und das Cockpit sind selbst gezeichnet und fiktiv.
- Die korrekte Version wird bei `npm run screenshots` automatisch mit axe auf WCAG-AA-Verstöße geprüft.

## Technik

Vite, React, TypeScript, CSS-Module mit globalen Design-Tokens (`src/styles/tokens.css`). CSS-Module statt Tailwind, weil sich die Effekte der Inversionen über `data-*`-Attribute am Cockpit am lesbarsten kombinieren lassen (jeder Effekt an einer Stelle in `Cockpit.module.css`) und weil Animationen und `prefers-reduced-motion` in reinem CSS am einfachsten sind.

```
src/
  data/cards.ts            Karteninhalte (hier bearbeiten)
  effects/                 Effekt-Liste und Berechnung des Cockpit-Zustands
  state/                   Kartenzustände (korrekt / invertiert)
  sim/                     simulierte Fahrzeugdaten (Tempo, Leistung, Akku, Assistent, Warnblinker)
  audio/                   Tonerzeugung (Web Audio API)
  components/              Oberfläche: Cockpit (Rundinstrumente, Assistenz-Ansicht, Hauptdisplay, Mittelkonsole),
                           Karten, Vergleich, Straße, QR-Code
scripts/screenshots.mjs    Playwright-Screenshots und Prüfungen
```
