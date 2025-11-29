#!/usr/bin/env python3
"""
Vocabulary Analysis Tool for Curricula-Opus

Analyzes vocabulary overlap and statistics across curriculum modules.

Usage:
    python scripts/vocab-analysis.py <curriculum> [level]

Examples:
    python scripts/vocab-analysis.py l2-uk-en          # All levels
    python scripts/vocab-analysis.py l2-uk-en a1       # Just A1
    python scripts/vocab-analysis.py l2-uk-en a2       # Just A2
"""

import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


def extract_vocabulary(filepath: str) -> list[tuple[str, int]]:
    """Extract vocabulary words from a module file."""
    words = []

    # Extract module number from filename
    match = re.search(r'module-(\d+)\.md$', filepath)
    if not match:
        return words
    module_num = int(match.group(1))

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find vocabulary section
    vocab_match = re.search(
        r'# Vocabulary\n\n\|.*?\n\|[-\|]+\n(.*?)(?=\n---|\n#|\Z)',
        content,
        re.DOTALL
    )

    if not vocab_match:
        return words

    vocab_section = vocab_match.group(1)
    for line in vocab_section.strip().split('\n'):
        if line.startswith('|'):
            parts = line.split('|')
            if len(parts) >= 2:
                word = parts[1].strip()
                # Check if word contains Cyrillic characters (for Ukrainian)
                # or other non-ASCII for other languages
                if word and re.search(r'[^\x00-\x7F]', word):
                    words.append((word, module_num))

    return words


def get_level_from_module(module_num: int) -> str:
    """Determine CEFR level from module number."""
    if module_num <= 30:
        return 'A1'
    elif module_num <= 60:
        return 'A2'
    elif module_num <= 90:
        return 'B1'
    elif module_num <= 120:
        return 'B2'
    elif module_num <= 150:
        return 'C1'
    else:
        return 'C2'


def analyze_vocabulary(curriculum_path: str, target_level: str = None):
    """Analyze vocabulary for a curriculum."""

    modules_path = Path(curriculum_path) / 'modules'

    if not modules_path.exists():
        print(f"Error: Modules path not found: {modules_path}")
        sys.exit(1)

    # Collect all vocabulary
    all_vocab = []
    module_counts = defaultdict(int)
    level_vocab = defaultdict(list)

    module_files = sorted(modules_path.glob('module-*.md'))

    if not module_files:
        print(f"Error: No module files found in {modules_path}")
        sys.exit(1)

    for filepath in module_files:
        words = extract_vocabulary(str(filepath))
        for word, module_num in words:
            level = get_level_from_module(module_num)

            # Filter by target level if specified
            if target_level and level.lower() != target_level.lower():
                continue

            all_vocab.append((word, module_num, level))
            module_counts[module_num] += 1
            level_vocab[level].append((word, module_num))

    if not all_vocab:
        print(f"No vocabulary found" + (f" for level {target_level.upper()}" if target_level else ""))
        sys.exit(1)

    # Analysis
    word_counter = Counter([w[0] for w in all_vocab])
    duplicates = {w: c for w, c in word_counter.items() if c > 1}

    # Print results
    print("=" * 70)
    print("VOCABULARY ANALYSIS REPORT")
    print("=" * 70)
    print(f"\nCurriculum: {curriculum_path}")
    if target_level:
        print(f"Level: {target_level.upper()}")
    print()

    # Summary
    print("-" * 70)
    print("SUMMARY")
    print("-" * 70)
    print(f"  Total vocabulary entries:     {len(all_vocab)}")
    print(f"  Unique vocabulary words:      {len(word_counter)}")
    print(f"  Duplicate entries:            {len(all_vocab) - len(word_counter)}")
    print(f"  Words in multiple modules:    {len(duplicates)}")
    print()

    # Expected targets by level
    targets = {'A1': 250, 'A2': 500, 'B1': 750, 'B2': 1000, 'C1': 1250}

    if target_level:
        target = targets.get(target_level.upper(), 250)
        status = "✓ MEETS TARGET" if len(word_counter) >= target else "✗ BELOW TARGET"
        print(f"  Target for {target_level.upper()}:             {target}+ words")
        print(f"  Status:                       {status}")
    else:
        # Show by level
        print("  By Level:")
        for level in sorted(level_vocab.keys()):
            level_words = set(w[0] for w in level_vocab[level])
            target = targets.get(level, 250)
            status = "✓" if len(level_words) >= target else "✗"
            print(f"    {level}: {len(level_words)} unique words (target: {target}+) {status}")
    print()

    # Words per module
    print("-" * 70)
    print("WORDS PER MODULE")
    print("-" * 70)
    for module in sorted(module_counts.keys()):
        level = get_level_from_module(module)
        if target_level and level.lower() != target_level.lower():
            continue
        print(f"  Module {module:02d} ({level}): {module_counts[module]} words")
    print()

    # Duplicate analysis
    print("-" * 70)
    print("DUPLICATE ANALYSIS")
    print("-" * 70)

    if not duplicates:
        print("  No duplicates found!")
    else:
        # Categorize common pedagogical duplicates
        categories = {
            'Question words': ['що', 'хто', 'де', 'куди', 'коли', 'чому', 'як', 'скільки', 'чий', 'який'],
            'Family words': ['мама', 'тато', 'брат', 'сестра', 'батько', 'мати', 'дитина', 'син', 'дочка'],
            'Core verbs': ['бути', 'мати', 'хотіти', 'могти', 'знати', 'робити', 'йти', 'їсти', 'пити'],
            'Pronouns': ['я', 'ти', 'він', 'вона', 'воно', 'ми', 'ви', 'вони', 'мій', 'твій', 'його', 'її', 'наш', 'ваш', 'це'],
        }

        categorized = set()

        for category, words in categories.items():
            found = [w for w in words if w in duplicates]
            if found:
                print(f"\n  {category} (likely intentional):")
                for w in found:
                    modules = [m for word, m, _ in all_vocab if word == w]
                    print(f"    {w}: {duplicates[w]}x (modules {modules})")
                    categorized.add(w)

        # Other duplicates
        other = [w for w in duplicates if w not in categorized]
        if other:
            print(f"\n  Other duplicates ({len(other)} words - review recommended):")
            for w in sorted(other):
                modules = [m for word, m, _ in all_vocab if word == w]
                print(f"    {w}: {duplicates[w]}x (modules {modules})")

    print()
    print("=" * 70)
    print("END OF REPORT")
    print("=" * 70)

    # Return stats for programmatic use
    return {
        'total_entries': len(all_vocab),
        'unique_words': len(word_counter),
        'duplicates': len(duplicates),
        'duplicate_entries': len(all_vocab) - len(word_counter),
        'by_module': dict(module_counts),
        'duplicate_words': duplicates
    }


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    curriculum = sys.argv[1]
    level = sys.argv[2] if len(sys.argv) > 2 else None

    # Build curriculum path
    curriculum_path = Path('curriculum') / curriculum

    if not curriculum_path.exists():
        # Try direct path
        curriculum_path = Path(curriculum)

    if not curriculum_path.exists():
        print(f"Error: Curriculum not found: {curriculum}")
        print(f"Tried: curriculum/{curriculum} and {curriculum}")
        sys.exit(1)

    analyze_vocabulary(str(curriculum_path), level)


if __name__ == '__main__':
    main()
