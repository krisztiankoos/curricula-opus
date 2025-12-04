# Claude Extensions

This directory contains Claude Code extensions (skills, commands) that are version-controlled and deployable.

## Directory Structure

```
claude_extensions/
├── skills/                    # AI-invoked skills
│   └── prompt-engineering/    # Prompt optimization skill
│       ├── SKILL.md           # Main skill definition
│       └── templates.md       # Reference templates
└── commands/                  # User-invoked slash commands (future)
```

## Deployment

Extensions are developed here and deployed to `.claude/` (which is gitignored).

### Deploy all extensions:
```bash
npm run claude:deploy
```

### Manual deployment:
```bash
# Copy skills to local .claude directory
cp -r claude_extensions/skills/* .claude/skills/
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

## Notes

- `.claude/` is gitignored (local only)
- `claude_extensions/` is version controlled (shared)
- Skills are auto-invoked by Claude when relevant
- Restart Claude Code after deploying new skills
