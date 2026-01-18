# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

All commands must be run from the `src/` directory (not project root):

```bash
cd src
npm run dev      # Start dev server at http://localhost:4321
npm run build    # Build production site to src/dist/
npm run preview  # Preview built site locally
```

## Architecture

**Stack:** Astro 5 static site generator with Tailwind CSS and TypeScript (strict mode)

**Project Layout:**
- `src/` - Application root containing package.json and Astro config
- `src/src/pages/` - File-based routing (`.astro` files become routes automatically)
- `src/src/components/` - Reusable Astro components (Header, Footer, Hero, TheaterCard, TheaterPage)
- `src/src/layouts/` - BaseLayout wraps all pages
- `src/src/data/theaters.json` - Campaign theater data (objectives, effects, interdependencies)
- `src/src/styles/global.css` - Tailwind directives and custom component classes

**Routing:** File structure maps to URLs (e.g., `pages/theaters/beach-assault.astro` → `/theaters/beach-assault`)

## Tailwind Theme

Custom D&D color palette defined in `src/tailwind.config.mjs`:
- `dnd-bg`, `dnd-bg-secondary` - Dark backgrounds
- `dnd-primary` - Gold accent (#c9a227)
- `dnd-secondary` - Dark red (#8b0000)
- `theater-assault`, `theater-siege`, `theater-portals`, `theater-air` - Theater-specific colors

Custom fonts: Cinzel (headings), Source Sans Pro (body)

## Deployment

AWS Amplify auto-deploys from main branch. Config in `amplify.yml`:
- Node 22, builds from src/ directory
- Output: `src/dist/`

## Campaign Context

This is an event site for "Operation Golden Sword" - a multi-table D&D campaign with 4 theaters of war (Beach Assault, Siege Train, Portals & Bridges, Air Battle). Campaign lore in `enemies-guide.md` and `story-outline.md`.
