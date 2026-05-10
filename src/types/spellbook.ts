export interface AppState {
  profiles: Profile[];
  activeProfileId: string;
}

export interface Profile {
  id: string;
  name: string;
  classEntries: ClassEntry[];   // ordered; first entry = primary class
  spellbooks: Spellbook[];
  activeSpellbookId: string;
  slotUsage: SlotUsage;
}

export interface ClassEntry {
  class: SpellcastingClass;
  subclass?: 'eldritch-knight' | 'arcane-trickster';
  level: number;               // 1–20
}

export type SpellcastingClass =
  | 'wizard' | 'sorcerer' | 'bard' | 'cleric' | 'druid'  // full casters
  | 'paladin' | 'ranger'                                   // half casters
  | 'eldritch-knight' | 'arcane-trickster'                 // third casters
  | 'warlock';                                             // pact magic

export interface SlotUsage {
  regular: Record<number, number>;  // spell level → used count
  pact: number;                      // used count
  arcanum: Record<number, 0 | 1>;   // spell level (6–9) → 0 or 1
}

export interface Spellbook {
  id: string;
  name: string;
  spellIds: string[];
}

export interface Spell {
  id: string;
  name: string;
  level: number;           // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevel?: string;
  classes: string[];
}
