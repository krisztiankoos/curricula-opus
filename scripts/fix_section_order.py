#!/usr/bin/env python3
"""
Fix section order in curriculum modules.

Reorders end sections to canonical order:
  Summary → Activities → Self-Assessment → External → Vocabulary

Usage:
    python scripts/fix_section_order.py [level] [--dry-run]

Examples:
    python scripts/fix_section_order.py           # Fix all levels
    python scripts/fix_section_order.py a1        # Fix A1 only
    python scripts/fix_section_order.py a1 --dry-run  # Preview changes
"""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.audit.checks.section_order import (
    check_section_order,
    fix_section_order,
    get_section_order_summary,
)


def fix_level(level: str, dry_run: bool = False) -> tuple[int, int]:
    """Fix section order for all modules in a level."""
    curriculum_dir = Path('curriculum/l2-uk-en') / level

    if not curriculum_dir.exists():
        print(f"  Level {level} not found")
        return 0, 0

    fixed_count = 0
    total_count = 0

    for md_file in sorted(curriculum_dir.glob('*.md')):
        # Skip gemini review files
        if 'gemini' in str(md_file):
            continue

        total_count += 1
        content = md_file.read_text(encoding='utf-8')

        # Check current order
        issues = check_section_order(content)

        if not issues:
            continue

        # Fix the order
        fixed_content, changes = fix_section_order(content)

        if not changes:
            continue

        fixed_count += 1

        if dry_run:
            summary_before = get_section_order_summary(content)
            summary_after = get_section_order_summary(fixed_content)
            print(f"  {md_file.name}:")
            print(f"    Before: {summary_before['end_section_order']}")
            print(f"    After:  {summary_after['end_section_order']}")
        else:
            md_file.write_text(fixed_content, encoding='utf-8')
            print(f"  ✅ Fixed {md_file.name}")

    return fixed_count, total_count


def main():
    args = sys.argv[1:]

    dry_run = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']

    target_level = args[0].lower() if args else None

    print("🔧 Section Order Fixer")
    print(f"   Canonical order: Summary → Activities → Self-Assessment → External → Vocabulary")
    if dry_run:
        print("   Mode: DRY RUN (no changes will be made)")
    print()

    levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']
    total_fixed = 0
    total_checked = 0

    for level in levels:
        if target_level and level != target_level:
            continue

        print(f"📁 Level {level.upper()}")
        fixed, checked = fix_level(level, dry_run)
        total_fixed += fixed
        total_checked += checked

        if fixed == 0:
            print(f"  All {checked} modules OK")
        print()

    print(f"{'=' * 50}")
    if dry_run:
        print(f"Would fix {total_fixed} of {total_checked} modules")
    else:
        print(f"Fixed {total_fixed} of {total_checked} modules")


if __name__ == '__main__':
    main()
