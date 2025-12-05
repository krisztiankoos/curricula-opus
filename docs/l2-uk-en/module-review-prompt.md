# Ukrainian Curriculum Module Review Prompt (DEPRECATED)

> **DEPRECATED:** This prompt has been superseded by `module-prompt.md`
>
> The new comprehensive prompt includes:
> - All grammar constraints for A1-C2 inline (no cross-referencing needed)
> - Module creation templates
> - Fix/rewrite guidance
> - Complete examples
>
> **Use:** `docs/l2-uk-en/module-prompt.md` instead.

---

# Original Content (for reference only)

**You are the Lead Curriculum Architect.** Review Ukrainian language modules against the authoritative curriculum plans.

---

## Authoritative Sources

**All grammar, vocabulary, and scope rules are defined in:**
- `docs/l2-uk-en/A1-CURRICULUM-PLAN.md` (Modules 1-30)
- `docs/l2-uk-en/A2-CURRICULUM-PLAN.md` (Modules 31-60)
- `docs/l2-uk-en/A2+-CURRICULUM-PLAN.md` (Modules 61-80)
- etc.

**Grammar constraints are based on:**
- Ukrainian State Standard 2024 (see Appendix in each curriculum plan)

---

## The Review Checklist

For each module, verify against the curriculum plan:

### 1. Grammar Scope (CRITICAL)
- [ ] Check module's allowed grammar in curriculum plan
- [ ] Verify NO grammar features from later modules appear
- [ ] See "Appendix: Grammar Constraints" in curriculum plan for exact A1/A2 rules

### 2. Vocabulary
- [ ] Count matches plan target (±10%)
- [ ] All planned words present
- [ ] No thematic drift (words from other topics)
- [ ] No synonym bloat (one word per concept at A1)
- [ ] Example/activity nouns exist in vocabulary table or prior modules

### 3. Activities
- [ ] Minimum count met (8 for A1, 10 for A2+, 12 for B1+)
- [ ] At least 4 different types
- [ ] All words used are in scope

### 4. Immersion Level
- [ ] Ukrainian/English ratio matches level (A1=30%, A2=40%, B1=60%, etc.)

### 5. Coming Next
- [ ] Vocabulary terms match next module's plan exactly

---

## A1 Special Rules (State Standard 2024)

These are the most common issues. For full details, see curriculum plan appendix.

| Topic | Rule | Reference |
|-------|------|-----------|
| Cases | Only Nom, Acc (M11+), Loc (M13+), Gen (M16+), Voc | §4.2.3 |
| Adjectives | Only from M26+ | §4.2.1.2 |
| свій | NOT at A1 (reflexive possessive) | §4.2.2 |
| Imperatives | As phrase chunks only, not conjugatable verbs | §4.2.4.2 |
| Aspect | Avoid perfective, use imperfective default | §4.2.4.1 |
| Case notation | Don't show "+ genitive" before M16 | — |

---

## Reporting Format

```markdown
# Module [XX] Review

## Scope Check
| Item | Status | Notes |
|------|--------|-------|
| Grammar | ✅/❌ | [issues] |
| Vocabulary | ✅/❌ | [count], [issues] |
| Activities | ✅/❌ | [count], [issues] |
| Immersion | ✅/❌ | [ratio] |

## Violations Found
1. **[Type]**: `word` - [issue description]
   - Fix: [solution]

## Summary
- Violations: [X]
- Severity: High/Medium/Low
```

---

## Quick Reference: What's Allowed

See curriculum plan for full details. Summary:

| Modules | Cases | Key Restrictions |
|---------|-------|------------------|
| 01-10 | Nom only | No verbs (M06+), no cases |
| 11-12 | +Acc | No adjectives, no свій |
| 13-15 | +Loc | No adjectives, no genitive |
| 16-20 | +Gen | No adjectives |
| 21-25 | All A1 | +Past/Future, no adjectives |
| 26-30 | All A1 | **Adjectives allowed** |
