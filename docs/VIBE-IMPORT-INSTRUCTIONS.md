# Vibe Import Instructions

## JSON Structure Update - December 2024

The JSON output format has been updated. **All modules need to be reimported.**

### What Changed

1. **Answer Format**: Exercise answers now use a unified callout format
   - Old: `→ відповідь` inline syntax
   - New: `> [!answer] відповідь` callout syntax in markdown
   - JSON: Answers are now properly structured, not embedded in text

2. **Section Structure**: Cleaner parsing of Ukrainian section headers
   - `# Вступ` (Introduction)
   - `# Практика` (Practice)
   - `# Пояснення` (Explanation)
   - All sections now captured correctly

3. **Activity Types**: Structured activity data for:
   - `quiz` - Multiple choice questions
   - `match` - Matching pairs
   - `sort` - Categorization exercises
   - `fill-blank` - Gap fill exercises
   - `translate` - Translation exercises
   - `true-false` - True/false questions

### How to Import

1. **Location**: `output/json/l2-uk-en/`
   - `a1/module-01.json` through `module-30.json`
   - `a2/module-31.json` through `module-60.json`
   - `a2+/module-61.json` through `module-80.json`
   - `b1/module-81.json` through `module-140.json`
   - `b2/module-141.json` through `module-190.json`

2. **Full reimport required**: The content structure changed, so incremental updates won't work.

### JSON Schema

Each module JSON contains:

```json
{
  "id": "module-01",
  "title": "Module Title",
  "titleUk": "Назва модуля",
  "level": "A1",
  "phase": "1",
  "objectives": ["objective 1", "objective 2"],
  "vocabulary": [
    {
      "uk": "слово",
      "translit": "slovo",
      "en": "word",
      "note": "optional note"
    }
  ],
  "sections": [
    {
      "type": "intro|practice|explanation|production|summary",
      "title": "Section Title",
      "content": "HTML content..."
    }
  ],
  "activities": {
    "quiz": [...],
    "match": {...},
    "sort": {...}
  }
}
```

### Vocabulary Notes

- Transliteration (`translit`) included for A1 modules only
- B1+ modules have Ukrainian titles (`titleUk`)
- Vocabulary always includes English translations regardless of immersion level

### Questions?

Contact the curriculum team if you encounter import issues.
