# Claude Extensions

This directory contains Claude Code extensions (skills, commands) that are version-controlled and deployable.

## Directory Structure

```
claude_extensions/
├── skills/                    # AI-invoked skills
│   ├── prompt-engineering/    # Prompt optimization skill
│   │   ├── SKILL.md           # Main skill definition
│   │   └── templates.md       # Reference templates
│   ├── module-architect/      # Module review/fix/create skill
│   │   └── SKILL.md
│   ├── grammar-check/         # Grammar validation skill
│   │   └── SKILL.md
│   └── vocab-enrichment/      # Vocabulary enrichment skill
│       └── SKILL.md
└── commands/                  # User-invoked slash commands
    └── module.md              # Module review/fix/create command
```

## Deployment

Extensions are developed here and deployed to `.claude/` (which is gitignored).

### Deploy all extensions:
```bash
npm run claude:deploy
```

### Manual deployment:
```bash
# Copy skills and commands to local .claude directory
cp -r claude_extensions/skills/* .claude/skills/
cp -r claude_extensions/commands/* .claude/commands/
```

## Available Skills

### prompt-engineering
Optimize AI-facing documentation using Anthropic's best practices.

**Triggers:** CLAUDE.md, AI context files, review prompts, LLM documentation

**Use cases:**
- Creating or reviewing `CLAUDE.md`
- Writing review prompts for AI assistants
- Optimizing documentation for AI consumption
- Improving instruction clarity and specificity

### module-architect
Review, fix, or create language curriculum modules with CEFR-aligned grammar constraints.

**Triggers:** Editing files in `curriculum/` directories, discussing module content

**Use cases:**
- Reviewing modules for grammar violations
- Fixing constraint violations in existing modules
- Creating new modules from templates
- Validating activities and vocabulary

### grammar-check
Check target language text for grammar correctness based on CEFR level.

**Triggers:** Reviewing sentences, examples, or activities in curriculum content

**Use cases:**
- Validating Ukrainian text against level constraints
- Checking morphology and syntax correctness
- Identifying level-inappropriate grammar

### vocab-enrichment
Enrich vocabulary sections with pronunciation, POS, and usage notes.

**Triggers:** Working on vocabulary tables, word lists, or enrichment tasks

**Use cases:**
- Adding IPA pronunciation to word lists
- Completing vocabulary table columns
- Running batch vocab enrichment scripts

## Available Commands

### /module
Review, fix, or create Ukrainian curriculum modules.

**Usage:**
```
/module review [MODULE_NUMBER] [LEVEL]
/module fix [MODULE_NUMBER] [LEVEL]
/module create [MODULE_NUMBER] [LEVEL] [TITLE]
```

**Examples:**
```
/module review 11 A1
/module fix 15 A1
/module create 31 A2 "The Dative I"
```

Uses the comprehensive prompt at `docs/l2-uk-en/module-prompt.md` which contains all grammar constraints A1-C2 inline.

---

## Creating New Skills

1. Create directory: `claude_extensions/skills/your-skill-name/`
2. Create `SKILL.md` with frontmatter:
   ```yaml
   ---
   name: your-skill-name
   description: What it does AND when to use it
   allowed-tools: Read, Glob, Edit  # optional
   ---
   ```
3. Add content and optional reference files
4. Deploy with `npm run claude:deploy`
5. Test: Ask Claude "What Skills are available?"

## Creating New Commands

1. Create file: `claude_extensions/commands/your-command.md`
2. Add description and instructions in markdown
3. Use `$ARGUMENTS` to receive user input
4. Deploy with `npm run claude:deploy`
5. Use: `/your-command [args]`

## Notes

- `.claude/` is gitignored (local only)
- `claude_extensions/` is version controlled (shared)
- Skills are auto-invoked by Claude when relevant
- Commands are invoked by user with `/command-name`
- Restart Claude Code after deploying new extensions
