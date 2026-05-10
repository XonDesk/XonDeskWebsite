import {
  computeCasterLevel,
  getRegularSlots,
  getPactMagic,
  getArcanumLevels,
} from './slotTables';
import type { ClassEntry } from '../types/spellbook';

function entry(cls: ClassEntry['class'], level: number): ClassEntry {
  return { class: cls, level };
}

describe('computeCasterLevel', () => {
  it('wizard 5 = 5 (full caster)', () => {
    expect(computeCasterLevel([entry('wizard', 5)])).toBe(5);
  });

  it('paladin 2 = 1 (half caster, floor(2/2))', () => {
    expect(computeCasterLevel([entry('paladin', 2)])).toBe(1);
  });

  it('ranger 1 = 0 (half caster, floor(1/2))', () => {
    expect(computeCasterLevel([entry('ranger', 1)])).toBe(0);
  });

  it('eldritch-knight 3 = 1 (third caster, floor(3/3))', () => {
    expect(computeCasterLevel([entry('eldritch-knight', 3)])).toBe(1);
  });

  it('warlock 3 = 0 (pact magic, does not contribute to multiclass caster level)', () => {
    expect(computeCasterLevel([entry('warlock', 3)])).toBe(0);
  });

  it('wizard 5 + warlock 3 = 5 (warlock does not contribute)', () => {
    expect(computeCasterLevel([entry('wizard', 5), entry('warlock', 3)])).toBe(5);
  });

  it('paladin 4 + wizard 2 = 4 (floor(4/2) + 2 = 2 + 2)', () => {
    expect(computeCasterLevel([entry('paladin', 4), entry('wizard', 2)])).toBe(4);
  });

  it('eldritch-knight 6 + wizard 3 = 5 (floor(6/3) + 3 = 2 + 3)', () => {
    expect(computeCasterLevel([entry('eldritch-knight', 6), entry('wizard', 3)])).toBe(5);
  });
});

describe('getRegularSlots', () => {
  it('casterLevel 0 returns empty object', () => {
    expect(getRegularSlots(0)).toEqual({});
  });

  it('casterLevel 1 returns {1: 2}', () => {
    expect(getRegularSlots(1)).toEqual({ 1: 2 });
  });

  it('casterLevel 5 returns {1: 4, 2: 3, 3: 2}', () => {
    expect(getRegularSlots(5)).toEqual({ 1: 4, 2: 3, 3: 2 });
  });

  it('casterLevel 20 returns all nine slot levels', () => {
    expect(getRegularSlots(20)).toEqual({
      1: 4,
      2: 3,
      3: 3,
      4: 3,
      5: 3,
      6: 2,
      7: 2,
      8: 1,
      9: 1,
    });
  });
});

describe('getPactMagic', () => {
  it('warlockLevel 0 returns null', () => {
    expect(getPactMagic(0)).toBeNull();
  });

  it('warlockLevel 1 returns {slots: 1, slotLevel: 1}', () => {
    expect(getPactMagic(1)).toEqual({ slots: 1, slotLevel: 1 });
  });

  it('warlockLevel 3 returns {slots: 2, slotLevel: 2}', () => {
    expect(getPactMagic(3)).toEqual({ slots: 2, slotLevel: 2 });
  });

  it('warlockLevel 11 returns {slots: 3, slotLevel: 5}', () => {
    expect(getPactMagic(11)).toEqual({ slots: 3, slotLevel: 5 });
  });
});

describe('getArcanumLevels', () => {
  it('warlockLevel 10 returns [] (no arcanum unlocked)', () => {
    expect(getArcanumLevels(10)).toEqual([]);
  });

  it('warlockLevel 11 returns [6]', () => {
    expect(getArcanumLevels(11)).toEqual([6]);
  });

  it('warlockLevel 13 returns [6, 7]', () => {
    expect(getArcanumLevels(13)).toEqual([6, 7]);
  });

  it('warlockLevel 17 returns [6, 7, 8, 9]', () => {
    expect(getArcanumLevels(17)).toEqual([6, 7, 8, 9]);
  });
});
