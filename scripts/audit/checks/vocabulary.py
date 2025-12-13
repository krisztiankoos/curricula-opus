"""
Vocabulary-related validation checks.

Validates vocabulary section content and checks for words used
but not defined in the vocabulary table.
"""

import re
import sqlite3
from pathlib import Path
from ..config import COMMON_WORDS

# Level ordering for cumulative vocabulary lookup
LEVEL_ORDER = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}


def get_db_path() -> Path:
    """Get the path to the vocabulary database."""
    return Path(__file__).parent.parent.parent.parent / "curriculum/l2-uk-en/vocabulary.db"


def sync_vocab_to_db(level: str, module_num: int, vocab_items: list[dict], db_path: str = None) -> int:
    """
    Sync vocabulary from a module to the database.

    Called during audit to keep the database in sync with module content.
    Returns the number of new words added.

    Args:
        level: Level code (A1, A2, etc.)
        module_num: Module number within the level
        vocab_items: List of vocabulary items from the module, each with 'uk', 'ipa', 'en' keys
        db_path: Optional path to database
    """
    if db_path is None:
        db_path = get_db_path()

    if not Path(db_path).exists():
        return 0

    added = 0
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        for item in vocab_items:
            uk = item.get('uk', '').strip()
            if not uk:
                continue

            ipa = item.get('ipa', '')
            en = item.get('en', '')
            note = item.get('note', '')

            # Check if it's an expression (multi-word)
            is_expression = ' ' in uk and len(uk.split()) > 1

            if is_expression:
                # Try to insert into expressions table
                cursor.execute("""
                    INSERT OR IGNORE INTO expressions (id, uk, ipa, en, notes, level, first_module)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (f"e-{level}-{module_num}-{uk[:20]}", uk, ipa, en, note, level.upper(), module_num))
            else:
                # Try to insert into lemmas table
                cursor.execute("""
                    INSERT OR IGNORE INTO lemmas (id, uk, ipa, en, notes, level, first_module)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (f"v-{level}-{module_num}-{uk}", uk, ipa, en, note, level.upper(), module_num))

            if cursor.rowcount > 0:
                added += 1

        conn.commit()
        conn.close()
    except Exception as e:
        # Silently fail - don't break audit if DB sync fails
        pass

    return added


def generate_inflections(word: str) -> set[str]:
    """
    Generate common Ukrainian inflected forms from a base word.

    This is a simple heuristic that covers common patterns.
    Not exhaustive, but catches most pedagogical content uses.
    """
    forms = {word}

    # Common noun plural endings
    if word.endswith('а'):
        forms.add(word[:-1] + 'и')  # -а → -и (книга → книги)
        forms.add(word[:-1] + 'у')  # -а → -у (accusative)
        forms.add(word[:-1] + 'ою')  # -а → -ою (instrumental)
        forms.add(word[:-1] + 'і')  # -а → -і (locative)
    elif word.endswith('я'):
        forms.add(word[:-1] + 'і')  # -я → -і (земля → землі)
        forms.add(word[:-1] + 'ю')  # -я → -ю (accusative)
        forms.add(word[:-1] + 'ею')  # -я → -ею (instrumental)
    elif word.endswith('о'):
        forms.add(word[:-1] + 'а')  # -о → -а (вікно → вікна, plural)
        forms.add(word[:-1] + 'і')  # -о → -і (locative)
        forms.add(word[:-1] + 'ом')  # -о → -ом (instrumental)
    elif word.endswith('е'):
        forms.add(word[:-1] + 'я')  # -е → -я (море → моря)
        forms.add(word[:-1] + 'і')  # -е → -і (locative)
        forms.add(word[:-1] + 'ем')  # -е → -ем (instrumental)
    elif not word.endswith(('ь', 'й')):
        # Consonant-ending nouns (masculine)
        forms.add(word + 'а')  # genitive (стіл → стола)
        forms.add(word + 'у')  # dative/locative (стіл → столу)
        forms.add(word + 'ом')  # instrumental (стіл → столом)
        forms.add(word + 'и')  # plural (стіл → столи)
        forms.add(word + 'ів')  # genitive plural
        forms.add(word + 'і')  # locative (стіл → стілі - rare)

        # Handle Ukrainian vowel alternation (і↔о)
        # стіл → столі, пік → покі, etc.
        if 'і' in word:
            alt_stem = word.replace('і', 'о', 1)  # Replace first і with о
            forms.add(alt_stem + 'а')
            forms.add(alt_stem + 'у')
            forms.add(alt_stem + 'ом')
            forms.add(alt_stem + 'и')
            forms.add(alt_stem + 'ів')
            forms.add(alt_stem + 'і')

    # Adjective endings
    if word.endswith('ий'):
        base = word[:-2]
        forms.add(base + 'а')   # feminine
        forms.add(base + 'е')   # neuter
        forms.add(base + 'і')   # plural
        forms.add(base + 'ого')  # genitive
        forms.add(base + 'ому')  # dative

    return forms


def get_cumulative_vocab(level: str, module_num: int, db_path: str = None) -> set[str]:
    """
    Get all vocabulary words introduced up to and including the given module.

    This allows modules to use words from earlier modules without re-declaring them.
    Includes generated inflections to catch common grammatical forms.
    """
    if db_path is None:
        db_path = get_db_path()

    if not Path(db_path).exists():
        return set()

    cumulative = set()
    level_num = LEVEL_ORDER.get(level.upper(), 0)

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get all words from:
        # 1. All modules in earlier levels (A1 < A2 < B1, etc.)
        # 2. All modules in current level up to and including current module
        base_words = set()
        for lvl, lvl_order in LEVEL_ORDER.items():
            if lvl_order < level_num:
                # All modules from earlier levels
                cursor.execute("SELECT uk FROM lemmas WHERE level = ?", (lvl,))
                for row in cursor.fetchall():
                    base_words.add(row[0].lower())
            elif lvl_order == level_num:
                # Current level: only modules up to current
                cursor.execute(
                    "SELECT uk FROM lemmas WHERE level = ? AND first_module <= ?",
                    (lvl, module_num)
                )
                for row in cursor.fetchall():
                    base_words.add(row[0].lower())

        # Add base words and their inflections
        for word in base_words:
            cumulative.update(generate_inflections(word))

        # Also get expressions
        for lvl, lvl_order in LEVEL_ORDER.items():
            if lvl_order < level_num:
                cursor.execute("SELECT uk FROM expressions WHERE level = ?", (lvl,))
                for row in cursor.fetchall():
                    for word in row[0].lower().split():
                        cumulative.add(word)
            elif lvl_order == level_num:
                cursor.execute(
                    "SELECT uk FROM expressions WHERE level = ? AND first_module <= ?",
                    (lvl, module_num)
                )
                for row in cursor.fetchall():
                    for word in row[0].lower().split():
                        cumulative.add(word)

        conn.close()
    except Exception as e:
        # If database access fails, return empty set (fall back to module-only check)
        pass

    return cumulative


def extract_vocab_items(content: str) -> list[dict]:
    """
    Extract vocabulary items with full metadata from the Vocabulary section.

    Returns list of dicts with keys: uk, ipa, en, note
    """
    items = []
    vocab_match = re.search(
        r'#+ (?:Vocabulary|Словник).*?(?=\n#|\Z)',
        content, re.DOTALL | re.IGNORECASE
    )
    if vocab_match:
        vocab_text = vocab_match.group(0)
        for line in vocab_text.split('\n'):
            if line.strip().startswith('|') and '---' not in line:
                parts = [p.strip() for p in line.split('|')]
                # Remove empty parts from split
                parts = [p for p in parts if p]

                if len(parts) >= 3:
                    first_col = parts[0]
                    # Skip header row
                    if first_col.lower() in ('word', 'слово'):
                        continue

                    # Extract Ukrainian word (first column may have formatting)
                    uk_match = re.search(r'[\u0400-\u04ff][\u0400-\u04ff\s\'\-]*', first_col)
                    if not uk_match:
                        continue

                    uk = uk_match.group(0).strip()
                    if len(uk) < 2:
                        continue

                    # Parse other columns based on count
                    # Common formats:
                    # A1: Word | IPA | English | POS | Gender | Note (6 cols)
                    # B2: Слово | Переклад | Примітки (3 cols)
                    ipa = ''
                    en = ''
                    note = ''

                    if len(parts) >= 6:  # Full A1 format
                        ipa = parts[1] if '/' in parts[1] else ''
                        en = parts[2]
                        note = parts[5] if len(parts) > 5 else ''
                    elif len(parts) >= 3:  # Short format
                        ipa = parts[1] if '/' in parts[1] else ''
                        en = parts[2] if '/' not in parts[1] else parts[1]
                        note = parts[-1] if len(parts) > 3 else ''

                    items.append({
                        'uk': uk,
                        'ipa': ipa,
                        'en': en,
                        'note': note
                    })
    return items


def extract_vocab_from_section(content: str) -> set[str]:
    """Extract vocabulary words from the Vocabulary section."""
    vocab_words = set()
    items = extract_vocab_items(content)
    for item in items:
        uk = item['uk'].lower()
        # Add the word and any sub-words (for compound entries)
        for word in re.findall(r'[\u0400-\u04ff]+', uk):
            if len(word) > 1:
                vocab_words.add(word)
    return vocab_words


def check_vocab_violations(
    content: str,
    core_content: str,
    vocab_words: set[str],
    cumulative_vocab: set[str] = None
) -> list[dict]:
    """Check if Ukrainian words in core content are in the vocabulary section.

    Args:
        content: Full module content
        core_content: Core instructional content (excluding activities)
        vocab_words: Words from the current module's vocabulary section
        cumulative_vocab: Words from previous modules (from vocabulary database)
    """
    violations = []
    if not vocab_words:
        return violations

    if cumulative_vocab is None:
        cumulative_vocab = set()

    # Extract all Ukrainian words from core content
    core_words = set(re.findall(r'[\u0400-\u04ff]+', core_content.lower()))

    # Find words not in vocab, not common, and not from previous modules
    unknown_words = core_words - vocab_words - COMMON_WORDS - cumulative_vocab

    # Filter to words that appear multiple times (likely intentional)
    word_counts = {}
    for word in re.findall(r'[\u0400-\u04ff]+', core_content.lower()):
        word_counts[word] = word_counts.get(word, 0) + 1

    significant_unknown = [
        w for w in unknown_words
        if word_counts.get(w, 0) >= 2 and len(w) > 3
    ]

    if significant_unknown[:5]:
        violations.append({
            'type': 'VOCABULARY',
            'issue': f"Words used but not in Vocabulary section: {', '.join(significant_unknown[:5])}",
            'fix': "Add these words to Vocabulary table or replace with known vocabulary."
        })

    return violations


def count_vocab_rows(content: str) -> int:
    """Count vocabulary table rows."""
    vocab_section_match = re.search(
        r'(#+\s+(Vocabulary|Словник).*?)(?=\n#+|$)',
        content, re.DOTALL | re.IGNORECASE
    )
    if vocab_section_match:
        vocab_text = vocab_section_match.group(1)
        lines = vocab_text.split('\n')
        v_rows = len([
            l for l in lines
            if l.strip().startswith('|') and '---' not in l
        ])
        return max(0, v_rows - 1)  # Subtract header
    return 0
