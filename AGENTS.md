# AGENTS.md

## Project

This repository is for `meu-treino`, a mobile-first gym workout app.

Use [docs/arquitetura/arquitetura-prompt.md](docs/arquitetura/arquitetura-prompt.md) as the canonical product and architecture reference. If a user request conflicts with that document, follow the newest user request and update the document when the decision should persist.

## Delivery Strategy

- Build the first usable version as an installable PWA.
- Host the PWA on Cloudflare Pages, connected to the GitHub repository, unless the user explicitly changes deployment target.
- Keep the same codebase ready for Android packaging with Capacitor.
- Prepare for APK generation and possible future Google Play publishing.
- Do not implement iPhone/App Store distribution in the first phase.
- Keep the app low-cost, offline-first, and 100% local on the device.
- Do not add a remote backend, remote database, login, account system, payments, or cloud sync unless the user explicitly changes scope.

## Preferred Stack

- React + Vite + TypeScript for the app foundation.
- Use `pnpm` as the project package manager; do not add npm/yarn lockfiles.
- Tailwind CSS for styling and responsive layout.
- shadcn/ui as the base for modern, accessible, customizable UI components.
- lucide-react for icons.
- Capacitor only for Android packaging.
- Do not use Ionic Framework components in the first version.
- IndexedDB with Dexie for PWA storage.
- SQLite through `@capacitor-community/sqlite` for Android native storage when needed.
- Zod for imported JSON validation.
- Zustand for simple UI state.
- TanStack Query only if local data coordination becomes meaningfully complex.

## Architecture Rules

- Keep domain types, validation, and business rules in `src/domain`.
- Keep local use cases in `src/services`.
- Keep database adapters and repositories in `src/storage`.
- Keep PWA/Android-specific file, sharing, download, and platform behavior in `src/platform`.
- Keep UI features under `src/features`.
- Keep reusable visual components under `src/components`.
- Keep shadcn/ui-derived primitives under `src/components/ui`.
- Make storage access go through repository interfaces so PWA and Android adapters can differ without changing UI code.
- Validate imported workout JSON before writing it to local storage.
- Prefer small, explicit functions over broad abstractions until duplication is real.

## Workout Domain Rules

- Imported JSON must use the `workout_plan` root described in the architecture document.
- Importing a new plan may discard the old plan sequence progress.
- Importing a new plan must preserve previous load history for matching exercises.
- Exercise matching should prefer stable `exercise_id`; otherwise use a canonical key from name, muscle group, equipment, and unilateral flag.
- Track completed sessions for the active plan.
- Track the last completed routine for the active plan.
- Recommend the next routine by routine `order`; after the last routine, return to the first.
- Show cycle completion when completed sessions reach `estimated_duration_weeks * days_per_week`.
- In the first version, the active workout UI records load and reps only at the end of each exercise. The user may mark individual sets as completed to drive the rest timer, but visible load/reps entry remains exercise-level, not per-set.
- RIR may remain optional/null in domain and storage for compatibility and future analytics, but it is not a required visible field in `UX-04`.

## UX Rules

- Design mobile-first for use during an actual workout.
- Use large touch targets and fast numeric entry for sets, reps, load, and RIR.
- Keep the first screen useful, not a marketing landing page.
- Use the approved identity assets in `assets/identity` when configuring app branding, PWA icons, Android adaptive icons, splash screens, and any explicit brand/logo display.
- Do not generate or introduce new brand icons when the existing `assets/identity` files cover the need.
- Use [docs/arquitetura/ux-prototipo-aprovado.md](docs/arquitetura/ux-prototipo-aprovado.md) as the UX approval contract before implementing final screens.
- Use Excalidraw as the default tool for UX wireframes before coding final screens.
- Base the first version on the approved guided usability model: the home screen should focus on the next recommended workout.
- Use an active-workout experience focused on fast exercise logging, rest timer, and few distractions.
- In `UX-04`, keep the final entry block focused on the current exercise with load and reps only. The UI may show per-set completion controls and rest between sets, but should not ask for load/reps per set.
- Make the PWA installable with manifest, icons, service worker, and offline support.
- Keep visible text concise during workout execution.
- Support selectable light and dark themes.
- Use the dark theme as the default first-run theme.
- Base the light theme on `Tema 2 - Energia Clara` from `docs/arquitetura/identidade-visual-opcoes.md`.
- Base the dark theme on `Tema 5 - Hibrido recomendado` from `docs/arquitetura/identidade-visual-opcoes.md`.
- Store the user's theme preference locally and apply it without restarting the app.
- Use design tokens/CSS variables for colors instead of hard-coded colors in components.
- In mobile cards with detailed content, do not keep the main content inside a side column next to an icon; use a compact header for the icon/title and let previews, summaries, errors, and action buttons use the full card width.

## Codex Workflow

- Before coding, read this file and the relevant parts of `docs/arquitetura/arquitetura-prompt.md`.
- Work in small, reviewable tasks aligned with [docs/arquitetura/arquitetura-prompt.md](docs/arquitetura/arquitetura-prompt.md) and [docs/arquitetura/ux-prototipo-aprovado.md](docs/arquitetura/ux-prototipo-aprovado.md).
- For each implementation task, confirm the goal, constraints, and "done when" criteria from the prompt.
- Do not rewrite unrelated files or make broad refactors unless they are necessary for the current task.
- Ask before adding new production dependencies after the initial project scaffold.
- When a recurring decision is discovered, update this file or the architecture document so future Codex runs inherit it.
- At the end of each execution, create a Git commit with the completed changes and push it to the configured remote.

## Verification

- When package scripts exist, run the narrowest relevant checks after changes.
- Prefer `npm run build`, `npm run lint`, and targeted tests when available.
- For domain logic, add or update unit tests.
- For storage logic, test import, replacement, and retrieval flows.
- For frontend changes, verify the app in a mobile-sized viewport when possible.
- If a check cannot be run, state that clearly in the final response.
