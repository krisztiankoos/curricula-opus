# Module Management Command

Review, fix, or create Ukrainian curriculum modules using the comprehensive module prompt.

## Usage

```
/module review [MODULE_NUMBER] [LEVEL]
/module fix [MODULE_NUMBER] [LEVEL]
/module create [MODULE_NUMBER] [LEVEL] [TITLE]
```

## Arguments

- `$ARGUMENTS` - The task mode and parameters

## Instructions

Read the comprehensive module prompt from `docs/l2-uk-en/module-prompt.md` and execute the requested task.

**Task modes:**
1. **review** - Analyze module for violations against grammar constraints
2. **fix** - Correct violations in an existing module
3. **create** - Write a new module from scratch

Parse the user's arguments: $ARGUMENTS

Then:
1. Read `docs/l2-uk-en/module-prompt.md` for all grammar constraints and templates
2. Locate the module file based on level and number:
   - A1: `curriculum/l2-uk-en/a1/XX-*.md`
   - A2: `curriculum/l2-uk-en/a2/XX-*.md`
   - B1: `curriculum/l2-uk-en/b1/XX-*.md`
   - B2: `curriculum/l2-uk-en/b2/XX-*.md`
3. Execute the requested task using the prompt's guidelines
4. Output the result in the format specified by the prompt

## Examples

```
/module review 11 A1
/module fix 15 A1
/module create 31 A2 "The Dative I"
```
