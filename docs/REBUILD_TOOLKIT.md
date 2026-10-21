# Reconstruction toolkit — Piel de Cloro

## Design target

Use the pressure and legibility of *Papers, Please* (rules, inspection, limited resources, consequential decisions) and the uncertainty of *No, I'm Not a Human* (incomplete evidence, paranoia, conflicting signals). These are design references, not sources to copy characters, text, scenes, or assets from.

## Working rules

1. **One source of truth:** every domain action has one authoritative implementation.
2. **One state transition per action:** an event must not spend resources, resolve a death, or trigger an ending twice.
3. **Evidence is not certainty:** observations, testimony, suspicion, and confirmed diagnosis remain distinct.
4. **Player-facing reasons:** blocked actions explain the violated rule without exposing hidden answers.
5. **Small diffs, real tests:** no broad refactor without regression coverage.
6. **Measure before optimizing:** do not trade readable mechanics or horror pacing for speculative micro-optimizations.
7. **No generic filler:** every dialogue node must reveal evidence, characterize a speaker, alter a relationship, create a choice, or deliberately withhold information.

## Verified skill references and how they will be applied

These are public references. They are **not installed as executable tools in this repository**; their relevant instructions are read and applied as review checklists. The only skill currently stored in the repo is `.claude/skills/pxl-pixel-art/SKILL.md`, used only if pixel-art assets need work.

- **Ponytail — minimal, YAGNI-first engineering:** https://github.com/DimaMend/ponytail/blob/main/skills/ponytail/SKILL.md  
  Use when refactoring code: delete duplicate paths, prefer existing APIs and native features, avoid abstractions without multiple real uses, and keep a runnable check for non-trivial changes.
- **Anti-Slop Writing:** https://github.com/adewale/anti-slop-writing  
  Use for dialogue, lore, UI copy and documentation: concrete details over inflated importance, character-specific voice, causal transitions, no invented facts, and cut text that has no function.
- **Taste Skill — design-taste-frontend:** https://github.com/Leonxlnx/taste-skill  
  Use for visual direction and UI review: derive decisions from the game's own industrial horror identity, inspect real layouts at multiple widths, and reject generic AI-generated interface patterns. Its browser scripts require a local browser/runtime; until available, only the design criteria can be applied, not its screenshot workflow.
- **Claude Game Design Suite — Narrative Systems Designer:** https://github.com/baxatron-git/claude-game-design-suite/tree/main/narrative-systems-designer  
  Use to connect narrative delivery to mechanics: evidence, player agency, character state, branching/convergence, and lore delivery that does not interrupt the core loop.
- **Claude Game Design Suite — Design Coherence Engine:** https://github.com/baxatron-git/claude-game-design-suite/tree/main/design-coherence-engine  
  Use when one change can affect rules, balance, narrative, UI, and scope; record dependencies and propagate changes to tests and docs.
- **Taste Skill documentation:** https://www.tasteskill.dev/docs  
  Reference for the visual audit workflow; not a substitute for testing the actual game.

## Available project tooling

- GitHub repository and branch operations through the connected GitHub tools.
- GitHub Actions for repeatable CI feedback.
- Jest for unit and regression tests (current repository scripts).
- `tools/validate-dialogue-data.mjs` for dialogue graph and callback validation.
- `tools/validate-ui-methods.mjs` for duplicate method declaration checks across core systems.
- Source-level audits of call sites, state mutations, event ordering and UI bindings.
- Pixel-art skill `.claude/skills/pxl-pixel-art/SKILL.md` and `tools/build-npc-pixel-art.mjs` for NPC art only.

## Tooling limits

The connected GitHub tools can edit files and inspect CI, but they do not provide a live game session, device emulator, browser screenshot workflow, or performance profiler. Mobile behavior, timing feel, visual hierarchy, audio pacing, and full-run playability must not be marked verified until run in a real browser/device. CI passing is necessary, not proof that the whole game is correct.

## Validation loop

For each change: identify owner and callers → state expected invariants → implement the smallest safe diff → add a test that fails before the fix → run the relevant suite and full CI → inspect failures → update docs only to describe behavior that exists → repeat with adjacent systems.
