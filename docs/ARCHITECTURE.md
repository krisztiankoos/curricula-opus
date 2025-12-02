# Curricula-Opus Architecture

## Overview

Curricula-Opus (CO) is a content factory that generates Ukrainian language learning materials from Markdown source files.

```
┌─────────────────────────────────────────────────────────────────┐
│                     SOURCE (Markdown)                           │
│                                                                 │
│   curriculum/l2-uk-en/modules/module-*.md                       │
│   - Frontmatter (YAML metadata)                                 │
│   - Lesson content (sections)                                   │
│   - Activities (## quiz:, ## match-up:, etc.)                   │
│   - Vocabulary tables                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GENERATOR                                    │
│                                                                 │
│   scripts/generate.ts                                           │
│   scripts/lib/                                                  │
│   ├── parsers/      → Parse markdown into structured data       │
│   ├── renderers/    → Generate HTML and JSON output             │
│   └── utils/        → Markdown conversion, file handling        │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     HTML OUTPUT         │     │     JSON OUTPUT         │
│     (Book-style)        │     │     (For Vibe)          │
│                         │     │                         │
│ output/html/l2-uk-en/   │     │ output/json/l2-uk-en/   │
│ - Readable lessons      │     │ - moduleType            │
│ - Nav tabs              │     │ - immersionLevel        │
│ - Vocab tables          │     │ - sections (raw md)     │
│ - Interactive quizzes   │     │ - rawMarkdown           │
└─────────────────────────┘     └───────────┬─────────────┘
                                            │
                                            ▼
                                ┌─────────────────────────┐
                                │     VIBE APP            │
                                │                         │
                                │ - Extracts activities   │
                                │ - Creates flash cards   │
                                │ - Interactive workbook  │
                                └─────────────────────────┘
```

## Directory Structure

```
curricula-opus/
├── curriculum/                    # SOURCE OF TRUTH
│   └── l2-uk-en/
│       ├── modules/               # 190 module markdown files
│       │   ├── module-01.md       # A1: The Cyrillic Code I
│       │   ├── module-168.md      # B2: History: Kyivan Rus II
│       │   └── ...
│       ├── vocabulary.csv         # Master vocabulary database
│       └── *-CURRICULUM-PLAN.md   # Level planning docs
│
├── scripts/                       # GENERATOR CODE
│   ├── generate.ts                # Main entry point
│   ├── lib/
│   │   ├── parsers/               # Markdown parsing
│   │   │   ├── frontmatter.ts     # YAML frontmatter
│   │   │   ├── sections.ts        # Section extraction
│   │   │   ├── vocabulary.ts      # Vocab table parsing
│   │   │   └── activities/        # Activity parsers
│   │   │       ├── quiz.ts
│   │   │       ├── match-up.ts
│   │   │       └── ...
│   │   ├── renderers/
│   │   │   ├── html/              # HTML generation
│   │   │   │   ├── index.ts       # Main renderer
│   │   │   │   └── template.ts    # HTML template
│   │   │   └── json.ts            # JSON generation
│   │   ├── utils/
│   │   │   └── markdown.ts        # MD→HTML conversion
│   │   └── types.ts               # TypeScript types
│   └── assets/
│       ├── styles/                # CSS files
│       └── scripts/               # JS for interactivity
│
├── output/                        # GENERATED OUTPUT
│   ├── html/l2-uk-en/             # Web-viewable lessons
│   │   ├── a1/module-01.html
│   │   └── ...
│   └── json/l2-uk-en/             # Vibe import data
│       ├── a1/module-01.json
│       └── ...
│
└── docs/                          # DOCUMENTATION
    ├── ARCHITECTURE.md            # This file
    ├── MARKDOWN-FORMAT.md         # Markdown syntax spec
    └── VIBE-IMPORT-INSTRUCTIONS.md
```

## Module Types

| Type | Tags | Description | Levels |
|------|------|-------------|--------|
| `grammar` | grammar, cases, verbs, aspect | Grammar-focused lessons | A1-B1 |
| `vocabulary` | vocabulary, vocab | Word-building lessons | A1-B2 |
| `checkpoint` | review, checkpoint, assessment | Progress assessment | All |
| `history` | history | Ukrainian history narratives | B2+ |
| `biography` | biography | Famous Ukrainians | B2+ |
| `idioms` | idioms, phraseology | Idiomatic expressions | B2 |
| `literature` | literature, poetry, prose | Text analysis | C1 |
| `skills` | skills, academic, writing | Academic skills | C1 |
| `culture` | culture, regions, music | Cultural content | B2+ |
| `functional` | functional, dialogue, role-play | Practical communication | A2-B1 |

## JSON Output Schema (v2)

```json
{
  "$schema": "../../../schemas/vibe-module.schema.json",
  "lesson": {
    "id": "lesson-uk-B2-168",
    "moduleId": "mod-uk-B2-168",
    "languagePair": "l2-uk-en",
    "moduleNumber": 168,
    "moduleType": "history",
    "immersionLevel": 0.85,
    "title": "History: Kyivan Rus II",
    "titleUk": "Київська Русь II: Золота доба",
    "level": "B2",
    "phase": "B2.2",
    "objectives": ["..."],
    "tags": ["history", "kyivan-rus", "culture"],
    "totalDuration": 50,
    "transliterationMode": "none",
    "sections": [
      {
        "id": "section-intro",
        "name": "Вступ",
        "nameEn": "Introduction",
        "type": "intro",
        "content": "raw markdown content..."
      }
    ],
    "rawMarkdown": "full source markdown...",
    "version": 2
  },
  "activities": [...],
  "vocabulary": {...}
}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `moduleType` | enum | Inferred from tags (grammar, history, etc.) |
| `immersionLevel` | float | 0.0-1.0, percentage of Ukrainian content |
| `sections` | array | Sections with raw markdown content |
| `rawMarkdown` | string | Full source markdown for reference |

### Immersion Levels by CEFR

| Level | Immersion | English % | Ukrainian % |
|-------|-----------|-----------|-------------|
| A1 | 0.30 | 70% | 30% |
| A2 | 0.40 | 60% | 40% |
| A2+ | 0.50 | 50% | 50% |
| B1 | 0.60 | 40% | 60% |
| B2 | 0.85 | 15% | 85% |
| C1 | 0.95 | 5% | 95% |

## HTML Output

HTML is designed as a **book** - readable content with navigation.

### Structure

```html
<nav>
  [Lesson] [Activities] [Vocab]  <!-- Nav tabs -->
</nav>
<main>
  <section id="lesson">
    <!-- All lesson sections in order -->
    <div class="card section-intro">...</div>
    <div class="card section-content">...</div>
    <div class="card section-practice">...</div>
    <div class="card section-summary">...</div>
  </section>
  <section id="quiz">
    <!-- Interactive quiz -->
  </section>
  <section id="vocab">
    <!-- Vocabulary table -->
    <table class="vocab-table">...</table>
  </section>
</main>
```

### Features

- **Nav tabs**: Jump between Lesson, Activities, Vocab
- **Section cards**: Each markdown section rendered as a card
- **Vocab table**: Styled table with Слово, Вимова, Переклад columns
- **Answer toggles**: `> [!answer]` rendered with Show/Hide buttons
- **Interactive quizzes**: Quiz activities with scoring

## Markdown Format

See `docs/MARKDOWN-FORMAT.md` for the complete spec.

### Key Patterns

```markdown
# Section Headers
## warm-up | Розминка
## presentation | Презентація
## practice | Практика
# Вправи (Activities)
# Словник (Vocabulary)

# Answer Syntax
> [!answer] **відповідь**

# Activity Blocks
## quiz: Title
1. Question?
   - [ ] Wrong
   - [x] Correct
   > Explanation

## match-up: Title
| Left | Right |
|------|-------|
| word | слово |
```

## Generator Usage

```bash
# Generate all modules
npx ts-node scripts/generate.ts

# Generate specific language pair
npx ts-node scripts/generate.ts l2-uk-en

# Generate single module
npx ts-node scripts/generate.ts l2-uk-en 168
```

## Vibe Integration

CO outputs simple JSON. Vibe handles extraction:

| CO Provides | Vibe Extracts |
|-------------|---------------|
| `sections[].content` (raw md) | `> [!answer]` → gap-fill |
| `sections[].content` (raw md) | `## quiz:` → quiz activity |
| `activities[]` (parsed) | Pre-parsed activities |
| `vocabulary.words[]` | Flash card data |
| `rawMarkdown` | Anything else needed |

See `vibe/docs/CO-VIBE-INTEGRATION.md` for the full spec.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2024-12-02 | moduleType, immersionLevel, simplified sections |
| 1.0 | 2024-11-30 | Initial JSON format |
