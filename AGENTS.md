# Repository Guidelines

## Project Structure & Module Organization

This repository is a pnpm workspace with a React/Vite UI and Rust/Tauri backend.
UI source lives in `ui/src`: file-based routes are under `routes/`, domain features under `features/`, shared components/hooks/utilities under `shared/`, app wiring under `core/`, and runtime service adapters under `platform/`. Global styles are in `ui/src/assets/styles/globals.css`; shadcn primitives are in `ui/src/shared/components/ui`. Do not hand-edit `ui/src/routeTree.gen.ts`.

Rust code lives in `rust/`: workspace crates are in `rust/crates/`, the Tauri shell is in `rust/tauri/`, and SQLite migrations are in `rust/migrations/sqlite/`.

## Build, Test, and Development Commands

Run commands from the repository root unless noted.

- `pnpm dev:ui`: start the Vite UI on port 5173.
- `pnpm dev:tauri`: run the Tauri desktop app.
- `pnpm build:ui` / `pnpm build:tauri`: build the UI or Tauri app.
- `pnpm check:ui`: run TypeScript project checks.
- `pnpm lint:ui`: run ESLint for the UI.
- `pnpm test:ui`, `pnpm test:ui:unit`, `pnpm test:ui:storybook`: run all UI tests, unit-only tests, or Storybook browser tests.
- `pnpm test:rust`, `pnpm check:rust`, `pnpm check:tauri`: test or type-check Rust workspace targets.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and existing path aliases such as `@features`, `@shared`, `@core`, and `@platform`. Keep feature code grouped by domain with `components/`, `hooks/`, `pages/`, `services/`, and `types/` subfolders where applicable. Use PascalCase for React components and pages, `useX` for hooks, and camelCase for functions and variables. Follow existing formatting: 2-space TS/TSX indentation and standard `cargo fmt` Rust formatting.

## Testing Guidelines

UI tests use Vitest, React Testing Library, jsdom, and Storybook/Vitest browser tests. Name tests beside the code as `*.test.ts` or `*.test.tsx`; stories use `*.stories.tsx`. Shared route flows live in `ui/src/routes/-tests/`. Rust tests run through Cargo. Add focused tests for service adapters, hooks, route flows, and reusable UI behavior changed by a patch.

## Commit & Pull Request Guidelines

The current branch has no commit history yet, so no repository-specific commit convention is established. Use short, imperative commit subjects with an optional scope, for example `ui: add deck review empty state` or `rust: validate migration paths`. Pull requests should include a concise description, linked issue when available, test commands run, and screenshots or Storybook links for visible UI changes.

## Agent-Specific Instructions

Preserve user changes in the working tree. Prefer existing service boundaries and generated-route workflows, and avoid unrelated refactors while making targeted changes.
