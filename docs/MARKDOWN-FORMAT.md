# Universal Markdown Format Specification

## Purpose

This document defines the standard markdown format for all curriculum modules. The format is designed to be:
- **Unambiguous**: Every pattern has exactly one meaning
- **Complete**: Covers all content types needed for language learning
- **Simple**: Easy to parse and render

---

## Content Types

### 1. Regular Content (Always Visible)

Regular markdown text, headers, lists, tables, etc.

```markdown
# Section Title

Regular paragraph text.

- List item
- Another item

| Column 1 | Column 2 |
|----------|----------|
| data     | data     |
```

### 2. Linguistic Transformations (Always Visible)

Use `→` arrow for showing how words/forms change. This is ALWAYS visible content.

```markdown
- їсти → їв (infinitive to past)
- я → мені (nominative to dative)

| Base | Changed | Rule |
|------|---------|------|
| к    | ч       | before е |
| г    | ж       | before у |
```

### 3. Answers (Hidden by Default)

Use `> [!answer]` callout for exercise answers that should be hidden.

```markdown
1. Він ___ (читати) книгу.
   > [!answer] читає

2. Translate: "I am reading"
   > [!answer] Я читаю
```

### 4. Explanations (Hidden with Answer)

Use `> [!explanation]` for explanations shown with the answer.

```markdown
1. Why is this правда or міф?
   > [!answer] Правда
   > [!explanation] Because Ukrainian has 7 cases, not 6.
```

### 5. Alternative Answers

Use `> [!alt]` for acceptable alternative answers.

```markdown
1. How do you say "hello"?
   > [!answer] Привіт
   > [!alt] Вітаю
   > [!alt] Добрий день
```

### 6. Notes and Tips (Always Visible)

Use `> [!note]` or `> [!tip]` for highlighted information.

```markdown
> [!note] Remember: soft sign ь doesn't have its own sound.

> [!tip] Practice this pattern daily for best results.
```

---

## Migration Rules

### OLD → NEW Conversions

| Old Pattern | New Pattern | Context |
|-------------|-------------|---------|
| `   → **answer**` | `> [!answer] **answer**` | Indented arrow = answer |
| `   - → **answer**` | `> [!answer] **answer**` | List arrow = answer |
| `question → answer` in exercise | `question` + `> [!answer] answer` | Split inline answers |
| `→ answer (explanation)` | `> [!answer] answer` + `> [!explanation] explanation` | Parenthetical = explanation |
| `→ ✅ **Правда.** text` | `> [!answer] Правда` + `> [!explanation] text` | True/false answers |
| `→ ❌ **Міф.** text` | `> [!answer] Міф` + `> [!explanation] text` | True/false answers |
| `word → word` in text/table | Keep as-is | Transformations stay visible |

### Preserved Patterns (No Change)

- `→` in tables (transformation examples)
- `→` in regular text explaining grammar
- `→` in section headers
- Already converted `> [!answer]` blocks

---

## Exercise Structures

### Fill-in-the-blank

```markdown
## Вправа: Fill in the blanks

1. Я ___ (читати) книгу.
   > [!answer] читаю

2. Вони ___ (писати) листи.
   > [!answer] пишуть
   > [!explanation] писати → пиш- stem change
```

### Multiple Choice

```markdown
## Вправа: Choose the correct answer

1. Which case is used for direct objects?
   - [ ] Nominative
   - [x] Accusative
   - [ ] Dative
```

### Translation

```markdown
## Вправа: Translate

1. I love Ukraine.
   > [!answer] Я люблю Україну.

2. She reads a book.
   > [!answer] Вона читає книгу.
   > [!alt] Вона читає книжку.
```

### True/False

```markdown
## Правда чи міф?

1. Ukrainian has 7 grammatical cases.
   > [!answer] Правда
   > [!explanation] Ukrainian has 7 cases: nominative, genitive, dative, accusative, instrumental, locative, and vocative.

2. All Ukrainian nouns have gender.
   > [!answer] Правда
```

---

## Activity Section Format

All activities appear under `# Activities` using pure markdown syntax (NOT YAML).

### Quiz Format

```markdown
## quiz: Title

> Instructions for this activity.

1. Question text here?
   - [ ] Wrong answer
   - [x] Correct answer
   - [ ] Wrong answer
   - [ ] Wrong answer
   > Explanation shown after answering.

2. Another question?
   - [x] Correct answer
   - [ ] Wrong answer
   - [ ] Wrong answer
   - [ ] Wrong answer
   > Explanation text.
```

**Key points:**
- Use `- [x]` for correct answer, `- [ ]` for wrong answers
- Use `>` for explanation (optional)
- Minimum 12 questions per quiz

### Match-up Format

```markdown
## match-up: Title

> Match the Ukrainian words with their English meanings.

| Left | Right |
|------|-------|
| привіт | hello |
| дякую | thank you |
| так | yes |
| ні | no |
```

**Key points:**
- Use markdown table with `| Left | Right |` headers exactly
- Minimum 12 pairs

### Fill-in Format

```markdown
## fill-in: Title

> Complete each sentence with the correct word.

1. Я ___ книгу. (читати)
   > [!answer] читаю
   > [!options] читаю | читаєш | читає | читають

2. Вона ___ українською. (говорити)
   > [!answer] говорить
   > [!options] говорить | говорю | говоримо | говорять
```

**Key points:**
- Use `___` for blank
- Use `> [!answer]` for correct answer
- Use `> [!options]` with pipe-separated options
- Minimum 12 items

### True-False Format

```markdown
## true-false: Title

> Decide if each statement is true (Правда) or false (Міф).

- [x] Ukrainian has 7 grammatical cases.
  > Correct! Nominative, Genitive, Dative, Accusative, Instrumental, Locative, Vocative.

- [ ] All Ukrainian nouns are masculine.
  > Incorrect! Ukrainian has three genders: masculine, feminine, and neuter.

- [x] Verb endings show who is doing the action.
  > Correct! That's why pronouns are often optional.
```

**Key points:**
- Use `- [x]` for true statements, `- [ ]` for false statements
- Use `>` for explanation
- Minimum 12 statements

### Group-sort Format

```markdown
## group-sort: Title

> Sort these items into the correct categories.

### Category 1
- item1
- item2
- item3

### Category 2
- item4
- item5
- item6

### Category 3
- item7
- item8
- item9
```

**Key points:**
- Use `### Category Name` for each group
- Use bullet list for items in that group
- Minimum 2 categories, 3+ items each

### Anagram Format (A1 Only - Phased Out)

**LEVEL RESTRICTIONS:**
- A1 Modules 01-10: ✅ Allowed (Cyrillic scaffolding)
- A1 Modules 11-20: ⚠️ Reduce usage
- A1 Modules 21-30: ❌ Avoid (use unjumble instead)
- A2+: ❌ NOT ALLOWED

```markdown
## anagram: Title

> Arrange the letters to form the correct word.

1. ч и т а т и
   > [!answer] читати
   > (to read)

2. п и с а т и
   > [!answer] писати
   > (to write)
```

**Key points:**
- Spaced letters for scrambled word
- `> [!answer]` for correct word
- `> (translation)` for meaning
- Minimum 12 items
- **Use `unjumble` instead for A1.3+ and all higher levels**

### Unjumble Format

```markdown
## unjumble: Title

> Put the words in the correct order.

1. книгу читаю Я
   > [!answer] Я читаю книгу.
   > (I read a book.) [3 words]

2. українською Вона говорить
   > [!answer] Вона говорить українською.
   > (She speaks Ukrainian.) [3 words]
```

**Key points:**
- Jumbled words on first line
- `> [!answer]` for correct sentence
- `> (translation) [X words]` for meaning and word count
- Minimum 12 items

---

## IMPORTANT: DO NOT USE YAML FORMAT

**WRONG** (will not parse):
```yaml
## match-up: Title
pairs:
  - left: "привіт"
    right: "hello"

## quiz: Title
questions:
  - prompt: "Question?"
    options: ["a", "b", "c"]
    answer: 0
```

**CORRECT** (use markdown):
```markdown
## match-up: Title

| Left | Right |
|------|-------|
| привіт | hello |

## quiz: Title

1. Question?
   - [x] Correct
   - [ ] Wrong
```

---

## Section Structure

Standard module sections:

```markdown
---
title: Title
subtitle: Subtitle
phase: A1.1
duration: 45
transliteration: full
tags: [grammar]
objectives:
  - Objective 1
grammar:
  - Grammar point 1
---

# Lesson Content

## warm-up
Introduction content...

## presentation
Teaching content with → for transformations...

## practice
Exercises with > [!answer] for answers...

## production
Open-ended practice...

---

# Activities

## quiz: Title
[Using markdown format - see Activity Section Format above]

## match-up: Title
[Using markdown table format]

## fill-in: Title
[Using markdown format with > [!answer] and > [!options]]

---

# Vocabulary

| Word | IPA | English | POS | Gender | Note |
|------|-----|---------|-----|--------|------|
| слово | /ˈslɔvɔ/ | word | noun | n | |

---

# Summary

> Summary content...
```

---

## Vocabulary Section Formats

The vocabulary section format varies by level to support immersion progression. The parser (`scripts/lib/parsers/vocabulary.ts`) supports all formats dynamically.

### Tier 1: A1 (Modules 1-30) — Maximum Scaffolding

```markdown
# Vocabulary

| Word | IPA | English | POS | Gender | Note |
|------|-----|---------|-----|--------|------|
| слово | /ˈslɔvɔ/ | word | noun | n | Usage context |
| говорити | /ɦɔvɔˈrɪtɪ/ | to speak | verb | - | говорю, говориш |
| великий | /vɛˈlɪkɪj/ | big, large | adj | m | agrees with noun |
```

**Requirements:**
- English header `# Vocabulary`
- 6 columns: Word, IPA, English, POS, Gender, Note
- Full IPA pronunciation for every word
- Explicit POS: noun, verb, adj, adv, prep, conj, pron, phrase, interj
- Gender for nouns: m, f, n, pl (use `-` for non-nouns)
- Notes for conjugation hints, usage, cognates

### Tier 2: A2-A2+ (Modules 31-80) — Intermediate Support

Same 6-column format as Tier 1:

```markdown
# Vocabulary

| Word | IPA | English | POS | Gender | Note |
|------|-----|---------|-----|--------|------|
| подорож | /ˈpɔdɔrɔʒ/ | journey, trip | noun | f | feminine! |
| затримка | /zɑˈtrɪmkɑ/ | delay | noun | f | |
```

**Requirements:**
- Same structure as Tier 1
- English header maintained
- Continue IPA for new vocabulary
- Shorter notes (learners more independent)

### Tier 3: B1 (Modules 81-160) — Transitional

```markdown
# Словник

| Слово | Вимова | Переклад | ЧМ | Примітка |
|-------|--------|----------|-----|----------|
| заперечення | /zɑpɛˈrɛt͡ʃɛnʲːɑ/ | negation | ім | grammar term |
| відмова | /wʲidˈmovɑ/ | refusal | ім | f |
```

**Requirements:**
- Ukrainian header `# Словник`
- Ukrainian column names
- 5 columns: Слово, Вимова (IPA), Переклад, ЧМ (частина мови), Примітка
- POS abbreviations: ім (noun), дієсл (verb), прикм (adj), присл (adv), прийм (prep)
- No separate gender column (include in Примітка if needed)

### Tier 4: B2+ (Modules 161+) — Immersive

```markdown
# Словник

| Слово | Переклад | Примітки |
|-------|----------|----------|
| публіцистика | journalism | стиль ЗМІ |
| коаліція | coalition | політика |
```

**Requirements:**
- Ukrainian header `# Словник`
- Minimal 3-column format
- Only essential info for maximum immersion
- Extended notes for context, collocations, register

### Review Vocabulary Section (B1+ only)

For modules 81+, include cross-references to recurring words:

```markdown
# Review Vocabulary

| Word | First Module |
|------|-------------|
| ніколи | 7 |
| заборонено | 59 |
```

**Purpose:** Track words from earlier modules that appear in current module's activities.

### POS Values Reference

| Level | Language | Accepted Values |
|-------|----------|-----------------|
| A1-A2+ | English | noun, verb, adj, adv, prep, conj, pron, phrase, interj |
| B1 | Ukrainian abbrev | ім, дієсл, прикм, присл, прийм, сполучн, займ, фраза |
| B2+ | (optional) | іменник, дієслово, прикметник, or omit |

### Word Count Targets by Module Type

| Module Type | New Words | Description |
|-------------|-----------|-------------|
| G-Module (Grammar) | 15-20 | Grammar-focused |
| V-Module (Vocabulary) | 35-45 | Vocabulary-focused |
| F-Module (Function) | 20-30 | Real-world practice |
| R-Module (Review) | 0-10 | Assessment/checkpoint |

---

## Validation Rules

1. `→` in answers = ERROR (should use `> [!answer]`)
2. `> [!answer]` without preceding question = WARNING
3. Unclosed callout blocks = ERROR
4. Mixed old/new formats = ERROR
