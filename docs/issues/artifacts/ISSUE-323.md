---
id: ISSUE-323
title: "A2 Right Sidebar Incorrectly Generated - H1 Heading Misuse"
type: bug
status: OPEN
priority: HIGH
assignee: unassigned
created: 2025-12-17
labels:
  - a2
  - audit
  - docusaurus
  - heading-structure
---

# Issue Summary

A2 modules use H1 (`#`) for section headings like `Warm-up`, `Presentation`, `Practice` instead of H2 (`##`). This causes Docusaurus's "On this page" sidebar (Table of Contents) to have an incorrect structure because Docusaurus TOC displays H2-H3 headings by default.

## Evidence

**A2 (BROKEN):**
- 28+ modules use `# Warm-up` instead of `## Warm-up`
- 32+ modules use `# Presentation` instead of `## Presentation`

**A1 (CORRECT):**
- All modules use `## Warm-up` and `## Presentation` correctly

## Root Cause

The heading hierarchy is:
- H1: Page title only (e.g., `# The Cyrillic Code I`)
- H2: Major sections (`## Warm-up`, `## Presentation`, `## Summary`)
- H3: Subsections within major sections

A2 modules incorrectly promote section headings to H1, breaking the hierarchy.

## Impact

- Docusaurus TOC only shows H2-H3 by default
- Section headings at H1 level are treated as page titles
- Right sidebar structure is misleading

## Acceptance Criteria

- [ ] Add heading-level validation check to `markdown_format.py`
- [ ] Check flags H1 usage for reserved section words: `Warm-up`, `Presentation`, `Practice`, `Cultural`, `Summary`, `Activities`
- [ ] Add check to MDX/HTML validation pipeline
- [ ] All A2 modules fixed to use H2 for section headings
- [ ] Verify A1 remains correct (double-check)

## Fix Required

Replace `# Warm-up` → `## Warm-up` (and similar) in all affected modules.

This can be done via automated script:
```bash
# Example sed command (NOT approved yet - needs validation)
# sed -i '' 's/^# Warm-up$/## Warm-up/' docusaurus/docs/a2/*.mdx
```

## Affected Files

`/docusaurus/docs/a2/module-*.mdx` (57 modules to check)

## Notes

This also affects the source markdown files in `/curriculum/l2-uk-en/a2/` which need to be reviewed before regenerating MDX.
