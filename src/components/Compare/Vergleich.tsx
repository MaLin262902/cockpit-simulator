import { useMemo, useState } from 'react';
import { deriveCockpit, zaehleInvertierte } from '../../effects/deriveCockpit';
import { useKarten } from '../../state/cockpitState';
import { Cockpit } from '../Cockpit/Cockpit';
import styles from './Vergleich.module.css';

type Seite = 'aktuell' | 'korrekt';

/**
 * Links der aktuelle Stand (bleibt über die Karten bearbeitbar), rechts das vollständig korrekte Cockpit.
 * Desktop: nebeneinander. Handy: Tabs.
 */
export function Vergleich() {
  const { karten, zustaende } = useKarten();
  const [tab, setTab] = useState<Seite>('aktuell');
  const anzahl = zaehleInvertierte(karten, zustaende);

  const modelle = useMemo(
    () => ({
      aktuell: deriveCockpit(karten, zustaende),
      korrekt: deriveCockpit(karten, {}),
    }),
    [karten, zustaende],
  );

  const seiten: { id: Seite; titel: string; zusatz: string }[] = [
    { id: 'aktuell', titel: 'Aktueller Stand', zusatz: `${anzahl} von ${karten.length} invertiert` },
    { id: 'korrekt', titel: 'Korrekt', zusatz: 'alle Vorgaben umgesetzt' },
  ];

  return (
    <section className={styles.vergleich} aria-label="Vergleich">
      <p className={styles.hinweis}>Karten im Menü weiter antippen: Der aktuelle Stand ändert sich mit.</p>
      <div className={styles.tabs} role="tablist" aria-label="Ansicht wählen">
        {seiten.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`tab-${s.id}`}
            aria-selected={tab === s.id}
            aria-controls={`panel-${s.id}`}
            className={styles.tab}
            data-seite={s.id}
            data-invertiert={s.id === 'aktuell' && anzahl > 0}
            onClick={() => setTab(s.id)}
          >
            {s.titel}
          </button>
        ))}
      </div>
      <div className={styles.raster}>
        {seiten.map((s) => (
          <div
            key={s.id}
            id={`panel-${s.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${s.id}`}
            className={styles.spalte}
            data-aktiv={tab === s.id}
          >
            <h2 className={styles.titel} data-seite={s.id} data-invertiert={s.id === 'aktuell' && anzahl > 0}>
              {s.titel} <span className={styles.zusatz}>· {s.zusatz}</span>
            </h2>
            <Cockpit modell={modelle[s.id]} beschriftung={`Cockpit, ${s.titel.toLowerCase()}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
