# Claude Module Review Prompt

Use this prompt to review and enrich curriculum modules. Copy the relevant section for the level you're reviewing.

---

## Quick Review Command

```
Review module [X] against the guidelines. Check activities, vocabulary, engagement boxes, and narrative richness. Fix any issues.
```

---

## Full Review Prompt

```
Review and enrich module [X] following these requirements:

## Level-Specific Requirements

### A1 (Modules 1-30)
- Activities: 6 minimum, 10 items each
- Vocabulary: 15-20 new words per module
- Sentence complexity: Simple SVO (3-6 words)
- Transliteration: Full (modules 1-10), vocab only (11-20), first occurrence (21-30)
- Checkpoints: 10, 20, 30 need named characters + testimonies

### A2 (Modules 31-60)
- Activities: 8 minimum, 10 items each
- Vocabulary: 20-25 new words per module
- Sentence complexity: Compound sentences with connectors (6-8 words)
- Transliteration: None
- Checkpoints: 40, 50, 60

### A2+ (Modules 61-80)
- Activities: 10 minimum, 15 items each
- Vocabulary: 35-40 new words per module
- Sentence complexity: Subordinate clauses begin (8-10 words)
- Checkpoints: 70, 80

### B1 (Modules 81-140)
- Activities: 12 minimum, 20 items each
- Vocabulary: 25-30 new words per module
- Sentence complexity: Complex sentences, conditionals (10-14 words)
- Checkpoints: 100, 120, 140

### B2 (Modules 141-190)
- Activities: 14 minimum, 20 items each
- Vocabulary: 25-30 new words per module
- Sentence complexity: Sophisticated structures, passive (12-16 words)
- Pronunciation guidance required for grammar modules
- Checkpoints: 160, 180, 190

### C1 (Modules 191+)
- Activities: 14 minimum, 20 items each
- Vocabulary: 30-35 new words per module
- Sentence complexity: Advanced academic/literary (14-18 words)
- Pronunciation guidance required

## Activity Priority Order (use in this sequence)
1. quiz - Multiple choice (low cognitive load)
2. match-up - Vocabulary associations
3. group-sort - Categorization
4. true-false - Statement validation
5. select - Word selection
6. order - Sequence building
7. fill-in - Gap completion (high cognitive load)
8. unjumble - Word ordering (highest cognitive load)

## Required Activity Formats

### fill-in
```markdown
## fill-in: Title

> Instructions.

1. Sentence with ___ blank.
   > [!answer] correct answer
   > [!options] opt1 | opt2 | opt3 | opt4
```

### quiz
```markdown
## quiz: Title

> Instructions.

1. Question?
   - [x] Correct
   - [ ] Wrong
   - [ ] Wrong
   > Explanation (optional)
```

### match-up
```markdown
## match-up: Title

> Instructions.

| Left | Right |
|------|-------|
| item1 | match1 |
| item2 | match2 |
```

### unjumble
```markdown
## unjumble: Title

> Instructions.

1. word1 / word2 / word3 / word4
   > [!answer] Correct sentence.
   > (English translation)
```

### true-false
```markdown
## true-false: Title

> Instructions.

- [x] True statement.
- [ ] False statement.
  > Explanation.
```

### group-sort
```markdown
## group-sort: Title

> Instructions.

### Category 1
- item1
- item2

### Category 2
- item3
- item4
```

## Engagement Boxes (1-2 per section minimum)

| Type | Icon | Use for |
|------|------|---------|
| Did You Know? | 💡 | Fascinating facts |
| Myth Buster | 🔍 | Correct misconceptions |
| Pro Tip | ⚡ | Practical advice |
| Culture Corner | 🎭 | Traditions, customs |
| History Bite | 📜 | Historical context |
| Fun Fact | 🎯 | Memorable tidbits |
| Language Link | 🔗 | English connections |
| Real World | 🌍 | Modern relevance |

Format:
```markdown
> 💡 **Did You Know?**
>
> Interesting fact here.
```

## Checkpoint Module Requirements (every 10th module)

Checkpoints MUST have:
1. **Named character** with age, nationality, city (e.g., "Ліам, 26, Irish, Dublin")
2. **Opening narrative** - Character's journal entry or story
3. **Dialogue tables** showing real conversations:
   ```markdown
   | Speaker | Ukrainian | English |
   |---------|-----------|---------|
   | Ліам | Добрий день! | Hello! |
   | Офіціант | Що замовите? | What will you order? |
   ```
4. **Testimonies** from 3-4 other learners (with names, ages, nationalities)
5. **Activities framed** as "Help [Character]..." challenges

## Vocabulary Table Format

```markdown
# Vocabulary

| Word | IPA | English | POS | Gender | Note |
|------|-----|---------|-----|--------|------|
| слово | /ˈslɔwɔ/ | word | noun | n | Gen: слова |
```

## Module Structure

1. YAML frontmatter (module, title, level, phase, tags, objectives, grammar)
2. `# Lesson Content`
   - `## warm-up` - Hook, context
   - `## presentation` - Theory, tables, examples
   - `## practice` - Guided exercises
   - `## production` - Free practice
3. `# Activities` - All activity blocks
4. `# Vocabulary` - Word table
5. `# Summary` - What was learned, what's next

## Review Checklist

- [ ] Correct activity count for level
- [ ] Each activity has required item count
- [ ] Activity types in priority order
- [ ] Engagement boxes in each section
- [ ] Rich narrative (especially checkpoints)
- [ ] Dialogue tables for conversations
- [ ] Vocabulary table complete with IPA
- [ ] No placeholder text
- [ ] Correct answer format (> [!answer], - [x], etc.)

After review, regenerate with: `npx ts-node scripts/generate.ts l2-uk-en [module_number]`
```

---

## Batch Review Command

```
Review modules [X] through [Y] at level [LEVEL]. For each module:
1. Check activity count and item counts
2. Verify engagement boxes exist
3. Check narrative richness (especially checkpoints)
4. Flag any format errors

Report issues in a table:
| Module | Issues | Priority |
|--------|--------|----------|
```

---

## Quick Fix Commands

**Add missing activities:**
```
Module [X] only has [N] activities. Add [missing types] to reach the minimum of [required] activities with [items] items each.
```

**Enrich checkpoint:**
```
Module [X] is a checkpoint but lacks narrative. Add a named character, dialogue tables, and learner testimonies.
```

**Fix activity format:**
```
Module [X] has wrong answer format in [activity type]. Fix to use correct > [!answer] syntax.
```

**Add engagement boxes:**
```
Module [X] is missing engagement boxes. Add 💡/🎭/📜/⚡ boxes to each major section.
```
