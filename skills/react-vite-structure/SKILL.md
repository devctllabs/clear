---
name: react-vite-structure
description: React + Vite + TypeScript project structure guidance for creating, organizing, refactoring, or migrating frontend apps. Use when Codex needs folder architecture, feature-module boundaries, TanStack Router file-based route modules, hierarchical route-facing pages, platform-dependent service implementations, dependency injection, typed Result/DomainError handling, UI loading/error/empty states, web/Tauri/mock services, composite/routed services, generated code placement, OpenAPI codegen organization, shadcn/ui and Tailwind placement, Storybook stories and UI testing strategy, shared/core conventions, path aliases, naming rules, common types, feature scaffolding workflow, testing strategy, state management choices, code quality tooling, documentation templates, or migration checklists for React/Vite projects.
---

# React Vite Structure

Use this skill to organize React + Vite + TypeScript apps around feature modules, shared resources, and core app infrastructure.

## Workflow

1. Inspect the existing project before recommending changes: package manager, Vite/React setup, TypeScript config, routing, state management, tests, linting, and current folder conventions.
2. Preserve established local patterns when they are coherent. Apply these references when the project lacks a clear convention or when the user asks to standardize around this structure.
3. Load only the reference files needed for the task. Do not load the full set by default.
4. Prefer incremental migration for existing apps. Avoid broad restructures unless the user explicitly asks for a full reorganization.
5. Keep feature modules self-contained and expose public APIs through `index.ts` files. Put reusable UI, hooks, services, utilities, and shared types under `shared/`; put app-wide configuration, routing, providers, global store, and i18n under `core/`.

## References

- Read `references/structure.md` for the overall folder layout, feature-module template, shadcn/ui and Tailwind placement, and `features/`, `shared/`, `core/`, `assets/`, colocated tests, and shared test infrastructure boundaries.
- Read `references/routing-and-pages.md` for TanStack Router file-based route modules, hierarchical feature `pages/` route groups, route-facing page composition, desktop/mobile page view splits, page view state unions, route layout files, and page naming rules.
- Read `references/generated-code.md` for generated code placement, OpenAPI codegen output, generated DTO usage, API adapters, and generated TanStack Query hooks.
- Read `references/platform-services-and-di.md` for platform-dependent services, feature service contracts, `platform/services`, composite services, object-scoped backend routing, and DI wiring.
- Read `references/error-handling.md` for `Result`, `DomainResult`, `DomainErrorType`, typed domain errors, API/Tauri error mapping, and React Query unwrapping.
- Read `references/ui-error-states.md` for UI loading, empty, query error, partial-data, retry, mutation pending, and mutation error rendering policy.
- Read `references/typescript-and-naming.md` for `tsconfig.json`, `vite.config.ts` path aliases, naming conventions, component/hook/service/type examples, and common shared types.
- Read `references/feature-workflow.md` when adding or scaffolding a new feature module, including types, service, React Query hooks, components, pages, and public exports.
- Read `references/practices-testing-state-quality.md` for component organization, type safety, custom hooks, error handling, environment variables, unit/integration tests, MSW HTTP-boundary service adapter tests, React Query, Zustand, Context API, ESLint, Prettier, and lint-staged guidance.
- Read `references/storybook.md` when adding or changing UI components/pages, Storybook setup, visual/a11y/interaction test coverage, Storybook decorators, MSW handlers, or shared Storybook harnesses.
- Read `references/documentation-templates.md` when creating feature documentation, changelogs, API docs, component docs, or troubleshooting guides.
- Read `references/project-checklist-and-migration.md` for new-project setup checklists, additional resources, gradual migration phases, and implementation tips.

## Default Decisions

- Use React Query for server state.
- Use Zustand for non-trivial client/global UI state.
- Use Context API only for simple app-wide concerns such as theme or auth wrappers.
- Render load failures inside the affected UI surface by default: page, section, list, search results, form, or dialog. Use toasts/alerts only as secondary feedback for non-blocking failures.
- For every user-visible async operation, account for loading, no-data query error, stale-data query error, mutation pending, and mutation error states when those states are possible. Do not leave a query or mutation failure silent in the UI.
- For new projects, use `pnpm` by default. For existing projects, follow the detected lockfile/package manager unless the user asks to migrate.
- For new UI projects, prefer Tailwind via the Vite plugin and shadcn/ui primitives under `src/shared/components/ui`. For existing projects, keep the coherent detected UI stack unless the user asks to migrate.
- Keep `index.html` in the Vite app root next to `package.json` and `vite.config.ts`; use `ui/index.html` only when `ui/` is itself the app/package root.
- Use `public/` only for static files served as-is by stable URL. Use `src/assets/` for imported or bundled images, icons, fonts, and global styles.
- Use strict TypeScript and Vite path aliases that mirror `src/features`, `src/shared`, `src/core`, and `src/assets`.
- Keep feature-specific code inside `src/features/[feature-name]/`; move only genuinely reusable code to `src/shared/`.
- Keep shadcn/ui base primitives in `shared/components/ui` using shadcn-style lowercase filenames such as `button.tsx` and `dialog.tsx`. Put app-specific reusable composites in sibling shared component folders, not in `ui/`.
- For each new or changed file in `pages/`, `hooks/`, or `components/`, create or update a colocated test with the same basename, such as `ListPage.test.tsx`, `useProducts.test.ts`, or `ProductCard.test.tsx`. Use ownerless test files only when no single source file owns the behavior.
- For every user-facing route-facing page in `features/*/pages`, create or update a colocated Storybook file with the same basename, such as `ListPage.stories.tsx`. Cover at least `Default` or `Loaded`; add `Loading` whenever the page reads async data or can show a skeleton; add search loading for async search/results surfaces; add empty, load-error, search/filter, dialog/open, dense-data, and long-content states when the page supports them. Follow the story naming conventions in `references/storybook.md`, including `LoadError`, domain `Empty*`, `ManyItems`, action state names, and hidden `*Regression` stories. Use title hierarchy `Features/<Feature>/Pages/<FileBasename>`, where the final segment matches the colocated page file basename rather than a domain-prefixed export name.
- When adding or changing a visible loading, query-error, stale-data warning, mutation-pending, or mutation-error branch, add or update the owning page/component Storybook story for that exact UI surface.
- For list/grid/table/container UI that renders domain collections, including route-facing pages with collection sections, add Storybook coverage for zero, single, and many items whenever those states are valid user-visible states. Prefer `Empty`, `SingleItem`, and `ManyItems` for component stories; use clearer domain names for page stories when needed.
- For each new or materially changed public, reusable, or visually risky UI component, create or update a colocated Storybook file with the same basename, such as `ProductCard.stories.tsx`. Cover primary UI states and layout-risk edge data; do not create stories for hooks, services, utilities, generated code, route modules, private helper subcomponents, or thin connected wrappers without independent visual states.
- Use `src/test/` only for shared test setup, MSW, render helpers, fixtures, builders, and `src/test/storybook/` Storybook harnesses. Do not put normal product specs under `src/test/`.
- Keep generated OpenAPI/API contract code in `src/shared/services/api/generated/<source-name>/`; never hand-edit generated files.
- Keep generated API code out of `features/*` by default. Platform service implementations or composite services may wrap generated functions for UI-specific behavior, mapping, query composition, or naming.
- Keep route-facing components in feature-local `pages/` folders. Use nested `pages/[route-group]/` folders for related screens under the same URL context.
- For TanStack Router, use file-based route modules under the configured routes directory, usually `src/routes`. Keep route modules thin, import feature pages through the feature public API, keep the generated route tree outside `src/routes`, and never hand-edit generated router files.
- Avoid redundant domain prefixes inside a feature. Prefer route-facing page basenames such as `ListPage.tsx`, `CreatePage.tsx`, `DetailPage.tsx`, `EditPage.tsx`, singleton `<Feature>Page.tsx`, or workflow-step pages such as `SessionPage.tsx`; add aliases or prefixes only at public export boundaries or when ambiguity is real.
- Keep platform-dependent service implementations in `src/platform/services/[feature]/{web,tauri,mock,composite}`.
- Keep `src/core/services` for DI composition and React service providers only; do not put concrete feature service implementations there.
- Keep `features/[feature]/services/[feature]Service.ts` interface-only. Features must not import `apiClient`, `@tauri-apps/api`, `platform/*`, or concrete service implementations.
- Use `src/platform/services/[feature]/web/[feature]Service.ts` as the default concrete implementation, even before Tauri/mock/composite implementations exist.
- Use `DomainResult<T>` for async backend/runtime service contract methods. Platform services return `ok`/`err`; React Query hooks call `unwrapDomainResult` so `query.data` is `T` and `query.error` is `DomainError`.
