import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import styles from './QrDialog.module.css';

interface Props {
  schliessen: () => void;
}

/** QR-Code wird lokal erzeugt; die Adresse verlässt den Browser nicht. */
export function QrDialog({ schliessen }: Props) {
  const adresse = window.location.href.split('#')[0];
  const [svg, setSvg] = useState('');
  const knopf = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    QRCode.toString(adresse, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
      .then(setSvg)
      .catch(() => setSvg(''));
  }, [adresse]);

  useEffect(() => {
    knopf.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') schliessen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [schliessen]);

  return (
    <div className={styles.hintergrund} onClick={schliessen}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-titel"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="qr-titel" className={styles.titel}>
          Selbst ausprobieren
        </h2>
        <div
          className={styles.code}
          role="img"
          aria-label={`QR-Code für ${adresse}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className={styles.adresse}>{adresse}</p>
        <button ref={knopf} type="button" className="btn btn-primary" onClick={schliessen}>
          Schließen
        </button>
      </div>
    </div>
  );
}
