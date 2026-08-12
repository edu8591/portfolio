# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multilingual portfolio website built with **Next.js 14** using the App Router. The site showcases projects, experience, and technologies with dark mode support and internationalization (English, Spanish, Japanese). Uses Tailwind CSS for styling and Framer Motion for animations.

## Development Commands

This repo uses **pnpm** (see `packageManager` in package.json).

- `pnpm dev` — Start development server at http://localhost:3000
- `pnpm build` — Create production build
- `pnpm start` — Run production build locally
- `pnpm lint` — Run ESLint checks
- `pnpm typecheck` — Run `tsc --noEmit`
- `pnpm test` — Run unit tests (Vitest, single pass)
- `pnpm test:watch` — Run unit tests in watch mode
- `pnpm test:e2e` — Run end-to-end tests (Playwright); boots its own dev server on port 3100

## Architecture

### Localization & Routing
- Uses `next-intl` for i18n with three supported locales: `en`, `es`, `jp` (default: `en`)
- Shared pathname routing: locale prefix in URL path (`/en`, `/es`, `/jp`)
- Navigation helpers in [src/i18n/routing.ts](src/i18n/routing.ts) expose wrapped `Link`, `redirect`, `useRouter`, `usePathname`
- Root `src/app/page.tsx` redirects to `/en` (default locale)
- Locale-specific layout and page at `src/app/[locale]/`

### Component Structure
- **UI Components** (`src/components/ui/`) — Radix UI-based primitives (Card, Badge, Separator, Tooltip)
- **Feature Components** (`src/components/`) — Sections and utilities: IntroSection, Experience, Projects, Technologies, NavLinks, etc.
- **Motion Components** — Framer Motion integration via MotionCard and AnimateEntryIcon for scroll-triggered animations
- **Data Components** — Fetch/render from constants: projects, experiences, technologies

### Data Organization
- Constants in `src/constants/` export arrays: projects, experiences, technologies, sections
- Strict typing via `src/types/` — Project, Experience, Technology, Section, IconType, etc.
- Projects rendered with `useMemo` to avoid recalculation

### Styling
- **Tailwind CSS** with custom theme (dark mode via `class` strategy)
- Custom utilities: `.no-scrollbar` for hiding scrollbars across browsers
- Custom animation: `spin-slow` (3s spin)
- Theme uses CSS variables: `--background`, `--foreground`, `--primary`, etc. bound to HSL
- Border radius: `lg` (--radius), `md` and `sm` offsets from it

### Themes & UI
- Dark mode support via `next-themes` provider
- Radix UI Tooltip and Separator components wrapped with custom styling
- Class Variance Authority (CVA) for component variants

## Key Files & Patterns

| File | Purpose |
|------|---------|
| `src/app/[locale]/page.tsx` | Main portfolio page with section layout |
| `src/app/[locale]/layout.tsx` | Locale layout with theme provider, navbar |
| `src/i18n/routing.ts` | i18n config and navigation helpers |
| `src/constants/projects.ts`, `technologies.ts`, `experiences.ts` | Data exports |
| `src/types/*.ts` | Type definitions for Project, Experience, Technology, etc. |
| `src/components/motion-card.tsx` | Scroll-triggered animation wrapper |
| `src/middleware.ts` | Locale routing middleware |

## Development Notes

- Components use `"use client"` directive for client-side interactivity (Framer Motion, themes)
- Server components preferred where possible
- Type safety enforced (strict: true in tsconfig.json)
- Path aliases via `@/*` → `./src/*`
- CI (`.github/workflows/main.yml`) currently runs the production build only

## Testing

Two harnesses, each with a distinct job. Test external behaviour at the seams, not implementation details.

| Layer | Tool | Location | Config |
|-------|------|----------|--------|
| Unit | Vitest (`node` environment) | `tests/unit/**/*.test.ts`, co-located `src/**/*.test.ts` | `vitest.config.ts` |
| E2E | Playwright (Chromium) | `tests/e2e/**/*.spec.ts` | `playwright.config.ts` |

- Unit tests import pure modules directly; `@/*` aliases resolve via `resolve.tsconfigPaths`
- E2E drives a real browser against a real dev server, faking only the outermost I/O
- No component/jsdom tests — the `node` environment is deliberate; component behaviour is covered by Playwright
- `include` matches `.ts` only, so a unit test must not be `.tsx` or it will be silently skipped
- First-time E2E setup needs `pnpm exec playwright install chromium`

## Caveman Skills

Always use caveman skills from `.agents/` directory for recurring or complex development tasks. Check `.agents/` for available skills before implementing custom solutions.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `edu8591/portfolio` (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily). See `docs/agents/domain.md`.
