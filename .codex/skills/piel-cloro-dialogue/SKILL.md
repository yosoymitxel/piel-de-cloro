---
name: piel-cloro-dialogue
description: Audit and lightly edit Spanish dialogue for Piel de Cloro, preserving character voice, narrative continuity, player-facing history, branching requirements, and game mechanics.
---

# Piel de Cloro — Dialogue Humanization

Use this skill for dialogue audits and small editorial passes in the Piel de Cloro repository. The goal is unsettling, character-specific Spanish prose—not generic “AI humanization” and not detector-score optimization.

## Priority order

1. Preserve game logic: node IDs, option IDs, `next`, `req`/`requires`, `sets`, `sanity`, `paranoia`, `onclick`, `resultText`, audio keys and ending behavior.
2. Preserve lore continuity and uncertainty. Distinguish what a character witnessed, what they were told, what they infer, and what they conceal.
3. Improve voice, rhythm and subtext with the smallest effective edit.
4. Keep player choices readable and meaningfully distinct.

## Spanish prose rules

- Write natural, idiomatic Spanish. Keep the project's established register; do not add regional slang unless the character and scene justify it.
- Avoid having every character speak in polished, complete explanations. Use interruptions, evasions, concrete details, hesitation or bluntness only when motivated by that character.
- Prefer specific physical observations over generic labels such as “aterrador”, “perturbador” or “inquietante”.
- Remove repeated disclaimers and manual-like exposition, but preserve uncertainty when it is part of the lore.
- Do not make every line cryptic. Horror needs contrast: ordinary details make disturbing details land.
- Avoid formulaic rhetorical constructions, symmetrical lists, repeated three-part clauses and repetitive sentence openings.
- Keep stage directions brief and playable. They should add behavior, sound or visual information rather than explain the emotion already obvious from dialogue.
- Do not equate natural dialogue with typos, random fragments, slang or artificial disfluency.

## Character voice anchors

- **Archivista:** records dates and physical evidence to compensate for unreliable memory. Guilt leaks through omissions and revisions; do not turn every answer into a confession.
- **Colmena:** several voices share one body but disagree in memory, motive and certainty. Make voices distinguishable by what they notice and want, not by repeatedly announcing that there are multiple voices.
- **Kael:** technical, observant and constrained by his embedded position. Separate sensor readings from interpretations; avoid explaining the game's mechanics directly to the player.
- **Paciente Cero:** medically precise and personally compromised. His scientific caution should sometimes protect him from blame; avoid repeating “no hay pruebas” in every answer.

## History and interaction rules

- Treat a conversation as a graph, not as a linear script. Check that every non-null `next` points to a node in the same pool.
- Options hidden by `req`/`requires` must remain hidden and must also be rejected if selected directly.
- Do not rename IDs, alter branch targets, or change flags as part of a prose-only pass.
- Player-visible history should preserve the exact rendered line and the choice the player selected. Do not regenerate randomized/glitched text when reconstructing an earlier entry.
- Distinguish narrative dialogue from system log, rumor and lore-item entries. Do not duplicate entries across views without checking how the UI consumes them.
- Labels such as “Volver”, “Entendido” and “Anotado” are acceptable for utility actions, but replace them only when a more specific label improves tone or communicates a meaningful intent.
- Any option that triggers `onclick`, `resultText`, sanity/paranoia changes, or flags is gameplay behavior, not merely wording.

## Workflow

1. Read the dialogue engine and the UI path that renders conversation, history, and log entries before changing either.
2. Read the complete affected dialogue pool and relevant tests.
3. Make small, local edits. Do not rewrite whole pools to satisfy a generic style checklist.
4. Validate node graph integrity and inspect changed IDs/metadata.
5. Run `npm run validate:dialogues` and the relevant Jest tests; run Playwright if the UI/history rendering changed.
6. Report exactly what was changed and which tests actually ran. Never claim tests or browser checks that were not executed.

## Review output

For each issue, state: location, concrete problem, minimal correction, and whether it affects prose, logic, or both. Keep uncertain lore unresolved unless the repository establishes the answer.
