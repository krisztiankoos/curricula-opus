"""
Report generation for module audits.

Generates markdown reports and console output for audit results.
"""

import os
from typing import Optional


def generate_report(
    file_path: str,
    phase: str,
    level_code: str,
    pedagogy: str,
    target: int,
    has_critical_failure: bool,
    results: dict,
    table_rows: list[str],
    lint_errors: list[str],
    pedagogical_violations: list[dict],
    recommendation: str,
    reasons: list[str],
    severity: int
) -> str:
    """Generate markdown report content."""
    report_lines = []
    report_lines.append(f"# Audit Report: {os.path.basename(file_path)}")
    report_lines.append(f"**Phase:** {phase} | **Level:** {level_code} | **Pedagogy:** {pedagogy} | **Target:** {target}")
    report_lines.append(f"**Overall Status:** {'❌ FAIL' if has_critical_failure else '✅ PASS'}")
    report_lines.append("")

    if lint_errors:
        report_lines.append("## LINT ERRORS")
        for err in lint_errors:
            report_lines.append(f"- ❌ {err}")
        report_lines.append("")

    if pedagogical_violations:
        report_lines.append("## PEDAGOGICAL VIOLATIONS")
        for v in pedagogical_violations:
            report_lines.append(f"- **[{v['type']}]** {v['issue']}")
            report_lines.append(f"  - FIX: {v['fix']}")
        report_lines.append("")

    if recommendation != 'PASS':
        rec_icon = '🔄' if recommendation == 'REWRITE' else '📝'
        report_lines.append("## Recommendation")
        report_lines.append(f"**{rec_icon} {recommendation}** (severity {severity}/100)")
        report_lines.append("")
        if reasons:
            for reason in reasons:
                report_lines.append(f"- {reason}")
            report_lines.append("")

    report_lines.append("## Gates")
    keys_order = ['words', 'activities', 'density', 'unique_types', 'priority',
                  'engagement', 'audio', 'vocab', 'structure', 'lint', 'pedagogy']
    for k in keys_order:
        r = results.get(k)
        if r:
            if hasattr(r, 'icon'):  # GateResult dataclass
                report_lines.append(f"- **{k.capitalize()}:** {r.icon} {r.msg}")
            else:  # dict
                report_lines.append(f"- **{k.capitalize()}:** {r['icon']} {r['msg']}")

    report_lines.append("")
    report_lines.append("## Section Audit")
    report_lines.append("| Section | Status | Count | Notes |")
    report_lines.append("|---|---|---|---|")
    report_lines.extend(table_rows)

    return "\n".join(report_lines)


def save_report(file_path: str, report_content: str) -> str:
    """
    Save report to gemini/ subdirectory.

    Returns the report file path.
    """
    file_dir = os.path.dirname(os.path.abspath(file_path))
    file_name = os.path.basename(file_path)
    base_name = os.path.splitext(file_name)[0]

    if not file_dir.endswith('gemini'):
        target_dir = os.path.join(file_dir, 'gemini')
    else:
        target_dir = file_dir

    os.makedirs(target_dir, exist_ok=True)
    report_path = os.path.join(target_dir, f"{base_name}-review.md")

    # Preserve manual content if exists
    manual_content = ""
    if os.path.exists(report_path):
        try:
            with open(report_path, 'r', encoding='utf-8') as f:
                existing_report = f.read()
                if "<!-- MANUAL_NOTES -->" in existing_report:
                    parts = existing_report.split("<!-- MANUAL_NOTES -->")
                    if len(parts) > 1:
                        manual_content = "<!-- MANUAL_NOTES -->" + parts[1]
        except Exception:
            pass

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
        if manual_content:
            f.write("\n\n" + manual_content)

    return report_path


def print_gates(results: dict, level_code: str) -> None:
    """Print gate results to console."""
    print(f"\n--- STRICT GATES (Level {level_code}) ---")
    keys_order = ['words', 'activities', 'density', 'unique_types', 'priority',
                  'engagement', 'audio', 'vocab', 'structure', 'lint', 'pedagogy']
    for k in keys_order:
        r = results.get(k)
        if r:
            if hasattr(r, 'icon'):  # GateResult dataclass
                print(f"{k.capitalize():<12} {r.icon} {r.msg}")
            else:  # dict
                print(f"{k.capitalize():<12} {r['icon']} {r['msg']}")

    imm = results.get('immersion')
    if imm:
        if hasattr(imm, 'icon'):
            print(f"Immersion    {imm.icon} {imm.msg}")
        else:
            print(f"Immersion    {imm['icon']} {imm['msg']}")


def print_lint_errors(errors: list[str]) -> None:
    """Print lint errors to console."""
    if errors:
        print("\n❌ LINT ERRORS FOUND:")
        for err in errors:
            print(f"  - {err}")
        print("")


def print_pedagogical_violations(violations: list[dict]) -> None:
    """Print pedagogical violations to console."""
    if violations:
        print("\n📚 PEDAGOGICAL VIOLATIONS FOUND:")
        for v in violations:
            print(f"  [{v['type']}] {v['issue']}")
            print(f"     → FIX: {v['fix']}")
        print("")


def print_recommendation(recommendation: str, reasons: list[str], severity: int) -> None:
    """Print recommendation to console."""
    if recommendation != 'PASS':
        if recommendation == 'REWRITE':
            rec_icon = '🔄'
            rec_color = 'REWRITE FROM SCRATCH'
        else:
            rec_icon = '📝'
            rec_color = 'UPDATE (patch fixes)'

        print(f"\n{rec_icon} RECOMMENDATION: {rec_color} (severity {severity}/100)")
        for reason in reasons:
            print(f"   → {reason}")
        print("")


def print_immersion_fix_hints(
    immersion_score: float,
    min_imm: int,
    max_imm: int,
    level_code: str,
    module_focus: Optional[str] = None
) -> None:
    """Print hints for fixing immersion issues."""
    if immersion_score < min_imm:
        print(f"\n📚 IMMERSION TOO LOW ({immersion_score:.1f}% vs {min_imm}-{max_imm}% target)")
        print(f"   FIX: Convert simple explanations to Ukrainian")
        print(f"   FIX: Add more Ukrainian narratives/dialogues")
        print(f"   FIX: Use Ukrainian for engagement boxes (💡🎬🌍)")
        if level_code in ('B1', 'B2', 'C1', 'C2') or level_code.startswith('B') or level_code.startswith('C'):
            print(f"   FIX: Write grammar rules in Ukrainian (not just examples)")

    elif immersion_score > max_imm:
        print(f"\n📚 IMMERSION TOO HIGH ({immersion_score:.1f}% vs {min_imm}-{max_imm}% target)")
        if level_code == 'A1':
            print(f"   FIX: Add English phonetic/alphabet explanations")
            print(f"   FIX: Expand English grammar theory sections")
            print(f"   FIX: Learner can't read Cyrillic yet - needs more English scaffolding")
        elif level_code == 'A2':
            print(f"   FIX: Add English explanations for case/aspect theory")
            print(f"   FIX: Expand English scaffolding for complex grammar")
        elif module_focus == 'grammar':
            print(f"   FIX: Add English grammar theory (this is a grammar-focused module)")
            print(f"   FIX: Explain complex concepts in English first, then Ukrainian examples")
            print(f"   FIX: Add 🔗 Language Link boxes comparing Ukrainian/English")
        else:
            print(f"   FIX: Add English context where needed")
            print(f"   FIX: Ensure translations are provided for complex passages")
