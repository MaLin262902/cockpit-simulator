import { describe, expect, it } from 'vitest';
import { kartenReducer } from './cockpitState';

describe('kartenReducer', () => {
  it('schaltet eine Karte zwischen korrekt und invertiert um', () => {
    const an = kartenReducer({}, { typ: 'umschalten', id: 'a' });
    expect(an).toEqual({ a: 'invertiert' });
    expect(kartenReducer(an, { typ: 'umschalten', id: 'a' })).toEqual({});
  });

  it('alles invertieren und alles korrigieren', () => {
    const ids = ['a', 'b'];
    expect(kartenReducer({}, { typ: 'alleSetzen', ids, zustand: 'invertiert' })).toEqual({
      a: 'invertiert',
      b: 'invertiert',
    });
    expect(kartenReducer({ a: 'invertiert' }, { typ: 'alleSetzen', ids, zustand: 'korrekt' })).toEqual({});
  });
});
