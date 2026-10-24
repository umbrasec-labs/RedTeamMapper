# Red Team Mapper v4

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![Theme](https://img.shields.io/badge/theme-charcoal%20%2F%20orange-F25623)

**An interactive map of red team / offensive security operations.**

v4 rebuilds the v3 single-page reference as a navigable map: a radial operation lifecycle, reference
sections rendered as expandable card grids, end-to-end operation flow chains, and global search. The v3
content is carried across unchanged by a build-time extractor and modelled as typed data.

**Live version:** https://umbrasec-labs.github.io/RedTeamMapper/
**Companion project:** [Blue Team Mapper](https://umbrasec-labs.github.io/BlueTeamMapper/), the defensive counterpart.

## Intended use

This is a planning and training reference for **authorised** red team, purple team and detection-engineering
work. Understanding how offensive operations are structured is what lets defenders build coverage against
them. Use it only where you have explicit permission to test.

## Views

| Route | View | What it does |
| --- | --- | --- |
| `/` · `/?phase=:id` | **Lifecycle Map** | A radial ring of the 7 operation phases (Infrastructure → Initial Access → Execution → Defense Evasion → Privilege & Movement → Collection → Exfiltration & Impact). Select a phase to open a panel listing its reference sections and related flow chains. |
| `/sections/:id?card=` | **Section reader** | Each v3 reference section as an expandable card grid, with callouts, code blocks and prev/next navigation. Content is preserved from the original page and modelled as cards. |
| `/flows` · `/flows/:id` | **Flow Chains** | Every end-to-end operation chain as a `node → node → node` sequence, with the transition named on each arrow. Deep-links scroll to a chain. |
| `/about` | **About** | What the mapper is and the terms of use. |

**Global search** (`⌘K`, `Ctrl+K` or `/`) covers sections, individual reference cards, flow chains and flow
steps, and jumps straight to the match.

### Keyboard

| Keys | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` / `/` | Open search; `↑` `↓` to move, `↵` to open |
| `Esc` | Close search |
| `g` then `o` `f` `a` | Go to the map, flows, about |

## Tech Stack

- **Vite + React 18 + TypeScript** (strict)
- **Tailwind CSS 3** with a custom charcoal / orange theme (`tailwind.config.js`)
- **Framer Motion** for the search and drawer transitions (respects `prefers-reduced-motion`)
- **Fuse.js** for client-side fuzzy search
- **Lucide React** icons
- **Zustand** for the little global UI state there is
- **React Router 6** with `BrowserRouter` and a GitHub Pages 404 fallback
- Fonts self-hosted via Fontsource: **Inter Tight** (display and body, matching umbrasec.dev), **JetBrains Mono** (data)

No backend, no runtime API calls, no external UI component library.

## Content extraction

The v3 page is kept verbatim in `legacy/index.html`. `scripts/extract_legacy.py` is a mechanical transform
that reads it and emits:

- `src/data/legacy/sections.json` - one entry per section: callouts, cards (accent hue, tag, title,
  summary, item list) and code blocks
- `src/data/legacy/flows.json` - the operation flow chains as typed step sequences
- `src/data/legacy/nav.json` - the sidebar groups
- `src/data/legacy/phases.json` - the 7 lifecycle phases and the section ids each one covers

The v3 card markup maps directly onto the card model the app renders, so the script rewrites nothing in the
content; re-run it with `npm run extract` (needs `python3`, no third-party packages).

## Getting Started

Requires Node 20+ (22 recommended).

```bash
npm install
npm run dev        # http://localhost:5173/RedTeamMapper/
```

Other scripts:

```bash
npm run typecheck  # tsc -b
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
npm run extract    # re-extract v3 content into src/data/legacy/ (needs python3)
```

## Deploying to GitHub Pages

The build output in `dist/` is a plain static site.

### Automatic (recommended)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

1. In the repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
   (v3 was served straight from the branch, so this switch is required once.)
2. Push to `main`. The workflow runs `npm ci && npm run build` and publishes `dist/`.

### Base path

Vite's `base` is read from `VITE_BASE` and defaults to `/RedTeamMapper/`.

| Hosting | Build command |
| --- | --- |
| Project site `https://<owner>.github.io/RedTeamMapper/` | `npm run build` |
| Project site under a different repo name | `VITE_BASE=/<repo>/ npm run build` |
| User/org site `https://<owner>.github.io/` or a custom domain | `VITE_BASE=/ npm run build` |

The router's `basename` follows `import.meta.env.BASE_URL`, so nothing else needs changing.

### Client-side routes on Pages

GitHub Pages has no SPA rewrites, so a deep link such as `/RedTeamMapper/flows/phishing` would normally 404.
The build emits a `404.html` (see `githubPagesSpaFallback` in `vite.config.ts`) that encodes the path into
the query string and redirects to the app root; a small inline script in `index.html` restores the real URL.

## License

MIT. See [LICENSE](LICENSE).
