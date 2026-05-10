#!/usr/bin/env node
/**
 * scripts/build-spells.js
 *
 * Fetches D&D 5e 2024 spell data from two GitHub sources, merges them, and
 * writes the normalized output to src/data/spells-5e2024.json.
 *
 * Usage:
 *   node scripts/build-spells.js            # fetch, merge, write output file
 *   node scripts/build-spells.js --dry-run  # fetch, merge, print stats; do NOT write
 *   node scripts/build-spells.js --verbose  # include per-spell warnings in addition to summary
 *
 * Sources:
 *   1. 5etools (structured metadata):
 *      https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/spells/spells-xphb.json
 *
 *   2. Dear-Mercy/DnD-5e-2024-Spells (prose descriptions + class lists):
 *      https://raw.githubusercontent.com/Dear-Mercy/DnD-5e-2024-Spells/main/Spells%20DnD%205e%202024%203-12-2025.csv
 *
 * Requirements: Node 18+ (uses built-in fetch). No extra npm packages needed.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(ROOT, 'src/data/spells-5e2024.json');

const FIVETOOLS_URL =
  'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/spells/spells-xphb.json';

const DEAR_MERCY_URL =
  'https://raw.githubusercontent.com/Dear-Mercy/DnD-5e-2024-Spells/main/Spells%20DnD%205e%202024%203-12-2025.csv';

// Only include spells whose source matches one of these (2024 PHB in 5etools).
const ALLOWED_SOURCES = new Set(['XPHB']);

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

/** 5etools single-letter school codes → full names */
const SCHOOL_MAP = {
  V: 'evocation',
  C: 'conjuration',
  A: 'abjuration',
  E: 'enchantment',
  I: 'illusion',
  N: 'necromancy',
  T: 'transmutation',
  D: 'divination',
};

/** Canonical class names (lowercase) that appear in the output schema */
const CANONICAL_CLASSES = new Set([
  'wizard',
  'sorcerer',
  'bard',
  'cleric',
  'druid',
  'paladin',
  'ranger',
  'warlock',
  'eldritch-knight',
  'arcane-trickster',
]);

/**
 * Map of Dear-Mercy CSV class hashtags (lowercase, no #) to canonical ids.
 * EK and AT are not in Dear-Mercy — they are auto-derived from wizard.
 */
const DM_CLASS_MAP = {
  bard: 'bard',
  cleric: 'cleric',
  druid: 'druid',
  paladin: 'paladin',
  ranger: 'ranger',
  sorcerer: 'sorcerer',
  warlock: 'warlock',
  wizard: 'wizard',
};

/** Canonical sort order for class output */
const CLASS_ORDER = [
  'bard', 'cleric', 'druid', 'paladin', 'ranger',
  'sorcerer', 'warlock', 'wizard',
  'arcane-trickster', 'eldritch-knight',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a spell name to a URL-safe slug used as `id`. */
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, '') // remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // non-alphanum → dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

/** Normalize a name for lookup matching (lowercase, trimmed, / treated as space). */
function normalizeName(name) {
  return name.toLowerCase().trim().replace(/\//g, ' ');
}

/**
 * Strip 5etools inline markup from a string.
 * Patterns: {@tag content}, {@tag content|source}, {@tag content|opt|display}
 * Strategy: take the first segment (content) as the display text.
 */
function stripMarkup(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\{@\w+\s+([^|{}]+)(?:\|[^{}]*)?\}/g, (_, content) => content.trim())
    .replace(/\{[^{}]*\}/g, '')
    .replace(/  +/g, ' ')
    .trim();
}

/**
 * Parse a two-column CSV where the second column may be a multiline quoted string.
 * Returns an array of [col1, col2] pairs.
 */
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    // Skip blank lines
    while (i < len && (text[i] === '\r' || text[i] === '\n')) i++;
    if (i >= len) break;

    // Col 1: unquoted, up to first comma
    const commaIdx = text.indexOf(',', i);
    if (commaIdx === -1) break;
    const col1 = text.slice(i, commaIdx).trim();
    i = commaIdx + 1;

    // Col 2: quoted value (handles embedded newlines and doubled-quote escapes)
    let col2 = '';
    if (text[i] === '"') {
      i++;
      while (i < len) {
        if (text[i] === '"' && text[i + 1] === '"') {
          col2 += '"';
          i += 2;
        } else if (text[i] === '"') {
          i++;
          break;
        } else {
          col2 += text[i++];
        }
      }
    } else {
      // Unquoted — consume until newline
      const nl = text.indexOf('\n', i);
      col2 = nl === -1 ? text.slice(i) : text.slice(i, nl);
      i = nl === -1 ? len : nl + 1;
    }

    if (col1) rows.push([col1, col2]);
  }
  return rows;
}

/**
 * Parse a Dear-Mercy description block (the second CSV column) into
 * { description, higherLevel, classes }.
 *
 * Block format (trimmed):
 *   level N - #school [( #ritual )] Casting Time: … Range: … Components: … Duration: …
 *
 *   [body paragraphs]
 *
 *   [Using a Higher-Level Spell Slot. … / Cantrip Upgrade. …]
 *
 *   #Class1 #Class2 …
 */
function parseDearMercyBlock(block) {
  const lines = block.split('\n').map((l) => l.trim());

  // First line is the metadata header — skip it
  const bodyLines = lines.slice(1);

  // Find the class tags line: last non-empty line consisting only of #Word tokens
  let classLine = '';
  let bodyEnd = bodyLines.length;
  for (let j = bodyLines.length - 1; j >= 0; j--) {
    if (!bodyLines[j]) continue;
    if (/^(#[A-Za-z]+\s*)+$/.test(bodyLines[j])) {
      classLine = bodyLines[j];
      bodyEnd = j;
    }
    break;
  }

  const contentLines = bodyLines.slice(0, bodyEnd);

  // Split description / higherLevel at "Using a Higher-Level Spell Slot" or "Cantrip Upgrade"
  const HIGHER_RE = /^(Using a Higher-Level Spell Slot|Cantrip Upgrade|At Higher Levels)[.:]?/i;
  let splitIdx = contentLines.findIndex((l) => HIGHER_RE.test(l));

  let descLines, higherLines;
  if (splitIdx >= 0) {
    descLines = contentLines.slice(0, splitIdx);
    higherLines = contentLines.slice(splitIdx);
  } else {
    descLines = contentLines;
    higherLines = [];
  }

  const description = descLines.filter(Boolean).join('\n\n').trim();
  const higherLevel = higherLines.filter(Boolean).join('\n\n').trim() || undefined;

  // Extract classes from hashtag tokens
  const classes = (classLine.match(/#([A-Za-z]+)/g) ?? [])
    .map((tag) => DM_CLASS_MAP[tag.slice(1).toLowerCase()])
    .filter(Boolean);

  return { description, higherLevel, classes };
}

// ---------------------------------------------------------------------------
// 5etools parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parse the 5etools `time` array into a human-readable casting time string.
 *
 * 5etools format: [{ number: 1, unit: "action" | "bonus" | "reaction" | "minute" | "hour", condition?: string }]
 */
function parseCastingTime(time) {
  if (!Array.isArray(time) || time.length === 0) {
    return 'Unknown';
  }
  const entry = time[0];
  const num = entry.number ?? 1;
  const unit = entry.unit ?? '';
  let result = `${num} ${unit}`;
  if (entry.condition) {
    result += `, ${entry.condition}`;
  }
  return result;
}

/**
 * Parse the 5etools `range` object into a human-readable string.
 *
 * 5etools format:
 *   { type: "point" | "radius" | "cone" | "line" | "cube" | "sphere" | "emanation" | "hemisphere" | "special",
 *     distance?: { type: "feet" | "miles" | "self" | "touch" | "sight" | "unlimited", amount?: number } }
 */
function parseRange(range) {
  if (!range) return 'Unknown';

  const dist = range.distance;
  if (!dist) {
    if (range.type === 'special') return 'Special';
    return 'Unknown';
  }

  const distType = (dist.type ?? '').toLowerCase();

  // Self / Touch / Sight / Unlimited have no numeric distance
  if (distType === 'self') {
    // May have an area shape attached (e.g. self (60-foot cone))
    const shape = range.type;
    if (shape && shape !== 'point') {
      const amount = dist.amount;
      if (amount != null) {
        return `Self (${amount}-foot ${shape})`;
      }
      return `Self (${shape})`;
    }
    return 'Self';
  }
  if (distType === 'touch') return 'Touch';
  if (distType === 'sight') return 'Sight';
  if (distType === 'unlimited') return 'Unlimited';
  if (distType === 'special') return 'Special';

  // Numeric distance
  const amount = dist.amount;
  if (amount == null) return 'Unknown';

  const unit = distType === 'miles' ? (amount === 1 ? 'mile' : 'miles') : 'feet';
  const baseRange = `${amount} ${unit}`;

  // Area shape qualifier
  const shape = range.type;
  if (shape && shape !== 'point') {
    return `${baseRange} (${shape})`;
  }
  return baseRange;
}

/**
 * Parse the 5etools `components` object into a human-readable string.
 *
 * 5etools format:
 *   { v?: true, s?: true, m?: string | { text: string, cost?: {...}, consume?: bool } | true }
 */
function parseComponents(components) {
  if (!components) return '';
  const parts = [];

  if (components.v) parts.push('V');
  if (components.s) parts.push('S');
  if (components.m) {
    let mText = '';
    if (typeof components.m === 'string') {
      mText = components.m;
    } else if (typeof components.m === 'object' && components.m.text) {
      mText = components.m.text;
    }
    parts.push(mText ? `M (${mText})` : 'M');
  }
  if (components.r) parts.push('R'); // royalty (rare)

  return parts.join(', ');
}

/**
 * Parse the 5etools `duration` array into a human-readable string.
 *
 * 5etools format:
 *   [{ type: "instant" | "timed" | "permanent" | "special" | "unlimited",
 *      duration?: { type: "minute" | "hour" | "day" | "round" | "year", amount: number, upTo?: bool },
 *      concentration?: bool }]
 */
function parseDuration(duration) {
  if (!Array.isArray(duration) || duration.length === 0) return 'Unknown';
  const entry = duration[0];
  const type = entry.type ?? '';

  if (type === 'instant') return 'Instantaneous';
  if (type === 'permanent') return 'Until dispelled';
  if (type === 'special') return 'Special';
  if (type === 'unlimited') return 'Unlimited';

  if (type === 'timed' && entry.duration) {
    const d = entry.duration;
    const amount = d.amount ?? 1;
    const unit = d.type ?? 'round';
    const upTo = d.upTo ? 'up to ' : '';
    const unitLabel = amount === 1 ? unit : `${unit}s`;
    const base = `${upTo}${amount} ${unitLabel}`;

    if (entry.concentration) {
      return `Concentration, ${base}`;
    }
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  return 'Unknown';
}

/**
 * Extract whether any duration entry marks this as a concentration spell.
 */
function isConcentration(duration) {
  if (!Array.isArray(duration)) return false;
  return duration.some((d) => d.concentration === true);
}

/**
 * Extract class names from the 5etools `classes` object, mapping to canonical
 * lowercase identifiers. Returns a deduplicated sorted array.
 *
 * 5etools classes structure (v2 / current):
 *   {
 *     fromClassList: [{ name: "Wizard", source: "..." }, ...],
 *     fromSubclass: [{ class: { name: "Fighter", source: "..." }, subclass: { name: "Eldritch Knight", source: "..." } }, ...],
 *     fromClassListVariant: [...],
 *   }
 *
 * Older / simpler format may just be an array of { name } objects.
 */
function parseClasses(classes) {
  if (!classes) return [];

  const result = new Set();

  const addClassName = (name) => {
    if (!name) return;
    const lower = name.toLowerCase().trim();
    if (CANONICAL_CLASSES.has(lower)) {
      result.add(lower);
    }
  };

  // fromClassList (standard classes)
  if (Array.isArray(classes.fromClassList)) {
    for (const entry of classes.fromClassList) {
      addClassName(entry.name);
    }
  }

  // fromClassListVariant (optional rule classes, e.g. Artificer)
  if (Array.isArray(classes.fromClassListVariant)) {
    for (const entry of classes.fromClassListVariant) {
      addClassName(entry.name);
    }
  }

  // fromSubclass (Eldritch Knight, Arcane Trickster, etc.)
  if (Array.isArray(classes.fromSubclass)) {
    for (const entry of classes.fromSubclass) {
      const subName = entry?.subclass?.name ?? '';
      if (subName.toLowerCase().includes('eldritch knight')) {
        result.add('eldritch-knight');
      } else if (subName.toLowerCase().includes('arcane trickster')) {
        result.add('arcane-trickster');
      }
    }
  }

  // Fallback: plain array of { name } (older 5etools format)
  if (Array.isArray(classes)) {
    for (const entry of classes) {
      if (typeof entry === 'string') {
        addClassName(entry);
      } else if (entry?.name) {
        addClassName(entry.name);
      }
    }
  }

  // Consistent ordering: canonical order first, then alphabetical for unknowns
  const ORDER = [
    'bard', 'cleric', 'druid', 'paladin', 'ranger',
    'sorcerer', 'warlock', 'wizard',
    'arcane-trickster', 'eldritch-knight',
  ];
  return ORDER.filter((c) => result.has(c));
}

/**
 * Flatten potentially nested 5etools description entries into plain text.
 * 5etools uses a rich `entries` format with strings, objects (type: "entries",
 * type: "list", type: "table", etc.). We do a best-effort plain-text extraction.
 */
function flattenEntries(entries) {
  if (!entries) return '';
  if (typeof entries === 'string') return stripMarkup(entries);
  if (!Array.isArray(entries)) return '';

  return entries
    .map((entry) => {
      if (typeof entry === 'string') return stripMarkup(entry);
      if (typeof entry !== 'object' || entry === null) return '';

      switch (entry.type) {
        case 'entries': {
          const header = entry.name ? `${entry.name}: ` : '';
          return header + flattenEntries(entry.entries);
        }
        case 'list':
          return flattenEntries(entry.items);
        case 'item':
          return (entry.name ? `${entry.name}: ` : '') + flattenEntries(entry.entries ?? entry.entry ?? '');
        case 'table': {
          // Emit a compact summary rather than a full table
          const caption = entry.caption ? `[Table: ${entry.caption}] ` : '[Table] ';
          const rows = (entry.rows ?? [])
            .map((row) => (Array.isArray(row) ? row.join(' | ') : String(row)))
            .join('; ');
          return caption + rows;
        }
        case 'cell':
          return flattenEntries(entry.entry ?? entry.entries ?? '');
        default:
          // Generic fallback: recurse into any `entries` or `entry` child
          if (entry.entries) return flattenEntries(entry.entries);
          if (entry.entry) return flattenEntries(entry.entry);
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${url}`);
  }
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${url}`);
  }
  return res.text();
}

// ---------------------------------------------------------------------------
// Source parsers
// ---------------------------------------------------------------------------

/**
 * Fetch and normalize 5etools XPHB spell data.
 * Returns a Map<normalizedName, NormalizedSpell>.
 */
async function fetch5etoolsSpells() {
  console.log(`Fetching 5etools data from: ${FIVETOOLS_URL}`);
  const raw = await fetchJson(FIVETOOLS_URL);

  const spellArray = raw.spell ?? raw.spells ?? raw;
  if (!Array.isArray(spellArray)) {
    throw new Error(
      '5etools response does not contain a "spell" array. Check the URL and data format.'
    );
  }

  console.log(`  Raw 5etools spells found: ${spellArray.length}`);

  const map = new Map();
  let skipped = 0;

  for (const spell of spellArray) {
    // Filter to 2024 PHB source only
    const source = spell.source ?? '';
    if (!ALLOWED_SOURCES.has(source)) {
      skipped++;
      continue;
    }

    const name = spell.name;
    if (!name) {
      process.stderr.write(`[WARN] 5etools spell missing name, skipping: ${JSON.stringify(spell).slice(0, 80)}\n`);
      continue;
    }

    const school = SCHOOL_MAP[spell.school];
    if (!school) {
      process.stderr.write(`[WARN] Unknown school code "${spell.school}" on spell "${spell.name}"\n`);
    }
    const schoolName = school ?? spell.school ?? 'unknown';
    const durationArr = spell.duration ?? [];
    const ritualMeta = spell.meta ?? {};

    const normalized = {
      id: slugify(name),
      name,
      level: spell.level ?? 0,
      school: schoolName,
      castingTime: parseCastingTime(spell.time),
      range: parseRange(spell.range),
      components: parseComponents(spell.components),
      duration: parseDuration(durationArr),
      concentration: isConcentration(durationArr),
      ritual: ritualMeta.ritual === true || spell.ritual === true,
      description: flattenEntries(spell.entries),
      higherLevel: spell.entriesHigherLevel
        ? flattenEntries(spell.entriesHigherLevel)
        : undefined,
      classes: parseClasses(spell.classes),
    };

    map.set(normalizeName(name), normalized);
  }

  console.log(
    `  Kept ${map.size} XPHB spells; skipped ${skipped} from other sources.`
  );
  return map;
}

/**
 * Fetch and parse Dear-Mercy CSV.
 * Returns a Map<normalizedName, { description, higherLevel, classes }>.
 */
async function fetchDearMercySpells() {
  console.log(`Fetching Dear-Mercy data from: ${DEAR_MERCY_URL}`);

  let csvText;
  try {
    csvText = await fetchText(DEAR_MERCY_URL);
  } catch (err) {
    process.stderr.write(
      `[WARN] Could not fetch Dear-Mercy data (${err.message}). Proceeding with 5etools data only.\n`
    );
    return new Map();
  }

  const rows = parseCSV(csvText);
  console.log(`  Dear-Mercy spells found: ${rows.length}`);

  const map = new Map();
  for (const [name, block] of rows) {
    if (!name) continue;
    const parsed = parseDearMercyBlock(block);
    map.set(normalizeName(name), { name, ...parsed });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Merge logic
// ---------------------------------------------------------------------------

/**
 * Merge 5etools and Dear-Mercy data into the final output array.
 *
 * Rules:
 *   1. For each Dear-Mercy entry matched to a 5etools entry: keep all
 *      5etools fields, overwrite description + higherLevel with Dear-Mercy prose.
 *   2. Dear-Mercy-only entries: include with fields mapped to schema; warn.
 *   3. 5etools-only entries: include as-is; warn.
 */
/**
 * Merge 5etools and Dear-Mercy data.
 * dearMercyMap: Map<normalizedName, { name, description, higherLevel, classes }>
 */
function mergeSpells(fivetoolsMap, dearMercyMap, verbose = false) {
  const output = new Map();
  const dearMercyMatched = new Set();

  // Process all 5etools spells
  for (const [key, spell] of fivetoolsMap) {
    const dm = dearMercyMap.get(key);

    let classes;
    let description = spell.description;
    let higherLevel = spell.higherLevel;

    if (dm) {
      dearMercyMatched.add(key);
      if (dm.description !== undefined) description = dm.description;
      if (dm.higherLevel !== undefined) higherLevel = dm.higherLevel;
      classes = dm.classes ?? [];
    } else {
      if (verbose) {
        process.stderr.write(`[WARN] 5etools-only spell "${spell.name}" has no matching Dear-Mercy entry.\n`);
      }
      classes = spell.classes ?? [];
    }

    // Eldritch Knight and Arcane Trickster use the Wizard spell list
    if (classes.includes('wizard') && !classes.includes('eldritch-knight')) {
      classes = [...classes, 'eldritch-knight', 'arcane-trickster'];
    }

    // Sort into canonical order
    classes = CLASS_ORDER.filter((c) => classes.includes(c));

    const merged = { ...spell, description, classes };
    if (higherLevel !== undefined) {
      merged.higherLevel = higherLevel;
    } else {
      delete merged.higherLevel;
    }
    output.set(key, merged);
  }

  // Include Dear-Mercy-only spells with a warning
  let dmOnly = 0;
  for (const [key, dm] of dearMercyMap) {
    if (!dearMercyMatched.has(key)) {
      if (verbose) {
        process.stderr.write(`[WARN] Dear-Mercy spell "${dm.name}" not found in 5etools; including with partial data.\n`);
      }
      dmOnly++;
      let classes = dm.classes ?? [];
      if (classes.includes('wizard') && !classes.includes('eldritch-knight')) {
        classes = [...classes, 'eldritch-knight', 'arcane-trickster'];
      }
      classes = CLASS_ORDER.filter((c) => classes.includes(c));
      const dmOnlyEntry = {
        id: slugify(dm.name),
        name: dm.name,
        level: 0,
        school: 'unknown',
        castingTime: 'Unknown',
        range: 'Unknown',
        components: '',
        duration: 'Unknown',
        concentration: false,
        ritual: false,
        description: dm.description ?? '',
        classes,
        ...(dm.higherLevel !== undefined ? { higherLevel: dm.higherLevel } : {}),
      };
      output.set(key, dmOnlyEntry);
    }
  }

  const unmatched5etools = fivetoolsMap.size - dearMercyMatched.size;
  if (unmatched5etools > 0) {
    process.stderr.write(
      `[INFO] ${unmatched5etools} 5etools spells had no matching Dear-Mercy entry (description from 5etools entries).\n`
    );
  }
  if (dmOnly > 0) {
    process.stderr.write(`[INFO] ${dmOnly} Dear-Mercy-only spells included with partial metadata.\n`);
  }

  return Array.from(output.values()).sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const verbose = process.argv.includes('--verbose');

  if (dryRun) {
    console.log('[DRY RUN] Will not write output file.');
  }

  // 1. Fetch sources
  const [fivetoolsMap, dearMercyMap] = await Promise.all([
    fetch5etoolsSpells(),
    fetchDearMercySpells(),
  ]);

  // 2. Merge
  console.log('\nMerging data sources...');
  const spells = mergeSpells(fivetoolsMap, dearMercyMap, verbose);

  // 3. Stats
  const byLevel = {};
  for (const s of spells) {
    byLevel[s.level] = (byLevel[s.level] ?? 0) + 1;
  }
  console.log(`\nTotal spells in output: ${spells.length}`);
  console.log('Breakdown by level:');
  for (const lvl of Object.keys(byLevel).sort((a, b) => Number(a) - Number(b))) {
    const label = lvl === '0' ? 'Cantrip' : `Level ${lvl}`;
    console.log(`  ${label}: ${byLevel[lvl]}`);
  }

  // 4. Write or skip
  if (dryRun) {
    console.log('\n[DRY RUN] Skipping file write. Pass without --dry-run to generate output.');
    return;
  }

  // Ensure output directory exists
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  const json = JSON.stringify(spells, null, 2);
  writeFileSync(OUTPUT_PATH, json, 'utf-8');
  console.log(`\nWrote ${spells.length} spells to: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  process.stderr.write(`[ERROR] ${err.message}\n${err.stack ?? ''}\n`);
  process.exit(1);
});
