import { useAudio } from '../../audio/AudioContext';
import { zaehleInvertierte } from '../../effects/deriveCockpit';
import { useKarten } from '../../state/cockpitState';
import { Lautsprecher, Stumm } from '../Cockpit/icons';
import styles from './Toolbar.module.css';

interface Props {
  vergleich: boolean;
  setVergleich: (an: boolean) => void;
  oeffneQr: () => void;
}

export function Toolbar({ vergleich, setVergleich, oeffneQr }: Props) {
  const audio = useAudio();
  const { karten, zustaende, allesInvertieren, allesKorrigieren } = useKarten();
  const invertiert = zaehleInvertierte(karten, zustaende);

  return (
    <div className={styles.leiste} role="toolbar" aria-label="Steuerung">
      <div className={styles.gruppe}>
        <button
          type="button"
          className={`btn ${styles.ton}`}
          aria-pressed={audio.an}
          onClick={audio.umschalten}
        >
          {audio.an ? <Lautsprecher /> : <Stumm />}
          Ton {audio.an ? 'an' : 'aus'}
        </button>
        {audio.an && (
          <label className={styles.lautstaerke}>
            <span className="visually-hidden">Lautstärke</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.lautstaerke}
              onChange={(e) => audio.setLautstaerke(Number(e.target.value))}
            />
          </label>
        )}
        <button
          type="button"
          className="btn"
          aria-pressed={vergleich}
          onClick={() => setVergleich(!vergleich)}
        >
          Vergleich
        </button>
        <button type="button" className="btn" onClick={oeffneQr}>
          QR-Code
        </button>
      </div>
      <div className={styles.gruppe}>
        <button
          type="button"
          className="btn btn-inversion"
          onClick={allesInvertieren}
          disabled={invertiert === karten.length}
          aria-label="Alles invertieren"
        >
          <span className={styles.lang}>Alles invertieren</span>
          <span className={styles.kurz}>Invertieren</span>
        </button>
        <button
          type="button"
          className="btn btn-korrekt"
          onClick={allesKorrigieren}
          disabled={invertiert === 0}
          aria-label="Alles korrigieren"
        >
          <span className={styles.lang}>Alles korrigieren</span>
          <span className={styles.kurz}>Korrigieren</span>
        </button>
      </div>
    </div>
  );
}
