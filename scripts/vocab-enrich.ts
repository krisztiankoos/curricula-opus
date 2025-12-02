/**
 * vocab-enrich.ts
 *
 * Enriches module markdown vocabulary sections from the SQLite database.
 * Preserves the original MD column format while filling in missing data.
 * Splits vocabulary into new/review sections based on first appearance.
 *
 * Usage:
 *   npx ts-node scripts/vocab-enrich.ts [curriculum] [moduleNum] [--dry-run]
 *
 * Examples:
 *   npx ts-node scripts/vocab-enrich.ts l2-uk-en           # Enrich all modules
 *   npx ts-node scripts/vocab-enrich.ts l2-uk-en 82        # Enrich single module
 *   npx ts-node scripts/vocab-enrich.ts l2-uk-en --dry-run # Preview changes
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  VocabDatabase,
  getVocabDatabase,
  resetVocabDatabase,
  VocabEntry,
  isExpression,
  getLevelFromModule,
} from './lib/vocab-sqlite';

// =============================================================================
// Configuration
// =============================================================================

const CURRICULUM_DIR = path.join(__dirname, '..', 'curriculum');
const DEFAULT_CURRICULUM = 'l2-uk-en';

// =============================================================================
// Types
// =============================================================================

interface TableFormat {
  columns: string[];        // Column headers
  columnCount: number;
  hasIPA: boolean;
  hasPOS: boolean;
  hasGender: boolean;
  hasNotes: boolean;
  hasTranslit: boolean;
}

interface VocabRow {
  uk: string;
  raw: string;              // Original row text
  cells: string[];          // Parsed cells
  entry?: VocabEntry;       // Matched DB entry
  isNew: boolean;           // First appears in this module
}

interface EnrichResult {
  moduleNum: number;
  totalWords: number;
  newWords: number;
  reviewWords: number;
  enrichedFields: number;   // Fields filled in from DB
  modified: boolean;
}

// =============================================================================
// Review Section Handling
// =============================================================================

/**
 * Remove existing Review Vocabulary section and merge words back into main table
 */
function removeReviewSection(content: string): string {
  // Pattern to match Review Vocabulary section (including preceding ---)
  const reviewPattern = /\n---\n\n# Review Vocabulary\n\n\| Word \| First Module \|\n\|[-|]+\|\n((?:\|[^\n]+\|\n?)*)/g;

  // Remove the Review Vocabulary section
  return content.replace(reviewPattern, '');
}

/**
 * Extract review words from existing Review section
 */
function extractReviewWords(content: string): string[] {
  const reviewMatch = content.match(/# Review Vocabulary\n\n\| Word \| First Module \|\n\|[-|]+\|\n((?:\|[^\n]+\|\n?)*)/);
  if (!reviewMatch) return [];

  const tableBody = reviewMatch[1];
  const words: string[] = [];

  for (const line of tableBody.split('\n')) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length >= 1) {
      words.push(cells[0]);
    }
  }

  return words;
}

// =============================================================================
// Table Format Detection
// =============================================================================

/**
 * Detect the column format of a vocabulary table
 */
function detectTableFormat(tableHeader: string): TableFormat {
  const cells = tableHeader.split('|').map(c => c.trim()).filter(c => c);

  const format: TableFormat = {
    columns: cells,
    columnCount: cells.length,
    hasIPA: false,
    hasPOS: false,
    hasGender: false,
    hasNotes: false,
    hasTranslit: false,
  };

  for (const col of cells) {
    const lower = col.toLowerCase();
    if (lower.includes('ipa') || lower.includes('вимова') || lower === '/') {
      format.hasIPA = true;
    }
    if (lower.includes('pos') || lower.includes('part') || lower.includes('частина')) {
      format.hasPOS = true;
    }
    if (lower.includes('gender') || lower.includes('рід')) {
      format.hasGender = true;
    }
    if (lower.includes('note') || lower.includes('примітка') || lower.includes('приклад')) {
      format.hasNotes = true;
    }
    if (lower.includes('translit') || lower.includes('транс')) {
      format.hasTranslit = true;
    }
  }

  return format;
}

// =============================================================================
// Vocabulary Section Parsing
// =============================================================================

/**
 * Extract vocabulary section and parse table format
 */
function extractVocabSection(content: string): {
  before: string;
  vocabHeader: string;
  tableHeader: string;
  tableSeparator: string;
  tableRows: string[];
  after: string;
  format: TableFormat;
} | null {
  // Pattern to match vocabulary section
  const pattern = /([\s\S]*?)(# (?:Vocabulary|Словник)[^\n]*\n)([\s\S]*?)(?=\n---\n|\n# (?:Letter Groups|Підсумок|Summary|Review Vocabulary|Вправи|Activities)|\n# Review Vocabulary|$)/i;
  const match = content.match(pattern);

  if (!match) {
    return null;
  }

  const before = match[1];
  const vocabHeader = match[2];
  const vocabContent = match[3];

  // Find table header and rows
  const tableMatch = vocabContent.match(/(\|[^\n]+\|)\n(\|[-|\s]+\|)\n([\s\S]*?)(?=\n\n|$)/);

  if (!tableMatch) {
    return null;
  }

  const tableHeader = tableMatch[1];
  const tableSeparator = tableMatch[2];
  const tableBody = tableMatch[3];
  const tableRows = tableBody.trim().split('\n').filter(r => r.includes('|'));

  // Find what comes after the vocab section
  const afterStart = content.indexOf(tableMatch[0]) + tableMatch[0].length;
  const after = content.slice(afterStart);

  const format = detectTableFormat(tableHeader);

  return {
    before,
    vocabHeader,
    tableHeader,
    tableSeparator,
    tableRows,
    after,
    format,
  };
}

/**
 * Parse vocab rows and match with DB entries
 */
function parseVocabRows(
  tableRows: string[],
  moduleNum: number,
  format: TableFormat,
  db: VocabDatabase
): VocabRow[] {
  const rows: VocabRow[] = [];

  for (const raw of tableRows) {
    const cells = raw.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 2) continue;

    // First cell is always the word
    const uk = cells[0].replace(/\*\*/g, '').trim();
    if (!uk) continue;

    // Look up in database
    const entry = db.getEntry(uk);
    const isNew = entry ? entry.first_module === moduleNum : true;

    rows.push({
      uk,
      raw,
      cells,
      entry,
      isNew,
    });
  }

  return rows;
}

// =============================================================================
// Row Enrichment
// =============================================================================

/**
 * Enrich a row with data from the database, preserving format
 */
function enrichRow(row: VocabRow, format: TableFormat): { enrichedRow: string; fieldsEnriched: number } {
  if (!row.entry) {
    return { enrichedRow: row.raw, fieldsEnriched: 0 };
  }

  const entry = row.entry;
  let fieldsEnriched = 0;
  const cells = [...row.cells];

  // Map column positions based on format
  if (format.columnCount >= 7 && format.hasTranslit) {
    // 7 columns: Word | Translit | IPA | English | POS | Gender | Note
    if (entry.ipa && (!cells[2] || cells[2] === '-')) {
      cells[2] = entry.ipa;
      fieldsEnriched++;
    }
    if (entry.en && (!cells[3] || cells[3] === '-')) {
      cells[3] = entry.en;
      fieldsEnriched++;
    }
    if (entry.pos && (!cells[4] || cells[4] === '-')) {
      cells[4] = entry.pos;
      fieldsEnriched++;
    }
    if (entry.gender && (!cells[5] || cells[5] === '-')) {
      cells[5] = entry.gender;
      fieldsEnriched++;
    }
  } else if (format.columnCount === 6) {
    // 6 columns: Word | IPA | English | POS | Gender | Note
    if (entry.ipa && (!cells[1] || cells[1] === '-')) {
      cells[1] = entry.ipa;
      fieldsEnriched++;
    }
    if (entry.en && (!cells[2] || cells[2] === '-')) {
      cells[2] = entry.en;
      fieldsEnriched++;
    }
    if (entry.pos && (!cells[3] || cells[3] === '-')) {
      cells[3] = entry.pos;
      fieldsEnriched++;
    }
    if (entry.gender && (!cells[4] || cells[4] === '-')) {
      cells[4] = entry.gender;
      fieldsEnriched++;
    }
  } else if (format.columnCount === 4 && format.hasIPA) {
    // 4 columns: Word | IPA | English | Notes
    if (entry.ipa && (!cells[1] || cells[1] === '-')) {
      cells[1] = entry.ipa;
      fieldsEnriched++;
    }
    if (entry.en && (!cells[2] || cells[2] === '-')) {
      cells[2] = entry.en;
      fieldsEnriched++;
    }
  } else if (format.columnCount === 3) {
    // 3 columns: Word | Translation | Notes
    if (entry.en && (!cells[1] || cells[1] === '-')) {
      cells[1] = entry.en;
      fieldsEnriched++;
    }
  } else if (format.columnCount === 2) {
    // 2 columns: Word | Translation
    if (entry.en && (!cells[1] || cells[1] === '-')) {
      cells[1] = entry.en;
      fieldsEnriched++;
    }
  }

  const enrichedRow = '| ' + cells.join(' | ') + ' |';
  return { enrichedRow, fieldsEnriched };
}

// =============================================================================
// Section Building
// =============================================================================

/**
 * Build the enriched vocabulary section
 */
function buildEnrichedSection(
  vocabHeader: string,
  tableHeader: string,
  tableSeparator: string,
  newRows: VocabRow[],
  reviewRows: VocabRow[],
  format: TableFormat
): { content: string; enrichedFields: number } {
  let content = vocabHeader + '\n';
  let totalEnriched = 0;

  // Build new words table
  if (newRows.length > 0) {
    content += tableHeader + '\n';
    content += tableSeparator + '\n';

    for (const row of newRows) {
      const { enrichedRow, fieldsEnriched } = enrichRow(row, format);
      content += enrichedRow + '\n';
      totalEnriched += fieldsEnriched;
    }
  } else {
    content += '*No new vocabulary in this module.*\n';
  }

  // Build review section if needed
  if (reviewRows.length > 0) {
    content += '\n---\n\n';
    content += '# Review Vocabulary\n\n';
    content += '| Word | First Module |\n';
    content += '|------|-------------|\n';

    for (const row of reviewRows) {
      const firstModule = row.entry?.first_module || '?';
      content += `| ${row.uk} | ${firstModule} |\n`;
    }
  }

  return { content, enrichedFields: totalEnriched };
}

// =============================================================================
// Module Processing
// =============================================================================

/**
 * Process a single module - enrich vocab from DB
 */
function processModule(
  modulePath: string,
  moduleNum: number,
  db: VocabDatabase,
  dryRun: boolean = false,
  force: boolean = false
): EnrichResult {
  let content = fs.readFileSync(modulePath, 'utf-8');
  const result: EnrichResult = {
    moduleNum,
    totalWords: 0,
    newWords: 0,
    reviewWords: 0,
    enrichedFields: 0,
    modified: false,
  };

  // Check if already has Review Vocabulary section
  const hasReviewSection = content.includes('# Review Vocabulary');
  if (hasReviewSection && !force) {
    console.log(`  Module ${moduleNum}: Already has Review section, skipping (use --force to re-process)`);
    return result;
  }

  // If force mode and has Review section, extract review words before removing
  let reviewWordsFromSection: string[] = [];
  if (hasReviewSection && force) {
    reviewWordsFromSection = extractReviewWords(content);
    content = removeReviewSection(content);
  }

  // Extract vocabulary section
  const sections = extractVocabSection(content);
  if (!sections) {
    console.log(`  Module ${moduleNum}: No vocabulary section found`);
    return result;
  }

  // Parse and match rows
  const rows = parseVocabRows(sections.tableRows, moduleNum, sections.format, db);

  // If force mode, add back the review words from the removed Review section
  if (reviewWordsFromSection.length > 0) {
    const existingUkWords = new Set(rows.map(r => r.uk.toLowerCase()));
    for (const uk of reviewWordsFromSection) {
      if (existingUkWords.has(uk.toLowerCase())) continue; // Skip duplicates
      const entry = db.getEntry(uk);
      const isNew = entry ? entry.first_module === moduleNum : false;
      rows.push({
        uk,
        raw: `| ${uk} | - | - | - |`,
        cells: [uk, '-', '-', '-'],
        entry,
        isNew,
      });
    }
  }

  result.totalWords = rows.length;

  if (rows.length === 0) {
    console.log(`  Module ${moduleNum}: Empty vocabulary table`);
    return result;
  }

  // Split into new and review
  const newRows = rows.filter(r => r.isNew);
  const reviewRows = rows.filter(r => !r.isNew);

  result.newWords = newRows.length;
  result.reviewWords = reviewRows.length;

  // Build enriched section
  const { content: newVocabSection, enrichedFields } = buildEnrichedSection(
    sections.vocabHeader,
    sections.tableHeader,
    sections.tableSeparator,
    newRows,
    reviewRows,
    sections.format
  );

  result.enrichedFields = enrichedFields;

  // Check if anything changed
  const originalSection = sections.vocabHeader + '\n' + sections.tableHeader + '\n' + sections.tableSeparator + '\n' + sections.tableRows.join('\n') + '\n';

  if (newVocabSection.trim() === originalSection.trim() && reviewRows.length === 0) {
    console.log(`  Module ${moduleNum}: No changes needed`);
    return result;
  }

  // Reconstruct full content
  const newContent = sections.before + newVocabSection + sections.after;

  const changeDesc = [];
  if (result.newWords < result.totalWords) {
    changeDesc.push(`${result.reviewWords} review`);
  }
  if (enrichedFields > 0) {
    changeDesc.push(`${enrichedFields} fields enriched`);
  }

  console.log(`  Module ${moduleNum}: ${result.newWords} new, ${changeDesc.join(', ')}`);

  if (!dryRun) {
    fs.writeFileSync(modulePath, newContent, 'utf-8');
    result.modified = true;
  } else {
    console.log(`    [DRY RUN] Would modify ${modulePath}`);
  }

  return result;
}

/**
 * Process all modules in a curriculum
 */
function processAllModules(
  curriculumPath: string,
  db: VocabDatabase,
  dryRun: boolean = false,
  force: boolean = false
): EnrichResult[] {
  const modulesDir = path.join(curriculumPath, 'modules');
  const results: EnrichResult[] = [];

  const files = fs.readdirSync(modulesDir)
    .filter(f => f.match(/^module-\d+\.md$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

  for (const file of files) {
    const moduleNum = parseInt(file.match(/\d+/)?.[0] || '0');
    const modulePath = path.join(modulesDir, file);
    const result = processModule(modulePath, moduleNum, db, dryRun, force);
    results.push(result);
  }

  return results;
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const curriculum = args.find(a => !a.startsWith('--') && isNaN(parseInt(a))) || DEFAULT_CURRICULUM;
  const moduleNumArg = args.find(a => !a.startsWith('--') && !isNaN(parseInt(a)));
  const moduleNum = moduleNumArg ? parseInt(moduleNumArg) : null;
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  const curriculumPath = path.join(CURRICULUM_DIR, curriculum);
  const dbPath = path.join(curriculumPath, 'vocabulary.db');

  if (!fs.existsSync(curriculumPath)) {
    console.error(`Curriculum not found: ${curriculumPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    console.error(`Run 'npm run vocab:init' and 'npm run vocab:scan' first.`);
    process.exit(1);
  }

  console.log(`\n=== Vocabulary Enrichment Tool ===\n`);
  console.log(`Curriculum: ${curriculum}`);
  if (moduleNum) {
    console.log(`Module: ${moduleNum}`);
  } else {
    console.log(`Mode: All modules`);
  }
  if (dryRun) {
    console.log(`[DRY RUN MODE - no files will be modified]`);
  }
  if (force) {
    console.log(`[FORCE MODE - re-processing modules with existing Review sections]`);
  }
  console.log();

  // Reset singleton to ensure fresh connection
  resetVocabDatabase();
  const db = getVocabDatabase(curriculumPath);

  let results: EnrichResult[];

  if (moduleNum) {
    const modulePath = path.join(curriculumPath, 'modules', `module-${moduleNum}.md`);
    if (!fs.existsSync(modulePath)) {
      console.error(`Module not found: ${modulePath}`);
      process.exit(1);
    }
    results = [processModule(modulePath, moduleNum, db, dryRun, force)];
  } else {
    results = processAllModules(curriculumPath, db, dryRun, force);
  }

  // Summary
  console.log('\n--- Summary ---\n');
  const modified = results.filter(r => r.modified).length;
  const withReview = results.filter(r => r.reviewWords > 0).length;
  const totalNew = results.reduce((sum, r) => sum + r.newWords, 0);
  const totalReview = results.reduce((sum, r) => sum + r.reviewWords, 0);
  const totalEnriched = results.reduce((sum, r) => sum + r.enrichedFields, 0);

  console.log(`Modules processed: ${results.length}`);
  console.log(`Modules modified: ${modified}`);
  console.log(`Modules with review words: ${withReview}`);
  console.log(`Total new words: ${totalNew}`);
  console.log(`Total review words: ${totalReview}`);
  console.log(`Total fields enriched: ${totalEnriched}`);

  db.close();

  console.log(`\n=== Done ===\n`);
}

main();
