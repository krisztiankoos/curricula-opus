"""
Text cleaning utilities for audit calculations.

Provides functions to clean text for word count and immersion calculations,
removing metadata, tables, and other non-content elements.
"""

import re


def clean_for_stats(text: str) -> str:
    """
    Removes metadata that should NOT count towards word count.
    Keeps scaffolding (context, explanations) as instructional content.
    """
    # 1. Remove Tables (lines starting with vertical bar)
    text = re.sub(r'^\s*\|.*$', '', text, flags=re.MULTILINE)

    # 2. Remove ONLY specific metadata callouts (not engagement boxes)
    text = re.sub(r'^\s*>\s*\[!(answer|options|error|id)\].*$', '', text, flags=re.MULTILINE)

    # 3. Remove Images / Links with no text
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)

    # 4. Remove HTML comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)

    # 5. Remove Headers
    text = re.sub(r'^#+.*$', '', text, flags=re.MULTILINE)

    # 6. Remove frontmatter dividers
    text = re.sub(r'^---', '', text, flags=re.MULTILINE)

    return text


def clean_for_immersion(text: str) -> str:
    """
    Cleans text for immersion calculation. Keeps blockquotes (engagement boxes)
    as they are part of the learning content and contribute to immersion.
    """
    # Remove ONLY metadata callouts (not engagement boxes)
    text = re.sub(r'^\s*>\s*\[!(answer|options|error|id)\].*$', '', text, flags=re.MULTILINE)

    # Remove Tables
    text = re.sub(r'^\s*\|.*$', '', text, flags=re.MULTILINE)

    # Remove Headers
    text = re.sub(r'^#+.*$', '', text, flags=re.MULTILINE)

    return text


def extract_core_content(body: str) -> str:
    """
    Extract content before the Activities section.
    This is the 'instructional core' for word count and immersion.
    """
    # Match both English-only and bilingual headers
    activities_pattern = re.compile(r'^# (?:Activities|Вправи)', re.MULTILINE | re.IGNORECASE)
    activities_match = activities_pattern.search(body)

    if activities_match:
        return body[:activities_match.start()]
    return body


def calculate_immersion(text: str) -> float:
    """Calculate percentage of Cyrillic characters in text."""
    if not text:
        return 0.0
    clean_text = re.sub(r'\s+', '', text)
    if not clean_text:
        return 0.0
    total_chars = len(clean_text)
    cyrillic_chars = len(re.findall(r'[\u0400-\u04ff]', clean_text))
    return (cyrillic_chars / total_chars) * 100


def count_words(text: str) -> int:
    """Count words in cleaned text."""
    return len(text.split())


def extract_ukrainian_sentences(text: str) -> list[str]:
    """
    Extract Ukrainian sentences from text (lines with Cyrillic content).

    Excludes:
    - Table rows (lines starting with |)
    - Numbered list headers (lines like **1. Title:**)
    - Lines starting with # (markdown headers)
    """
    sentences = []

    # Filter out non-prose lines
    lines = text.split('\n')
    prose_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('|'):
            continue
        if stripped.startswith('#'):
            continue
        if re.match(r'^\*?\*?\d+\.', stripped):
            continue
        prose_lines.append(line)

    prose_text = '\n'.join(prose_lines)

    # Split by sentence-ending punctuation
    raw_sentences = re.split(r'[.!?]', prose_text)
    for sent in raw_sentences:
        cyrillic_chars = len(re.findall(r'[\u0400-\u04ff]', sent))
        if cyrillic_chars > 5:
            sentences.append(sent.strip())

    return sentences
