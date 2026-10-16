import { zaehleInvertierte } from '../../effects/deriveCockpit';
import type { Karte } from '../../data/types';
import { useKarten } from '../../state/cockpitState';
import { Card } from '../Card/Card';
import styles from './CardList.module.css';

/** Reihenfolge der Bereiche; neue Werte aus cards.ts erscheinen danach. */
const THEMEN = ['Farben, Icons und Kontrast', 'Anordnung', 'Bedienung', 'Inhalte, Sprache und Ton', 'Assistenzsysteme'];

/** Karten nach UI-Bereich (Feld `kategorie`) gruppiert. */
function nachThema(karten: Karte[]) {
  const gruppen = new Map<string, { karte: Karte; nummer: number }[]>();
  karten.forEach((karte, i) => {
    gruppen.set(karte.kategorie, [...(gruppen.get(karte.kategorie) ?? []), { karte, nummer: i + 1 }]);
  });
  const rang = (thema: string) => (THEMEN.includes(thema) ? THEMEN.indexOf(thema) : THEMEN.length);
  return [...gruppen.entries()].sort(([a], [b]) => rang(a) - rang(b));
}

/** Inhalt der Menü-Blase: Anleitung und die Karten in aufklappbaren Bereichen. */
export function CardList() {
  const { karten, zustaende } = useKarten();

  return (
    <section className={styles.liste} aria-label="Gestaltungsvorgaben">
      <p className={styles.anleitung}>
        Bereich aufklappen, dann Karte antippen: Grün ist korrekt umgesetzt, Rot ist invertiert. Noch einmal
        antippen korrigiert.
      </p>
      {nachThema(karten).map(([thema, eintraege]) => {
        const z = zaehleInvertierte(
          eintraege.map((e) => e.karte),
          zustaende,
        );
        return (
          <details key={thema} className={styles.gruppe}>
            <summary>
              <span className={styles.thema}>{thema}</span>
              <span className={styles.zaehler}>
                {z > 0 && (
                  <span data-art="invertiert">
                    {z}
                    <span className="visually-hidden"> invertiert, </span>
                  </span>
                )}
                <span>
                  {eintraege.length}
                  <span className="visually-hidden"> Karten</span>
                </span>
              </span>
            </summary>
            <ol className={styles.karten}>
              {eintraege.map(({ karte, nummer }) => (
                <li key={karte.id}>
                  <Card karte={karte} nummer={nummer} />
                </li>
              ))}
            </ol>
          </details>
        );
      })}
    </section>
  );
}
