import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { cards } from '../data/cards';
import type { Karte, KartenZustand } from '../data/types';
import { zustandVon, type Zustaende } from '../effects/deriveCockpit';

export type Aktion =
  | { typ: 'umschalten'; id: string }
  | { typ: 'alleSetzen'; ids: string[]; zustand: KartenZustand };

/** Jede Karte ist entweder korrekt (Standard) oder invertiert. Gespeichert werden nur die invertierten. */
export function kartenReducer(state: Zustaende, aktion: Aktion): Zustaende {
  switch (aktion.typ) {
    case 'umschalten': {
      const neu = { ...state };
      if (zustandVon(state, aktion.id) === 'invertiert') delete neu[aktion.id];
      else neu[aktion.id] = 'invertiert';
      return neu;
    }
    case 'alleSetzen':
      if (aktion.zustand === 'korrekt') return {};
      return Object.fromEntries(aktion.ids.map((id) => [id, aktion.zustand]));
  }
}

interface KartenKontext {
  karten: Karte[];
  zustaende: Zustaende;
  umschalten: (id: string) => void;
  allesInvertieren: () => void;
  allesKorrigieren: () => void;
}

const Kontext = createContext<KartenKontext | null>(null);

export function KartenProvider({ children }: { children: ReactNode }) {
  const [zustaende, dispatch] = useReducer(kartenReducer, {});
  const umschalten = useCallback((id: string) => dispatch({ typ: 'umschalten', id }), []);
  const wert = useMemo<KartenKontext>(() => {
    const ids = cards.map((k) => k.id);
    return {
      karten: cards,
      zustaende,
      umschalten,
      allesInvertieren: () => dispatch({ typ: 'alleSetzen', ids, zustand: 'invertiert' }),
      allesKorrigieren: () => dispatch({ typ: 'alleSetzen', ids, zustand: 'korrekt' }),
    };
  }, [zustaende, umschalten]);
  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useKarten(): KartenKontext {
  const k = useContext(Kontext);
  if (!k) throw new Error('useKarten außerhalb von KartenProvider');
  return k;
}
