/**
 * vocab-build.ts
 *
 * Scans all module markdown files and builds a vocabulary database
 * that tracks the first appearance of each lemma.
 *
 * Usage:
 *   npx ts-node scripts/vocab-build.ts [curriculum]
 *
 * Example:
 *   npx ts-node scripts/vocab-build.ts l2-uk-en
 *
 * Output:
 *   - curriculum/{curriculum}/vocabulary.csv (rebuilt)
 *   - Prints statistics to console
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Types
// =============================================================================

interface VocabEntry {
  lemma: string;
  ipa: string;
  english: string;
  pos: string;
  gender: string;
  module: number;
  level: string;
  note: string;
}

interface ModuleVocab {
  moduleNum: number;
  level: string;
  words: VocabEntry[];
}

// =============================================================================
// Configuration
// =============================================================================

const CURRICULUM_DIR = path.join(__dirname, '..', 'curriculum');
const DEFAULT_CURRICULUM = 'l2-uk-en';

// Level ranges
const LEVEL_RANGES: Record<string, [number, number]> = {
  'A1': [1, 30],
  'A2': [31, 60],
  'A2+': [61, 80],
  'B1': [81, 140],
  'B2': [141, 190],
};

// =============================================================================
// Vocabulary Extraction
// =============================================================================

/**
 * Get CEFR level from module number
 */
function getLevelFromModule(moduleNum: number): string {
  for (const [level, [start, end]] of Object.entries(LEVEL_RANGES)) {
    if (moduleNum >= start && moduleNum <= end) {
      return level;
    }
  }
  return 'C1'; // Default for higher modules
}

/**
 * Parse vocabulary table from markdown content
 * Handles multiple column formats (2-7 columns)
 */
function parseVocabTable(content: string, moduleNum: number): VocabEntry[] {
  const entries: VocabEntry[] = [];
  const level = getLevelFromModule(moduleNum);

  // Find vocabulary section
  const vocabMatch = content.match(
    /# (?:Vocabulary|Словник)[^\n]*\n([\s\S]*?)(?=\n---|\n# (?:Letter Groups|Підсумок|Summary|Review|Вправи|Activities)|$)/i
  );

  if (!vocabMatch) {
    return entries;
  }

  const vocabContent = vocabMatch[1];

  // Find table in vocab content
  const tableMatch = vocabContent.match(/\|[^\n]+\|\n\|[-|\s]+\|\n([\s\S]*?)(?=\n\n|\n---|\n#|$)/);

  if (!tableMatch) {
    return entries;
  }

  const rows = tableMatch[1].trim().split('\n').filter(row => row.trim());

  for (const row of rows) {
    const cells = row.split('|').map(c => c.trim()).filter(c => c);

    if (cells.length < 2) continue;

    const entry = parseVocabRow(cells, moduleNum, level);
    if (entry.lemma) {
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Parse a single vocabulary row into VocabEntry
 */
function parseVocabRow(cells: string[], moduleNum: number, level: string): VocabEntry {
  let lemma = '';
  let ipa = '';
  let english = '';
  let pos = '';
  let gender = '';
  let note = '';

  if (cells.length >= 7) {
    // 7 columns: Word | Translit | IPA | English | POS | Gender | Note
    lemma = cells[0] || '';
    // translit = cells[1]; // Skip transliteration
    ipa = cells[2] || '';
    english = cells[3] || '';
    pos = cells[4] || 'noun';
    gender = normalizeGender(cells[5]);
    note = cells[6] || '';
  } else if (cells.length === 6) {
    // 6 columns: Word | IPA | English | POS | Gender | Note
    lemma = cells[0] || '';
    ipa = cells[1] || '';
    english = cells[2] || '';
    pos = cells[3] || 'noun';
    gender = normalizeGender(cells[4]);
    note = cells[5] || '';
  } else if (cells.length === 5) {
    // 5 columns: Word | IPA | English | POS | Gender
    lemma = cells[0] || '';
    ipa = cells[1] || '';
    english = cells[2] || '';
    pos = cells[3] || 'noun';
    gender = normalizeGender(cells[4]);
  } else if (cells.length === 4) {
    // 4 columns: Word | IPA | English | Notes
    lemma = cells[0] || '';
    ipa = cells[1] || '';
    english = cells[2] || '';
    note = cells[3] || '';
    pos = 'noun';
  } else if (cells.length === 3) {
    // 3 columns: Word | Translation | Notes
    lemma = cells[0] || '';
    english = cells[1] || '';
    note = cells[2] || '';
    pos = 'noun';
  } else if (cells.length === 2) {
    // 2 columns: Word | Translation
    lemma = cells[0] || '';
    english = cells[1] || '';
    pos = 'noun';
  }

  // Clean up values
  lemma = lemma.replace(/\*\*/g, '').trim();
  ipa = (ipa === '-' || ipa === '') ? '' : ipa.trim();
  english = english.replace(/\*\*/g, '').trim();
  pos = normalizePOS(pos);
  note = (note === '-' || note === '') ? '' : note.trim();

  return {
    lemma,
    ipa,
    english,
    pos,
    gender,
    module: moduleNum,
    level,
    note,
  };
}

/**
 * Normalize gender values
 */
function normalizeGender(value: string | undefined): string {
  if (!value || value === '-' || value === '') return '-';
  const v = value.toLowerCase().trim();
  if (v.startsWith('m')) return 'm';
  if (v.startsWith('f')) return 'f';
  if (v.startsWith('n')) return 'n';
  if (v === 'pl' || v === 'plural') return 'pl';
  return '-';
}

/**
 * Normalize POS values
 */
function normalizePOS(value: string): string {
  const v = value.toLowerCase().trim();
  const posMap: Record<string, string> = {
    'noun': 'noun',
    'verb': 'verb',
    'adj': 'adj',
    'adjective': 'adj',
    'adv': 'adv',
    'adverb': 'adv',
    'prep': 'prep',
    'preposition': 'prep',
    'conj': 'conj',
    'conjunction': 'conj',
    'pron': 'pron',
    'pronoun': 'pron',
    'num': 'num',
    'number': 'num',
    'numeral': 'num',
    'phrase': 'phrase',
    'particle': 'particle',
    'part': 'particle',
    'interj': 'interjection',
    'interjection': 'interjection',
  };
  return posMap[v] || 'noun';
}

// =============================================================================
// Module Scanning
// =============================================================================

/**
 * Scan all module files and extract vocabulary
 */
function scanAllModules(curriculumPath: string): ModuleVocab[] {
  const modulesDir = path.join(curriculumPath, 'modules');
  const results: ModuleVocab[] = [];

  // Get all module files
  const files = fs.readdirSync(modulesDir)
    .filter(f => f.match(/^module-\d+\.md$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

  console.log(`Found ${files.length} module files\n`);

  for (const file of files) {
    const moduleNum = parseInt(file.match(/\d+/)?.[0] || '0');
    const filePath = path.join(modulesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const level = getLevelFromModule(moduleNum);

    const words = parseVocabTable(content, moduleNum);

    results.push({
      moduleNum,
      level,
      words,
    });

    if (words.length > 0) {
      console.log(`  Module ${moduleNum.toString().padStart(3)} (${level}): ${words.length} words`);
    }
  }

  return results;
}

// =============================================================================
// First-Appearance Database
// =============================================================================

/**
 * Build first-appearance database from all module vocab
 * For each unique lemma, keep the entry from the lowest module number
 */
function buildFirstAppearanceDb(moduleVocabs: ModuleVocab[]): Map<string, VocabEntry> {
  const db = new Map<string, VocabEntry>();
  const duplicates: Array<{ lemma: string; modules: number[] }> = [];

  // Track which modules each lemma appears in
  const lemmaModules = new Map<string, number[]>();

  for (const mv of moduleVocabs) {
    for (const entry of mv.words) {
      const key = entry.lemma.toLowerCase();

      if (!lemmaModules.has(key)) {
        lemmaModules.set(key, []);
      }
      lemmaModules.get(key)!.push(mv.moduleNum);

      // Keep entry from lowest module number
      if (!db.has(key) || entry.module < db.get(key)!.module) {
        db.set(key, entry);
      }
    }
  }

  // Report duplicates
  console.log('\n--- Duplicate Lemmas (appear in multiple modules) ---\n');
  let dupCount = 0;
  for (const [lemma, modules] of lemmaModules.entries()) {
    if (modules.length > 1) {
      dupCount++;
      const firstModule = Math.min(...modules);
      const otherModules = modules.filter(m => m !== firstModule).sort((a, b) => a - b);
      if (dupCount <= 50) {
        console.log(`  "${lemma}" - first: ${firstModule}, also in: [${otherModules.join(', ')}]`);
      }
    }
  }
  if (dupCount > 50) {
    console.log(`  ... and ${dupCount - 50} more duplicates`);
  }
  console.log(`\nTotal duplicates: ${dupCount}`);

  return db;
}

// =============================================================================
// CSV Generation
// =============================================================================

/**
 * Generate vocabulary.csv from first-appearance database
 */
function generateCsv(db: Map<string, VocabEntry>, outputPath: string): void {
  const entries = Array.from(db.values())
    .sort((a, b) => a.module - b.module || a.lemma.localeCompare(b.lemma, 'uk'));

  const header = 'lemma,ipa,english,pos,gender,module,level,note,image_url';
  const rows = entries.map(e => {
    // Escape CSV fields
    const escape = (s: string) => {
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    return [
      escape(e.lemma),
      escape(e.ipa),
      escape(e.english),
      escape(e.pos),
      escape(e.gender),
      e.module.toString(),
      escape(e.level),
      escape(e.note),
      '', // image_url placeholder
    ].join(',');
  });

  const csv = [header, ...rows].join('\n') + '\n';
  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`\nWrote ${entries.length} entries to ${outputPath}`);
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Print vocabulary statistics
 */
function printStatistics(db: Map<string, VocabEntry>): void {
  const entries = Array.from(db.values());

  // By level
  const byLevel = new Map<string, number>();
  for (const e of entries) {
    byLevel.set(e.level, (byLevel.get(e.level) || 0) + 1);
  }

  console.log('\n--- Vocabulary Statistics ---\n');
  console.log('By Level:');
  let cumulative = 0;
  for (const level of ['A1', 'A2', 'A2+', 'B1', 'B2', 'C1']) {
    const count = byLevel.get(level) || 0;
    cumulative += count;
    console.log(`  ${level}: ${count} words (cumulative: ${cumulative})`);
  }

  // By POS
  const byPOS = new Map<string, number>();
  for (const e of entries) {
    byPOS.set(e.pos, (byPOS.get(e.pos) || 0) + 1);
  }

  console.log('\nBy Part of Speech:');
  for (const [pos, count] of [...byPOS.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pos}: ${count}`);
  }

  console.log(`\nTotal unique lemmas: ${entries.length}`);
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const curriculum = args[0] || DEFAULT_CURRICULUM;
  const curriculumPath = path.join(CURRICULUM_DIR, curriculum);

  if (!fs.existsSync(curriculumPath)) {
    console.error(`Curriculum not found: ${curriculumPath}`);
    process.exit(1);
  }

  console.log(`\n=== Vocabulary Build Tool ===\n`);
  console.log(`Curriculum: ${curriculum}`);
  console.log(`Path: ${curriculumPath}\n`);

  // Step 1: Scan all modules
  console.log('--- Scanning Modules ---\n');
  const moduleVocabs = scanAllModules(curriculumPath);

  // Step 2: Build first-appearance database
  const db = buildFirstAppearanceDb(moduleVocabs);

  // Step 3: Generate CSV
  const csvPath = path.join(curriculumPath, 'vocabulary.csv');
  generateCsv(db, csvPath);

  // Step 4: Print statistics
  printStatistics(db);

  console.log('\n=== Done ===\n');
}

main();
