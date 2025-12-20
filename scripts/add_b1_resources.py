#!/usr/bin/env python3
"""
Add curated YouTube resources to B1 modules that have fewer than 3 links.
Uses the resources defined in B1-MEDIA-ASSIGNMENT.md
"""

import re
import os
from pathlib import Path

# Curated YouTube links by module/phase from B1-MEDIA-ASSIGNMENT.md
PHASE_RESOURCES = {
    # B1.1 Aspect (M01-10) - shared resources
    "aspect": [
        ("📺 [Perfective and Imperfective: Verb Aspects in Ukrainian](https://www.youtube.com/watch?v=YnWlncQJg8o)", "Let's Learn Ukrainian"),
        ("📺 [PERFECTIVE VERBS vs IMPERFECTIVE VERBS - PART 1](https://www.youtube.com/watch?v=v-SuEb_0WYM)", "Ukrainian grammar"),
        ("📺 [Learn 50 important Ukrainian Verb Pairs](https://www.youtube.com/watch?v=iK4uNlozmFE)", "Let's Learn Ukrainian"),
        ("📺 [Most Useful Ukrainian Verbs for Beginners](https://www.youtube.com/watch?v=xa-_fedNU6U)", "Ukrainian Language"),
    ],
    # B1.2 Motion (M11-20)
    "motion": [
        ("📺 [Verbs of Motion: Unidirectional, Multidirectional](https://www.youtube.com/watch?v=Bs7EJFMsAJY)", "Let's Learn Ukrainian"),
        ("📺 [Verbs of motion: ЙТИ, ХОДИТИ vs ЇХАТИ ЇЗДИТИ](https://www.youtube.com/watch?v=BHURRyliZHo)", "Ukrainian grammar"),
        ("📺 [Їздити VS Їхати/ Йти VS Ходити](https://www.youtube.com/watch?v=T6YwFExsRVc)", "Ukrainian grammar"),
        ("📺 [Let's practise the verbs of motion](https://www.youtube.com/watch?v=yS3MwBod5nM)", "Ukrainian grammar"),
    ],
    # B1.3 Complex Sentences (M21-35)
    "complex": [
        ("📺 [Conditionals - Learning Ukrainian with Odarka](https://www.youtube.com/watch?v=NwgNKVKHBIU)", "Learning Ukrainian with Odarka"),
        ("📺 [Ukrainian Conditionals: Якби](https://www.youtube.com/watch?v=Co0Y44nLlPA)", "Let's Learn Ukrainian"),
        ("📺 [ULP 3-119: Conditional mood in Ukrainian](https://www.youtube.com/watch?v=e2IFN-yGJ-Y)", "Ukrainian Lessons"),
        ("📺 [Direct and Indirect Speech - Odarka](https://www.youtube.com/watch?v=0SYRLbzFjtU)", "Learning Ukrainian with Odarka"),
        ("📺 [Пряма та непряма мова](https://www.youtube.com/watch?v=nsTFYTEiQjc)", "Ukrainian Online School"),
    ],
    # B1.4 Advanced Grammar (M36-45)
    "advanced": [
        ("📺 [У барі + Дієприслівник – Adverbial participle](https://www.youtube.com/watch?v=S3GgY9Fa8uk)", "Ukrainian Lessons"),
        ("📺 [Learning Ukrainian with Odarka - Adverbial Participle](https://www.youtube.com/watch?v=SRKqRpPzXnE)", "Learning Ukrainian"),
        ("📺 [How to form and use passive voice in Ukrainian](https://www.youtube.com/watch?v=txDI2JzODFo)", "Ukrainian grammar"),
        ("📺 [Мене попросили, запитали, запросили - Passive Voice](https://www.youtube.com/watch?v=khJ6GLWoYZ4)", "bazikschool"),
    ],
    # B1.5 Vocabulary I (M46-55)
    "vocab1": [
        ("📺 [Ukrainian for Beginners - Useful Phrases](https://www.youtube.com/watch?v=xa-_fedNU6U)", "Ukrainian Language"),
        ("📺 [Learn 50 important Ukrainian Verb Pairs](https://www.youtube.com/watch?v=iK4uNlozmFE)", "Let's Learn Ukrainian"),
        ("📺 [Що таке українська мова?](https://www.youtube.com/watch?v=nqReOxAjuWg)", "Ukraїner"),
    ],
    # B1.6 Vocabulary II (M56-65)
    "vocab2": [
        ("📺 [Що таке українська мова?](https://www.youtube.com/watch?v=nqReOxAjuWg)", "Ukraїner"),
        ("📺 [Чим для вас є Україна?](https://www.youtube.com/watch?v=x75Me7dLRj4)", "Ukraїner"),
        ("📺 [Україна з неба](https://www.youtube.com/watch?v=vb0ZWc70gOk)", "Ukraїner"),
    ],
    # B1.7 Contemporary Ukraine (M66-75)
    "contemporary": [
        ("📺 [Що таке українська мова?](https://www.youtube.com/watch?v=nqReOxAjuWg)", "Ukraїner"),
        ("📺 [Волинь. Україна з неба](https://www.youtube.com/watch?v=yE61lOcmuHs)", "Ukraїner"),
        ("📺 [Полтавщина. Україна з неба](https://www.youtube.com/watch?v=sX1xttuglKE)", "Ukraїner"),
        ("📺 [Чим для вас є Україна?](https://www.youtube.com/watch?v=x75Me7dLRj4)", "Ukraїner"),
    ],
    # B1.8 Skills (M76-80)
    "skills": [
        ("📺 [Що таке українська мова?](https://www.youtube.com/watch?v=nqReOxAjuWg)", "Ukraїner"),
        ("📺 [Чим для вас є Україна?](https://www.youtube.com/watch?v=x75Me7dLRj4)", "Ukraїner"),
        ("📺 [Віталій Портников: «Розвивати українське»](https://www.youtube.com/watch?v=cslHRvAe3oA)", "Ukraїner Q"),
    ],
}

# Module to phase mapping
def get_phase(module_num: int) -> str:
    if 1 <= module_num <= 10:
        return "aspect"
    elif 11 <= module_num <= 20:
        return "motion"
    elif 21 <= module_num <= 35:
        return "complex"
    elif 36 <= module_num <= 45:
        return "advanced"
    elif 46 <= module_num <= 55:
        return "vocab1"  # No specific videos
    elif 56 <= module_num <= 65:
        return "vocab2"  # No specific videos
    elif 66 <= module_num <= 75:
        return "contemporary"
    elif 76 <= module_num <= 80:
        return "skills"
    return "unknown"

def count_youtube_links(content: str) -> int:
    return len(re.findall(r'youtube\.com/watch', content))

def get_existing_links(content: str) -> set:
    """Extract existing YouTube video IDs to avoid duplicates"""
    return set(re.findall(r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)', content))

def add_resources_to_module(filepath: Path) -> bool:
    """Add curated YouTube resources to a module that needs them."""
    content = filepath.read_text()
    
    # Count existing links
    existing_count = count_youtube_links(content)
    if existing_count >= 3:
        return False  # Already has enough
    
    # Get module number from filename
    match = re.match(r'(\d+)-', filepath.name)
    if not match:
        return False
    module_num = int(match.group(1))
    
    # Get phase resources
    phase = get_phase(module_num)
    if phase not in PHASE_RESOURCES:
        print(f"  No resources for phase: {phase}")
        return False
    
    resources = PHASE_RESOURCES[phase]
    existing_ids = get_existing_links(content)
    
    # Find resources to add (that aren't already there)
    to_add = []
    for resource, channel in resources:
        video_id_match = re.search(r'v=([a-zA-Z0-9_-]+)', resource)
        if video_id_match and video_id_match.group(1) not in existing_ids:
            to_add.append(f"> - {resource} — {channel}")
    
    if not to_add:
        print(f"  All resources already present")
        return False
    
    # Find the [!resources] section and add resources
    # Pattern: find the closing of the resources callout (next line starting with something other than >)
    resources_pattern = r'(\> \[!resources\][^\n]*\n(?:\>[^\n]*\n)*)'
    
    def add_links(match):
        existing = match.group(1)
        # Remove trailing > if present
        if existing.rstrip().endswith('>'):
            existing = existing.rstrip()[:-1] + '\n'
        # Add new links
        new_links = '\n'.join(to_add[:3 - existing_count])  # Add only what's needed to reach 3
        return existing.rstrip() + '\n' + new_links + '\n'
    
    new_content = re.sub(resources_pattern, add_links, content)
    
    if new_content != content:
        filepath.write_text(new_content)
        print(f"  Added {min(len(to_add), 3 - existing_count)} resources")
        return True
    
    return False

def main():
    b1_dir = Path("curriculum/l2-uk-en/b1")
    
    modules = sorted(b1_dir.glob("*.md"))
    updated = 0
    skipped = 0
    
    for module in modules:
        content = module.read_text()
        youtube_count = count_youtube_links(content)
        
        if youtube_count < 3:
            print(f"Processing {module.name} (has {youtube_count} links)")
            if add_resources_to_module(module):
                updated += 1
            else:
                skipped += 1
    
    print(f"\n✅ Updated: {updated} modules")
    print(f"⏭️ Skipped: {skipped} modules (no resources available or already present)")

if __name__ == "__main__":
    main()
