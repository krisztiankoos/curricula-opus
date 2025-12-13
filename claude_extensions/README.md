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
├── stages/                    # Stage instruction files
│   ├── stage-1-skeleton.md    # Frontmatter + headers + vocabulary
│   ├── stage-2-content.md     # Rich instructional content
│   ├── stage-3-activities.md  # Activities generation
│   └── stage-4-review-fix.md  # Review/fix loop
└── commands/                  # User-invoked slash commands
    ├── module.md              # Module review/fix/create (single-pass)
    ├── module-create.md       # Full 4-stage pipeline
    ├── module-stage-1.md      # Stage 1: Skeleton
    ├── module-stage-2.md      # Stage 2: Content
    ├── module-stage-3.md      # Stage 3: Activities
    └── module-stage-4.md      # Stage 4: Review & fix
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

### /module-create (Recommended)
Create a complete module through the 4-stage pipeline.

**Usage:**
```
/module-create [LEVEL] [MODULE_NUM]
```

**Examples:**
```
/module-create a1 15      # Create A1 module 15
/module-create b2 45      # Create B2 module 45
```

### /module-stage-1..4
Individual stages for manual control.

**Usage:**
```
/module-stage-1 [LEVEL] [MODULE]   # Create skeleton
/module-stage-2 [LEVEL] [MODULE]   # Fill content
/module-stage-3 [LEVEL] [MODULE]   # Add activities
/module-stage-4 [LEVEL] [MODULE]   # Review & fix loop
```

**Examples:**
```
/module-stage-1 a1 15     # Create skeleton with vocabulary
/module-stage-2 a1 15     # Add rich content
/module-stage-3 a1 15     # Generate activities
/module-stage-4 a1 15     # Review and fix until PASS
```

### /module (Legacy)
Single-pass module review/fix/create.

**Usage:**
```
/module review [LEVEL] [MODULE]
/module fix [LEVEL] [MODULE]
/module create [LEVEL] [MODULE] [TITLE]
```

See `docs/STAGED-MODULE-CREATION.md` for detailed documentation on the 4-stage pipeline.

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

## Using with Different Clients

### Terminal (Claude CLI)
```bash
# Start with auto-deploy
./start-claude.sh

# Or manual
npm run claude:deploy
claude
```

Then use slash commands: `/module-create a1 15`

### VSCode (Claude Code Extension)
1. Open this project in VSCode
2. Run `npm run claude:deploy` in terminal
3. Open Claude Code panel (Cmd+Shift+P → "Claude Code")
4. Use slash commands in the chat

### Antigravity
1. Open Antigravity and navigate to this project directory
2. The `.claude/` folder should be detected automatically
3. If not, run `npm run claude:deploy` first
4. Use slash commands in the Antigravity chat

**Tip:** The `start-claude.sh` script auto-deploys on startup. Run it once to ensure `.claude/` is populated.

## Notes

- `.claude/` is gitignored (local only)
- `claude_extensions/` is version controlled (shared)
- Skills are auto-invoked by Claude when relevant
- Commands are invoked by user with `/command-name`
- Restart Claude Code after deploying new extensions
- Run `npm run claude:deploy` after pulling changes
