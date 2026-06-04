---
name: Clear
description: A quiet personal study system for durable knowledge.
colors:
  background: "oklch(98.2% 0.004 95)"
  foreground: "oklch(18% 0.006 95)"
  card: "oklch(99.1% 0.004 95)"
  card-foreground: "oklch(18% 0.006 95)"
  popover: "oklch(99.1% 0.004 95)"
  popover-foreground: "oklch(18% 0.006 95)"
  primary: "oklch(18% 0.006 95)"
  primary-foreground: "oklch(99.1% 0.004 95)"
  secondary: "oklch(96.7% 0.004 95)"
  secondary-foreground: "oklch(18% 0.006 95)"
  muted: "oklch(96.7% 0.004 95)"
  muted-foreground: "oklch(52% 0.004 95)"
  accent: "oklch(96.7% 0.004 95)"
  accent-foreground: "oklch(18% 0.006 95)"
  border: "oklch(91.8% 0.004 95)"
  input: "oklch(99.1% 0.004 95)"
  overlay: "oklch(24% 0.006 95 / 0.34)"
  ring: "oklch(18% 0.006 95)"
  destructive: "oklch(48% 0.17 28)"
  destructive-foreground: "oklch(99.1% 0.004 95)"
  dark-background: "oklch(20% 0.004 70)"
  dark-foreground: "oklch(96.8% 0.003 70)"
  dark-card: "oklch(22.5% 0.004 70)"
  dark-card-foreground: "oklch(96.8% 0.003 70)"
  dark-popover: "oklch(26% 0.004 70)"
  dark-popover-foreground: "oklch(96.8% 0.003 70)"
  dark-primary: "oklch(96.8% 0.003 70)"
  dark-primary-foreground: "oklch(18% 0.004 70)"
  dark-secondary: "oklch(25% 0.004 70)"
  dark-secondary-foreground: "oklch(96.8% 0.003 70)"
  dark-muted: "oklch(25% 0.004 70)"
  dark-muted-foreground: "oklch(74% 0.003 70)"
  dark-accent: "oklch(25% 0.004 70)"
  dark-accent-foreground: "oklch(96.8% 0.003 70)"
  dark-border: "oklch(30% 0.004 70)"
  dark-input: "oklch(25% 0.004 70)"
  dark-overlay: "oklch(8% 0.004 70 / 0.62)"
  dark-ring: "oklch(88.5% 0.003 70)"
  dark-destructive: "oklch(70% 0.18 25)"
  dark-destructive-foreground: "oklch(99.1% 0.003 70)"
typography:
  display:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0"
  mobile-display:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "0"
  headline:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "0"
  title:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  reading:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "0"
  editor-body:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  action:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0"
  label:
    fontFamily: "'Geist Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "0"
  metric:
    fontFamily: "'Geist Mono', ui-monospace, 'SFMono-Regular', 'Roboto Mono', Menlo, Monaco, 'Liberation Mono', 'DejaVu Sans Mono', monospace"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
  mono:
    fontFamily: "'Geist Mono', ui-monospace, 'SFMono-Regular', 'Roboto Mono', Menlo, Monaco, 'Liberation Mono', 'DejaVu Sans Mono', monospace"
    fontSize: "0.9em"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  md: "0.375rem"
  lg: "0.5rem"
  editor: "0.875rem"
  dropdown: "1rem"
  bottom-nav-item: "1.125rem"
  compact: "1.25rem"
  panel: "1.5rem"
  card: "2rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.action}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.5rem"
  button-action-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "0.875rem 1.75rem"
    height: "3rem"
  button-outline-pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.25rem"
    height: "2.75rem"
  search-input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "1rem 1.5rem 1rem 3.5rem"
    height: "3.25rem"
  icon-control:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    size: "2.75rem"
  card-study:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
  inventory-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.compact}"
    padding: "0"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
---

# Design System: Clear

## Overview

**Creative North Star: "Quiet Study Room"**

Clear should feel like a quiet, private study room for focused learners working at a desk for a long session: warm paper in daylight, warm graphite in dim rooms, controlled type, durable study surfaces, and interactions that lower cognitive load. Design serves capture, organize, retrieve, review, and continue.

The visual language follows PRODUCT.md directly: intellectual calm, low cognitive load, depth over dopamine, and premium clarity. It rejects generic SaaS decoration, gamified flashcard energy, competitive rewards, confetti, badge economies, and noisy motivational language.

Tokens are extracted from `ui/src/assets/styles/globals.css`. Component rules reflect the current primitives and route-facing patterns in `ui/src/shared/components` and `ui/src/features`.

**Key Characteristics:**

- Warm graphite monochrome in both light and dark themes.
- Color reserved for destructive and error states, never decoration.
- Large study surfaces, compact controls, and clear lanes for mobile, editor, page, and desktop app frames.
- Geist Sans across chrome and reading, Geist Mono only for technical and numeric fragments.
- Tonal layering through 1px borders, inset highlights, and restrained floating shadows.
- Motion communicates state, loading, or reload only.

## Colors

Clear uses a restrained warm graphite palette. The product is nearly monochrome by design: neutrals carry hierarchy, borders carry structure, and red is reserved for failure or destruction.

### Primary

- **Graphite Ink** (`{colors.primary}`): Primary actions, active desktop navigation, active pills, progress fills, selected icon states, and strongest light-mode emphasis.
- **Warm Chalk** (`{colors.dark-primary}`): Dark-mode primary actions and strongest dark-mode emphasis.
- **Primary Foreground Pair** (`{colors.primary-foreground}`, `{colors.dark-primary-foreground}`): Text and icons placed on primary fills.

### Neutral

- **Warm Paper Background** (`{colors.background}`): Light-mode app canvas. It is close to white but intentionally tinted toward the brand hue.
- **Warm Ink Foreground** (`{colors.foreground}`): Main text, icons, and active non-filled controls in light mode.
- **Study Surface** (`{colors.card}`, `{colors.popover}`, `{colors.input}`): Cards, dialogs, popovers, search fields, and editor fields in light mode.
- **Quiet Mist** (`{colors.secondary}`, `{colors.muted}`, `{colors.accent}`): Hover fills, inactive chips, icon wells, skeleton bases, and secondary controls.
- **Soft Caption Gray** (`{colors.muted-foreground}`): Metadata, helper text, section labels, disabled-ish copy, and non-primary navigation.
- **Hairline Ash** (`{colors.border}`): Borders, dividers, row separators, progress tracks, and quiet surface separation.
- **Focus Ink** (`{colors.ring}`): Keyboard focus rings and input focus treatment.
- **Overlay Smoke** (`{colors.overlay}`): Dialog and blocking overlay scrim.
- **Graphite Ground** (`{colors.dark-background}`): Dark-mode app canvas.
- **Charcoal Surface** (`{colors.dark-card}`, `{colors.dark-popover}`, `{colors.dark-input}`): Dark-mode cards, popovers, fields, and raised panels.
- **Dark Accent Plane** (`{colors.dark-secondary}`, `{colors.dark-muted}`, `{colors.dark-accent}`): Dark-mode hover fills and selected-neutral planes.
- **Dust Caption** (`{colors.dark-muted-foreground}`): Dark-mode metadata and helper text.
- **Dark Hairline** (`{colors.dark-border}`): Dark-mode borders and separators.

### Error

- **Measured Red** (`{colors.destructive}`): Light-mode destructive actions, failed saves, load errors, and irreversible actions.
- **Signal Red** (`{colors.dark-destructive}`): Dark-mode destructive actions and failure states.

### Named Rules

**The Warm Graphite Rule.** Monochrome is Clear's native atmosphere. Color is not decoration, branding, celebration, or motivation.

**The Errors Only Rule.** Red appears only when something failed, could not save, could not load, or will destroy data. Do not introduce success, warning, info, or gamified accent colors without a deliberate product reason.

**The Semantic Token Rule.** Use the semantic CSS variables (`--background`, `--card`, `--primary`, `--muted`, `--border`, `--ring`, `--destructive`) rather than one-off color literals. Theme switching depends on those roles.

**The Surface Discipline Rule.** If two surfaces need separation, use background tone, a 1px border, spacing, or the existing shadow vocabulary. Do not add colored stripes, gradients, or glow.

## Typography

**UI and Reading Font:** Geist Sans, self-hosted from `ui/src/assets/fonts/geist/Geist-Variable.woff2`, with ui-sans-serif and system-ui fallback.
**Italic Font:** Geist Sans Italic, self-hosted for user-authored markdown emphasis only.
**Mono Font:** Geist Mono, self-hosted from `GeistMono-Variable.woff2`, with system monospace fallbacks.

**Character:** Geist Sans carries the whole product surface with a precise, modern, less default voice. It makes the interface feel architectural without forcing a decorative display layer. Geist Mono is reserved for numbers, percentages, code, and technical fragments.

### Hierarchy

- **Display** (Geist Sans 700, `2rem`, `1.25`): Desktop page titles and rare identity moments.
- **Mobile Display** (Geist Sans 700, `1.75rem` to `2rem`, `1.18` to `1.25`): Mobile page titles with the same authority at smaller width.
- **Headline** (Geist Sans 650, `1.5rem`, `1.15`): Study titles, editor titles, major cards, dialogs, and important empty states.
- **Title / Row** (Geist Sans 600, `0.9375rem`, `1.35`): Card names, list item titles, settings rows, menu items, and dense scanning surfaces.
- **Body** (Geist Sans 400, `1rem`, `1.5`): Product copy, descriptions, settings rows, helper text, and explanatory UI. Keep prose within 65 to 75 characters where layout allows.
- **Reading** (Geist Sans 400, `1.0625rem`, `1.72`): Markdown rendering, review prompts, review answers, and study content.
- **Editor Body** (Geist Sans 400, `1.125rem`, `1.7`): Note body textareas and long-form authoring.
- **Label / Action** (Geist Sans 600 to 650, `0.75rem` to `0.875rem`, neutral tracking): Eyebrows, metadata, section labels, counters, buttons, and compact uppercase controls.
- **Metric / Technical** (Geist Mono 700, `1.5rem`, `1`): Due counts, percentages, progress labels, and technical inline fragments.
- **Mono** (Geist Mono 600, `0.9em`, `1.4`): Inline markdown code and technical text only.

### Named Rules

**The Architectural Type Rule.** Display type may be bold, but dense product UI must use neutral tracking. Labels, buttons, rows, and data stay Geist Sans-based and product-native.

**The Reading Continuity Rule.** Study content uses Geist Sans with larger size and looser line-height, not a separate serif layer. Distinguish reading surfaces through rhythm, spacing, and weight, not decorative font changes.

**The Upright Chrome Rule.** Product chrome stays upright. Italic belongs to user-authored markdown emphasis, not labels, metrics, buttons, or status text.

**The No Decorative Type Rule.** Do not add serif, script, novelty, or gradient text treatments. The premium feeling comes from spacing, weight, alignment, and restraint.

## Elevation

Clear uses a hybrid of tonal layering and restrained shadow. Most depth comes from surface tone, 1px borders, and large radii. Shadows are quiet and structural, used to distinguish cards, popovers, dialogs, menus, and floating controls from the study canvas.

### Shadow Vocabulary

- **Card Inset Highlight** (`box-shadow: 0 1px 0 oklch(99.1% 0.004 95 / 0.72) inset`): Light-mode resting cards and panels.
- **Floating Shadow** (`box-shadow: 0 18px 48px -28px oklch(18% 0.006 95 / 0.18), 0 2px 8px -4px oklch(18% 0.006 95 / 0.08)`): Popovers, floating menus, dialogs, overlays, and controls that must sit above content.
- **Dark Card Inset** (`box-shadow: 0 1px 0 oklch(99.1% 0.003 70 / 0.03) inset`): Dark-mode resting cards and panels.
- **Dark Floating Shadow** (`box-shadow: 0 18px 48px -30px oklch(6% 0.004 70 / 0.86), 0 1px 0 oklch(99.1% 0.003 70 / 0.04) inset`): Dark-mode popovers, menus, dialogs, and elevated surfaces.

### Named Rules

**The Flat-Until-Needed Rule.** Surfaces rest flat. Elevation appears only for cards, popovers, overlays, sticky navigation, and other real layering needs.

**The Blur Has a Job Rule.** Backdrop blur is allowed for sticky headers, bottom navigation, and reload transitions because it preserves reading context. Do not use glassmorphism as decoration.

## Components

### Buttons

- **Shape:** Base shadcn-style primitives use a compact radius (`0.375rem`), but route-facing product actions use full pills (`9999px`).
- **Primary:** Graphite Ink background with Warm Chalk text. Use for save, create, retry, review, show answer, and active navigation.
- **Route Actions:** Most visible actions are `type-action`, rounded full, `min-height` between `2.75rem` and `3.5rem`, with `active:scale(0.98)` or `active:scale(0.95)` feedback.
- **Hover / Focus:** Hover changes opacity or neutral tone only. Focus uses a 2px ring with a 2px surface offset. Card and popover focus rings must offset against the current surface.
- **Secondary / Outline:** Surface background, 1px Hairline Ash border, Graphite Ink text, and muted hover fill.
- **Danger:** Use destructive colors only for irreversible or failed actions.

### Icon Controls

- **Shape:** Always circular. Sizes step through `1.75rem`, `2rem`, `2.25rem`, `2.75rem`, `3rem`, and `3.5rem`.
- **State:** Resting icon controls use muted foreground, hover into muted fill plus foreground text, and active scale feedback.
- **Focus:** Use the focus ring for the surrounding surface: background, card, muted, or popover.

### Chips

- **Style:** Rounded pills with dense padding, compact bold labeling, and monochrome foreground/background pairing.
- **State:** Selected chips invert into the primary monochrome pair. Unselected chips stay muted, bordered, and quiet.
- **Use:** Values, active indicators, card kinds, cloze tokens, and compact status text. Do not use chips as decoration.

### Cards / Containers

- **Corner Style:** Signature study surfaces use large corners (`2rem`). Dialog-like or form panels use `1.5rem` to `2rem`. Compact rows, menus, and dense secondary surfaces use `1rem` to `1.25rem`.
- **Background:** Light-mode cards use `card`; dark-mode cards use `dark-card`. Inputs and popovers use their semantic surface tokens.
- **Shadow Strategy:** Use Card Inset Highlight at rest and Floating Shadow only for popovers, menus, dialogs, and actual floating surfaces.
- **Border:** Always prefer a 1px neutral border. Thick side borders and colored accents are forbidden.
- **Internal Padding:** Study cards use `1.5rem` to `2rem`; note editors use `2rem`; dense rows use `1.25rem` to `1.5rem`.

### Layout Containers

- **Mobile Lane:** `390px`, expanding to `430px` and `520px`.
- **Editor Lane:** `820px` for focused authoring.
- **Page Lanes:** `760px` for narrow settings/trash surfaces and `960px` for standard detail pages.
- **App Frame:** `1360px` for desktop shell content.
- **Section and Copy:** `45rem` for list/search sections and `52ch` for descriptive copy.
- **Desktop Shell:** Fixed `17rem` sidebar with a border-right divider and app content framed by `2rem` to `2.5rem` horizontal padding.

### Inputs / Fields

- **Search Inputs:** Pill-shaped, 1px bordered, `3.25rem` minimum height, icon at `1.25rem` left padding, medium-weight text, muted placeholder.
- **Settings Number Inputs:** Compact pills, `2.5rem` height, `6rem` width, right-aligned technical text.
- **Editor Fields:** Transparent fields nested inside card surfaces. Title fields use study-title type; body textareas use editor-body type and quiet editor focus.
- **Focus:** Inputs use a subdued 2px ring at 40% primary strength when the field is already inside a larger study surface.
- **Error / Disabled:** Error text uses destructive tokens. Disabled controls reduce opacity and block pointer interactions.

### Navigation

- **Desktop Sidebar:** Sticky `17rem` rail with card surface opacity, 1px divider, compact bold nav items, and pill active state.
- **Bottom Navigation:** Fixed bottom bar with card opacity, 1px top border, backdrop blur, safe-area padding, uppercase labels, and muted active fills.
- **Page Headers:** Eyebrow labels are uppercase and muted; page titles use display type; descriptions stay capped to `52ch`.
- **Back and Close Controls:** Circular icon controls, not textual links, unless the screen needs a persistent labeled action.

### Menus / Dialogs

- **Dropdown Menus:** Popover surface, compact radius, `0.5rem` padding, floating shadow, and `type-action` menu rows with rounded `1rem` hover states.
- **Dialogs:** Centered card surfaces with `2rem` radius, 1px border, floating shadow, and no decorative overlay treatment.
- **Modal Rule:** Modals are for blocking confirmation, mobile picker adaptation, or destructive decisions. Exhaust inline and progressive surfaces first.

### Loading / Feedback

- **Skeletons:** Use `loading-shimmer` on semantic skeleton bases and disable shimmer under `prefers-reduced-motion`.
- **Empty States:** Large card surfaces with a muted circular icon well, study-title heading, concise muted copy, and one primary action when possible.
- **Progress:** Progress rings and bars are monochrome. The fill is primary; the track is muted or border.

### Signature Component

**Study Cards** are large, rounded, monochrome containers for decks, notes, search groups, review content, and editor forms. They should feel like durable study objects, not marketing cards. Use clear hierarchy, generous padding, exact action placement, and no ornamental color.

### Named Rules

**The Component Vocabulary Rule.** If the same action type appears twice, it must use the same visual vocabulary. A save button, review button, and active nav item can vary by context, but not by mood.

## Do's and Don'ts

### Do:

- **Do** use warm graphite monochrome as the default surface language.
- **Do** reserve red for destructive and error states only.
- **Do** use semantic CSS variables instead of hard-coded color literals.
- **Do** use 1px neutral borders, tonal surfaces, and disciplined spacing to create hierarchy.
- **Do** use Geist Sans for product UI and focused study reading, with Geist Mono reserved for code, counts, percentages, and technical fragments.
- **Do** make loading, empty, error, and pending states feel like first-class study workflow states.
- **Do** protect the user's flow state with predictable controls, quiet labels, and minimal interruption.
- **Do** preserve reduced-motion behavior for shimmer and transitional effects.

### Don't:

- **Don't** make Clear look like a generic SaaS dashboard.
- **Don't** use decorative hero metrics, marketing-style card grids, presentation-first layouts, or visual noise that makes the app feel like it is selling itself.
- **Don't** use gamified streak worship, competitive rankings, confetti, badge economies, dopamine-first rewards, or noisy motivational language.
- **Don't** make learning feel shallow, childish, frantic, or reward-driven.
- **Don't** add color accents for decoration, status theater, icon variety, or brand energy. Color is for errors only.
- **Don't** use gradient text, side-stripe borders, decorative glassmorphism, neon glows, or thick colored borders.
- **Don't** add modals as the first solution when an inline or progressive surface can carry the task.
- **Don't** introduce serif, script, novelty display type, or decorative italics into product chrome.
