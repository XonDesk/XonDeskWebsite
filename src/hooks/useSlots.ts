import { useMemo } from 'react';
import type { ClassEntry } from '../types/spellbook';
import {
  computeCasterLevel,
  getRegularSlots,
  getPactMagic,
  getArcanumLevels,
} from '../data/slotTables';

export interface SlotSummary {
  casterLevel: number;
  regularSlots: Record<number, number>;
  pactMagic: { slots: number; slotLevel: number } | null;
  arcanumLevels: number[];
}

export function useSlots(classEntries: ClassEntry[]): SlotSummary {
  return useMemo(() => {
    const casterLevel = computeCasterLevel(classEntries);
    const warlockLevel = classEntries
      .filter(e => e.class === 'warlock')
      .reduce((sum, e) => sum + e.level, 0);
    return {
      casterLevel,
      regularSlots: getRegularSlots(casterLevel),
      pactMagic: getPactMagic(warlockLevel),
      arcanumLevels: getArcanumLevels(warlockLevel),
    };
  }, [classEntries]);
}
