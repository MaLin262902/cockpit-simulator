import type { MouseEvent } from 'react';
import type { Karte, KartenZustand } from '../../data/types';
import { zustandVon } from '../../effects/deriveCockpit';
import { useKarten } from '../../state/cockpitState';
import styles from './Card.module.css';

interface Props {
  karte: Karte;
  nummer: number;
}

/** Vorderseite: Vorgabe korrekt umgesetzt (grün). Rückseite: Vorgabe invertiert (rot). */
export function Card({ karte, nummer }: Props) {
  const { zustaende, umschalten } = useKarten();
  const zustand = zustandVon(zustaende, karte.id);
  const invertiert = zustand === 'invertiert';

  // Ein Klick irgendwo auf die Karte schaltet um (Info-Bereich und Links ausgenommen).
  const klickAufKarte = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, summary, details')) return;
    umschalten(karte.id);
  };

  const titelId = `karte-${karte.id}`;

  return (
    <article className={styles.karte} data-zustand={zustand} aria-labelledby={titelId}>
      <div className={styles.dreher}>
        <div className={`${styles.seite} ${styles.vorne}`} inert={invertiert} onClick={klickAufKarte}>
          <Kopf nummer={nummer} zustand="korrekt" />
          <h3 className={styles.titel} id={titelId}>
            {karte.vorgabe}
          </h3>
          <p className={styles.text}>{karte.regel}</p>
          <div className={styles.aktionen}>
            <button type="button" className="btn btn-inversion" onClick={() => umschalten(karte.id)}>
              Invertieren
            </button>
          </div>
          <Info karte={karte} />
        </div>

        <div className={`${styles.seite} ${styles.hinten}`} inert={!invertiert} onClick={klickAufKarte}>
          <Kopf nummer={nummer} zustand="invertiert" />
          <h3 className={styles.titel}>{karte.vorgabe}</h3>
          <p className={styles.text}>
            <strong className={styles.marke}>Invertiert:</strong> {karte.sabotage}
          </p>
          <div className={styles.aktionen}>
            <button type="button" className="btn btn-korrekt" onClick={() => umschalten(karte.id)}>
              Korrigieren
            </button>
          </div>
          <Info karte={karte} />
        </div>
      </div>
    </article>
  );
}

const ZUSTAND_TEXT: Record<KartenZustand, string> = {
  korrekt: 'Korrekt',
  invertiert: 'Invertiert',
};

function Kopf({ nummer, zustand }: { nummer: number; zustand: KartenZustand }) {
  return (
    <div className={styles.kopf}>
      <span className={styles.nummer} aria-hidden="true">
        {nummer}
      </span>
      <span className={styles.status} data-zustand={zustand}>
        {ZUSTAND_TEXT[zustand]}
      </span>
    </div>
  );
}

function Info({ karte }: { karte: Karte }) {
  return (
    <details className={styles.info}>
      <summary>Info zur Vorgabe</summary>
      <dl>
        <dt>Vorgabe</dt>
        <dd>{karte.vorgabe}</dd>
        <dt>Quelle</dt>
        <dd>
          {karte.quelleUrl ? (
            <a href={karte.quelleUrl} target="_blank" rel="noopener noreferrer">
              {karte.quelle}
            </a>
          ) : (
            karte.quelle
          )}
          {karte.quelleStatus === 'prüfen' && <span className={styles.pruefen}>Quelle wird noch geprüft</span>}
          {karte.quelleHinweis && <span className={styles.quelleHinweis}>{karte.quelleHinweis}</span>}
        </dd>
        <dt>Regel</dt>
        <dd>{karte.regel}</dd>
        <dt>Was die Inversion bewirkt</dt>
        <dd>{karte.sabotage}</dd>
        <dt>Korrekte Umsetzung</dt>
        <dd>{karte.korrekt}</dd>
      </dl>
    </details>
  );
}
