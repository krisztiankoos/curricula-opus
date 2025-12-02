/**
 * vocab-split.ts
 *
 * Splits module vocabulary sections into "New" and "Review" based on
 * first appearance in the vocabulary database.
 *
 * Usage:
 *   npx ts-node scripts/vocab-split.ts [curriculum] [moduleNum]
 *
 * Examples:
 *   npx ts-node scripts/vocab-split.ts l2-uk-en        # Process all modules
 *   npx ts-node scripts/vocab-split.ts l2-uk-en 82    # Process single module
 *
 * This script:
 * 1. Loads vocabulary.csv to know first appearances
 * 2. For each module, checks which words are new vs review
 * 3. Splits # Vocabulary into # Vocabulary (new) and # Review Vocabulary
 */

import * as fs from 'fs';
import * as path from 'path';
import { getVocabDatabase, getLevelFromModule, VocabDatabase } from './lib/vocab-db';

// =============================================================================
// Types
// =============================================================================

interface VocabRow {
  raw: string;           // Original markdown row
  lemma: string;         // First column (word)
  firstModule: number;   // From database
  isNew: boolean;        // true if first appears in current module
}

interface SplitResult {
  moduleNum: number;
  totalWords: number;
  newWords: number;
  reviewWords: number;
  modified: boolean;
}

// =============================================================================
// Configuration
// =============================================================================

const CURRICULUM_DIR = path.join(__dirname, '..', 'curriculum');
const DEFAULT_CURRICULUM = 'l2-uk-en';

// =============================================================================
// Vocabulary Section Parsing
// =============================================================================

/**
 * Extract vocabulary section from module content
 */
function extractVocabSection(content: string): {
  before: string;
  vocabHeader: string;
  vocabTable: string;
  after: string;
} | null {
  // Pattern to match vocabulary section
  const pattern = /([\s\S]*?)(# (?:Vocabulary|Словник)[^\n]*\n)([\s\S]*?)(?=\n---\n|\n# (?:Letter Groups|Підсумок|Summary|Review|Вправи|Activities)|\n# Review Vocabulary|$)/i;
  const match = content.match(pattern);

  if (!match) {
    return null;
  }

  const before = match[1];
  const vocabHeader = match[2];
  const vocabTableAndRest = match[3];

  // Find the table
  const tablePattern = /(\|[^\n]+\|\n\|[-|\s]+\|\n[\s\S]*?)(?=\n\n|\n---|\n#|$)/;
  const tableMatch = vocabTableAndRest.match(tablePattern);

  if (!tableMatch) {
    return null;
  }

  const vocabTable = tableMatch[1];
  const afterTable = vocabTableAndRest.slice(tableMatch.index! + tableMatch[0].length);

  // Find what comes after the vocab section
  const afterStart = content.indexOf(vocabTable) + vocabTable.length;
  const after = content.slice(afterStart);

  return {
    before,
    vocabHeader,
    vocabTable,
    after,
  };
}

/**
 * Parse vocabulary table rows
 */
function parseVocabRows(table: string, moduleNum: number, db: VocabDatabase): VocabRow[] {
  const lines = table.trim().split('\n');
  const rows: VocabRow[] = [];

  // Skip header row and separator
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('|')) continue;

    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 2) continue;

    const lemma = cells[0].replace(/\*\*/g, '').trim();
    const firstModule = db.getFirstModule(lemma);

    rows.push({
      raw: line,
      lemma,
      firstModule: firstModule ?? moduleNum, // If not in DB, treat as new
      isNew: firstModule === undefined || firstModule === moduleNum,
    });
  }

  return rows;
}

/**
 * Get table header from vocab table
 */
function getTableHeader(table: string): string {
  const lines = table.trim().split('\n');
  if (lines.length >= 2) {
    return lines[0] + '\n' + lines[1];
  }
  return '| Word | IPA | English | Notes |\n|------|-----|---------|-------|';
}

/**
 * Build new vocabulary section with split tables
 */
function buildSplitVocabSection(
  vocabHeader: string,
  tableHeader: string,
  newRows: VocabRow[],
  reviewRows: VocabRow[]
): string {
  let result = vocabHeader + '\n';

  // New words table
  if (newRows.length > 0) {
    result += tableHeader + '\n';
    result += newRows.map(r => r.raw).join('\n') + '\n';
  } else {
    result += '*No new vocabulary in this module.*\n';
  }

  // Review section (if any)
  if (reviewRows.length > 0) {
    result += '\n---\n\n';
    result += '# Review Vocabulary\n\n';
    result += '| Word | First Module |\n';
    result += '|------|-------------|\n';
    for (const row of reviewRows) {
      result += `| ${row.lemma} | ${row.firstModule} |\n`;
    }
  }

  return result;
}

// =============================================================================
// Module Processing
// =============================================================================

/**
 * Process a single module - split vocab into new/review
 */
function processModule(
  modulePath: string,
  moduleNum: number,
  db: VocabDatabase,
  dryRun: boolean = false
): SplitResult {
  const content = fs.readFileSync(modulePath, 'utf-8');
  const result: SplitResult = {
    moduleNum,
    totalWords: 0,
    newWords: 0,
    reviewWords: 0,
    modified: false,
  };

  // Check if already has Review Vocabulary section
  if (content.includes('# Review Vocabulary')) {
    console.log(`  Module ${moduleNum}: Already has Review section, skipping`);
    return result;
  }

  // Extract vocabulary section
  const sections = extractVocabSection(content);
  if (!sections) {
    console.log(`  Module ${moduleNum}: No vocabulary section found`);
    return result;
  }

  // Parse vocab rows
  const rows = parseVocabRows(sections.vocabTable, moduleNum, db);
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

  if (reviewRows.length === 0) {
    console.log(`  Module ${moduleNum}: All ${newRows.length} words are new, no changes needed`);
    return result;
  }

  // Build new content
  const tableHeader = getTableHeader(sections.vocabTable);
  const newVocabSection = buildSplitVocabSection(
    sections.vocabHeader,
    tableHeader,
    newRows,
    reviewRows
  );

  // Reconstruct full content
  const newContent = sections.before + newVocabSection + sections.after;

  console.log(`  Module ${moduleNum}: ${newRows.length} new, ${reviewRows.length} review`);

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
  dryRun: boolean = false
): SplitResult[] {
  const modulesDir = path.join(curriculumPath, 'modules');
  const results: SplitResult[] = [];

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
    const result = processModule(modulePath, moduleNum, db, dryRun);
    results.push(result);
  }

  return results;
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const curriculum = args[0] || DEFAULT_CURRICULUM;
  const moduleNum = args[1] ? parseInt(args[1]) : null;
  const dryRun = args.includes('--dry-run');

  const curriculumPath = path.join(CURRICULUM_DIR, curriculum);

  if (!fs.existsSync(curriculumPath)) {
    console.error(`Curriculum not found: ${curriculumPath}`);
    process.exit(1);
  }

  console.log(`\n=== Vocabulary Split Tool ===\n`);
  console.log(`Curriculum: ${curriculum}`);
  if (moduleNum) {
    console.log(`Module: ${moduleNum}`);
  } else {
    console.log(`Mode: All modules`);
  }
  if (dryRun) {
    console.log(`[DRY RUN MODE - no files will be modified]\n`);
  }
  console.log();

  // Load vocabulary database
  const db = getVocabDatabase(curriculumPath);

  let results: SplitResult[];

  if (moduleNum) {
    // Process single module
    const modulePath = path.join(curriculumPath, 'modules', `module-${moduleNum}.md`);
    if (!fs.existsSync(modulePath)) {
      console.error(`Module not found: ${modulePath}`);
      process.exit(1);
    }
    results = [processModule(modulePath, moduleNum, db, dryRun)];
  } else {
    // Process all modules
    results = processAllModules(curriculumPath, db, dryRun);
  }

  // Summary
  console.log('\n--- Summary ---\n');
  const modified = results.filter(r => r.modified).length;
  const withReview = results.filter(r => r.reviewWords > 0).length;
  const totalNew = results.reduce((sum, r) => sum + r.newWords, 0);
  const totalReview = results.reduce((sum, r) => sum + r.reviewWords, 0);

  console.log(`Modules processed: ${results.length}`);
  console.log(`Modules modified: ${modified}`);
  console.log(`Modules with review words: ${withReview}`);
  console.log(`Total new words: ${totalNew}`);
  console.log(`Total review words: ${totalReview}`);

  console.log('\n=== Done ===\n');
}

main();
