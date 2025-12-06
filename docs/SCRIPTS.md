# Scripts & Workflow Reference

This document describes all scripts and the recommended workflow for module creation, review, and enrichment.

---

## Module Review Workflow

The primary workflow for reviewing and enriching modules:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. AUDIT       │ ──▶ │  2. REVIEW      │ ──▶ │  3. REGENERATE  │
│  module-audit   │     │  claude-review  │     │  vocab + output │
│  --fix          │     │  prompt.md      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Step 1: Run Audit

```bash
# Audit a range of modules
npx ts-node scripts/module-audit.ts l2-uk-en 31-60

# With fix prompts (copy-paste to Claude)
npx ts-node scripts/module-audit.ts l2-uk-en 31-60 --fix
```

### Step 2: Review in Claude

Use the **claude-review-prompt.md** prompts to fix issues:

```
Review module [X] against the guidelines. Check activities, vocabulary,
engagement boxes, and narrative richness. Fix any issues.
```

Or for specific fixes:
```
Module [X] only has [N] activities. Add [missing types] to reach the
minimum of [required] activities with [items] items each.
```

See `docs/l2-uk-en/claude-review-prompt.md` for all prompts.

### Step 3: Regenerate

After editing modules:

```bash
# Rebuild vocabulary database
npm run vocab:rebuild

# Regenerate output
npm run generate l2-uk-en [module_number]
```

### Step 4: Verify

```bash
# Re-run audit to confirm fixes
npx ts-node scripts/module-audit.ts l2-uk-en [module_number]
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/l2-uk-en/claude-review-prompt.md` | **Review prompts for Claude** - Use these to fix audit issues |
| `docs/l2-uk-en/MODULE-RICHNESS-GUIDELINES-v2.md` | Quality standards by level (consolidated) |
| `docs/MARKDOWN-FORMAT.md` | Markdown syntax specification |

---

## Scripts Quick Reference

| Script | Purpose | Command |
|--------|---------|---------|
| `generate.ts` | Generate HTML + JSON output | `npm run generate` |
| `module-audit.ts` | Find issues in modules | `npx ts-node scripts/module-audit.ts` |
| `vocab-init.ts` | Create fresh vocabulary DB | `npm run vocab:init` |
| `vocab-scan.ts` | Populate DB from modules | `npm run vocab:scan` |
| `vocab-enrich.ts` | Enrich module vocab sections | `npm run vocab:enrich` |
| `vocab-audit.ts` | Find unknown/premature words | `npx ts-node scripts/vocab-audit.ts` |
| `enrich-activities.ts` | Generate activity scaffolds | `npx ts-node scripts/enrich-activities.ts` |
| `generate-exercises.ts` | Generate exercise templates | `npx ts-node scripts/generate-exercises.ts` |
| `test-html.ts` | Validate HTML output | `npm run test:html` |
| `test-json-compat.ts` | Compare JSON output | `npx ts-node scripts/test-json-compat.ts` |

---

## Core Scripts

### generate.ts

**Purpose:** Main generator that converts markdown modules to HTML (book-style) and JSON (Vibe import).

**Usage:**
```bash
npm run generate                    # Generate all modules
npm run generate l2-uk-en           # Generate specific language pair
npm run generate l2-uk-en 168       # Generate single module
```

**Input:** `curriculum/{lang}/modules/module-*.md`

**Output:**
- `output/html/{lang}/{level}/module-XX.html`
- `output/json/{lang}/{level}/module-XX.json`

---

### module-audit.ts

**Purpose:** Comprehensive module quality checker. Validates against MODULE-RICHNESS-GUIDELINES-v2.md requirements.

**Checks:**
- Frontmatter validity (level, title, tags)
- Required sections present
- Activity count and diversity
- Vocabulary section format
- Sentence complexity
- Ukrainian/English ratio (immersion level)
- Vocabulary duplicates (cascade detection)

**Usage:**
```bash
npx ts-node scripts/module-audit.ts l2-uk-en           # Audit all modules
npx ts-node scripts/module-audit.ts l2-uk-en 41-65     # Audit range
npx ts-node scripts/module-audit.ts l2-uk-en 47        # Audit single module
npx ts-node scripts/module-audit.ts l2-uk-en 81-90 --fix  # Generate fix prompts
```

**Options:**
- `--fix` - Generate actionable fix prompts for Claude

**Issue Categories:**
- **Error (Must Fix):** broken-format, broken-activity, vocab-duplicate
- **Warning (Should Fix):** requirements, missing-content, checkpoint, enrichment, narrative, immersion
- **Info (Consider):** activity-order, complexity

---

## Vocabulary Pipeline

The vocabulary system uses SQLite (`vocabulary.db`) to track all words across modules.

### Workflow Order

```
1. vocab-init    →  Create empty database
2. vocab-scan    →  Populate from module markdown
3. vocab-enrich  →  Fill in missing IPA, POS, etc.
4. vocab-audit   →  Find problems
```

### vocab-init.ts

**Purpose:** Initialize a fresh SQLite vocabulary database with proper schema.

```bash
npm run vocab:init                  # Create database
npm run vocab:init:force            # Force recreate (deletes existing)
```

**Creates:** `curriculum/{lang}/vocabulary.db`

### vocab-scan.ts

**Purpose:** Scans all module markdown files and populates the SQLite database.

```bash
npm run vocab:scan                  # Scan all modules
npx ts-node scripts/vocab-scan.ts l2-uk-en 82    # Scan single module
```

### vocab-enrich.ts

**Purpose:** Enriches module markdown vocabulary sections from the database.

```bash
npm run vocab:enrich                # Enrich all modules
npm run vocab:enrich:dry            # Preview changes (no write)
npx ts-node scripts/vocab-enrich.ts l2-uk-en 82  # Single module
```

### vocab-audit.ts

**Purpose:** Scans Ukrainian text in modules and checks against vocabulary database.

```bash
npx ts-node scripts/vocab-audit.ts l2-uk-en 81     # Audit single module
npx ts-node scripts/vocab-audit.ts l2-uk-en 81-100 # Audit range
npx ts-node scripts/vocab-audit.ts l2-uk-en        # Audit all modules
```

---

## Activity Scripts

### enrich-activities.ts

**Purpose:** Uses vocabulary database to generate activity scaffolds with proper vocabulary data.

```bash
npx ts-node scripts/enrich-activities.ts l2-uk-en 1-100
```

**Level Configuration:**
| Level | Activities | Items/Activity | Refresher % | Complexity |
|-------|------------|----------------|-------------|------------|
| A1 | 6 | 10 | 10% | simple |
| A2 | 6 | 12 | 15% | medium |
| A2+ | 7 | 12 | 20% | medium |
| B1/B1+ | 8 | 12 | 25% | complex |
| B2/B2+ | 8 | 12 | 30% | advanced |

### generate-exercises.ts

**Purpose:** Generates additional activity templates based on vocabulary and grammar patterns.

```bash
npx ts-node scripts/generate-exercises.ts              # All modules
npx ts-node scripts/generate-exercises.ts 1-80         # Pre-B1 only
npx ts-node scripts/generate-exercises.ts 5            # Single module
```

**Activity Types:**
- **Type A (Easy):** match-up, true-false, group-sort
- **Type B (Medium):** fill-in, quiz
- **Type C (Hard):** unjumble, transform

---

## Test Scripts

### test-html.ts

**Purpose:** Automated validation of generated HTML and JSON output.

```bash
npm run test:html
```

### test-json-compat.ts

**Purpose:** Compares JSON output to ensure we don't break Vibe imports.

```bash
npx ts-node scripts/test-json-compat.ts [moduleNum]
```

---

## NPM Scripts Summary

```bash
# Generation
npm run generate              # Generate all HTML + JSON
npm run generate:all          # Same as above

# Vocabulary Database
npm run vocab:init            # Create fresh database
npm run vocab:init:force      # Force recreate database
npm run vocab:scan            # Populate from modules
npm run vocab:enrich          # Enrich module vocab sections
npm run vocab:enrich:dry      # Preview enrichment changes
npm run vocab:rebuild         # Full rebuild (init:force + scan)

# Testing
npm run test                  # Run HTML tests
npm run test:html             # Same as above
```

---

## Common Workflows

### Review Module Range

```bash
# 1. Audit with fix prompts
npx ts-node scripts/module-audit.ts l2-uk-en 31-60 --fix

# 2. Copy fix prompts to Claude, edit modules

# 3. Rebuild vocab and regenerate
npm run vocab:rebuild
npm run generate l2-uk-en

# 4. Verify fixes
npx ts-node scripts/module-audit.ts l2-uk-en 31-60
```

### New Module Creation

1. **Write content** - lesson, grammar, examples
2. **Add activities** - fill-in, unjumble, quiz, match-up
3. **Add vocabulary section**
4. **Scan vocabulary:** `npm run vocab:scan`
5. **Enrich vocabulary:** `npm run vocab:enrich l2-uk-en [module]`
6. **Generate output:** `npm run generate l2-uk-en [module]`
7. **Audit:** `npx ts-node scripts/module-audit.ts l2-uk-en [module]`

### Fix Vocabulary Duplicates

```bash
# 1. Audit identifies duplicates
npx ts-node scripts/module-audit.ts l2-uk-en 31-60

# 2. Remove duplicates from later modules (per audit output)

# 3. Rebuild database
npm run vocab:rebuild

# 4. Re-audit to verify
npx ts-node scripts/module-audit.ts l2-uk-en 31-60
```

---

## Library Structure

```
scripts/lib/
├── index.ts              # Main exports
├── types.ts              # TypeScript types (Level, ModuleType, etc.)
├── vocab-db.ts           # CSV vocabulary (legacy)
├── vocab-sqlite.ts       # SQLite vocabulary helpers
├── utils/
│   ├── index.ts          # Utility exports
│   ├── files.ts          # File operations
│   └── markdown.ts       # Markdown parsing helpers
├── parsers/
│   ├── index.ts          # Parser exports
│   ├── frontmatter.ts    # YAML frontmatter parsing
│   ├── sections.ts       # Section parsing
│   ├── vocabulary.ts     # Vocabulary table parsing
│   └── activities/       # Activity type parsers
│       ├── index.ts
│       ├── base.ts       # Base activity interface
│       ├── fill-blank.ts
│       ├── gap-fill.ts
│       ├── group-sort.ts
│       ├── match-up.ts
│       ├── order.ts
│       ├── quiz.ts
│       ├── select.ts
│       ├── translate.ts
│       ├── true-false.ts
│       └── unjumble.ts
└── renderers/
    ├── index.ts          # Renderer exports
    ├── json.ts           # Vibe JSON renderer
    └── html/
        ├── index.ts      # HTML renderer
        └── template.ts   # HTML template
```
