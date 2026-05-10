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
 *      https://raw.githubusercontent.com/5etools-mirror-2/5etools-mirror-2/master/data/spells/spells-xphb.json
 *
 *   2. Dear-Mercy/DnD-5e-2024-Spells (prose descriptions):
 *      https://raw.githubusercontent.com/Dear-Mercy/DnD-5e-2024-Spells/main/5e2024spells.json
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
  'https://raw.githubusercontent.com/5etools-mirror-2/5etools-mirror-2/master/data/spells/spells-xphb.json';

const DEAR_MERCY_URL =
  'https://raw.githubusercontent.com/Dear-Mercy/DnD-5e-2024-Spells/main/5e2024spells.json';

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

/** Normalize a name for lookup matching (lowercase, trimmed). */
function normalizeName(name) {
  return name.toLowerCase().trim();
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
  if (typeof entries === 'string') return entries;
  if (!Array.isArray(entries)) return '';

  return entries
    .map((entry) => {
      if (typeof entry === 'string') return entry;
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
 * Fetch and parse Dear-Mercy description data.
 * Returns an array of raw objects (structure TBD at runtime).
 *
 * The Dear-Mercy repo likely has one of these shapes:
 *   - Array of spell objects with { name, description, higherLevel } or similar
 *   - Object keyed by spell name
 *
 * We handle both.
 */
async function fetchDearMercySpells() {
  console.log(`Fetching Dear-Mercy data from: ${DEAR_MERCY_URL}`);

  let raw;
  try {
    raw = await fetchJson(DEAR_MERCY_URL);
  } catch (err) {
    process.stderr.write(
      `[WARN] Could not fetch Dear-Mercy data (${err.message}). Proceeding with 5etools data only.\n`
    );
    return [];
  }

  // Normalize to array
  if (Array.isArray(raw)) {
    console.log(`  Dear-Mercy spells found: ${raw.length}`);
    return raw;
  }

  if (typeof raw === 'object' && raw !== null) {
    // Could be { spells: [...] } or { name: spellObj, ... }
    if (Array.isArray(raw.spells)) {
      console.log(`  Dear-Mercy spells found (via .spells): ${raw.spells.length}`);
      return raw.spells;
    }
    // Treat as name→object map
    const entries = Object.entries(raw).map(([key, val]) => ({
      name: val.name ?? key,
      ...val,
    }));
    console.log(`  Dear-Mercy spells found (name-keyed object): ${entries.length}`);
    return entries;
  }

  process.stderr.write(
    '[WARN] Dear-Mercy data is in an unrecognized format. Skipping descriptions.\n'
  );
  return [];
}

// ---------------------------------------------------------------------------
// Prose extraction from Dear-Mercy entries
// ---------------------------------------------------------------------------

/**
 * Best-effort extraction of description and higherLevel prose from a
 * Dear-Mercy entry. The exact field names are inferred from common patterns
 * observed in community D&D JSON repositories.
 */
function extractDearMercyProse(entry) {
  // Attempt various common field name conventions
  const description =
    entry.description ??
    entry.desc ??
    entry.text ??
    entry.body ??
    (Array.isArray(entry.entries) ? flattenEntries(entry.entries) : undefined) ??
    '';

  const higherLevel =
    entry.higherLevel ??
    entry.higher_level ??
    entry.atHigherLevels ??
    entry.at_higher_levels ??
    (Array.isArray(entry.higher_level_desc) ? entry.higher_level_desc.join('\n') : undefined) ??
    undefined;

  return {
    description: typeof description === 'string' ? description : flattenEntries(description),
    higherLevel:
      higherLevel != null
        ? typeof higherLevel === 'string'
          ? higherLevel
          : flattenEntries(higherLevel)
        : undefined,
  };
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
function mergeSpells(fivetoolsMap, dearMercyEntries, verbose = false) {
  const output = new Map(fivetoolsMap); // copy — keyed by normalizedName
  const dearMercyMatched = new Set();

  for (const dmEntry of dearMercyEntries) {
    const rawName = dmEntry.name ?? '';
    if (!rawName) {
      process.stderr.write('[WARN] Dear-Mercy entry missing name, skipping.\n');
      continue;
    }

    const key = normalizeName(rawName);
    const prose = extractDearMercyProse(dmEntry);

    if (output.has(key)) {
      // Matched — overwrite prose fields only
      const existing = output.get(key);
      const merged = {
        ...existing,
        description: prose.description !== undefined ? prose.description : existing.description,
      };
      // Only set higherLevel if either prose or existing has it defined
      if (prose.higherLevel !== undefined) {
        merged.higherLevel = prose.higherLevel;
      } else if (existing.higherLevel !== undefined) {
        merged.higherLevel = existing.higherLevel;
      }
      output.set(key, merged);
      dearMercyMatched.add(key);
    } else {
      // Dear-Mercy only — build a best-effort spell entry
      if (verbose) {
        process.stderr.write(
          `[WARN] Dear-Mercy spell "${rawName}" not found in 5etools; including with partial data.\n`
        );
      }

      const dmOnlyEntry = {
        id: slugify(rawName),
        name: rawName,
        level: dmEntry.level ?? 0,
        school: dmEntry.school ?? 'unknown',
        castingTime: dmEntry.castingTime ?? dmEntry.casting_time ?? 'Unknown',
        range: dmEntry.range ?? 'Unknown',
        components: dmEntry.components ?? '',
        duration: dmEntry.duration ?? 'Unknown',
        concentration: dmEntry.concentration ?? false,
        ritual: dmEntry.ritual ?? false,
        description: prose.description,
        ...(prose.higherLevel !== undefined ? { higherLevel: prose.higherLevel } : {}),
        classes: dmEntry.classes ?? [],
      };
      output.set(key, dmOnlyEntry);
    }
  }

  // Warn about 5etools spells with no Dear-Mercy description
  let unmatched5etools = 0;
  for (const [key, spell] of fivetoolsMap) {
    if (!dearMercyMatched.has(key)) {
      if (verbose) {
        process.stderr.write(
          `[WARN] 5etools-only spell "${spell.name}" has no matching Dear-Mercy entry.\n`
        );
      }
      unmatched5etools++;
    }
  }

  if (unmatched5etools > 0) {
    process.stderr.write(
      `[INFO] ${unmatched5etools} 5etools spells had no matching Dear-Mercy entry (description kept from 5etools where available).\n`
    );
  }

  return Array.from(output.values()).sort((a, b) => {
    // Sort by level, then alphabetically by name
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
  const [fivetoolsMap, dearMercyEntries] = await Promise.all([
    fetch5etoolsSpells(),
    fetchDearMercySpells(),
  ]);

  // 2. Merge
  console.log('\nMerging data sources...');
  const spells = mergeSpells(fivetoolsMap, dearMercyEntries, verbose);

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
