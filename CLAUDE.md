# CLAUDE.md - Cavagraphics Art Gallery

## Project Overview

Static art gallery website for **James P. Cavanaugh**, showcasing ~90 artworks across 14 mediums/styles (oil, pen & ink, colored pencil, woodcut, etching, etc.). The site is a single-page application built with vanilla HTML/CSS/JS and Bootstrap. Artwork data is loaded from a JSON file and rendered dynamically. The gallery features scroll-based background transitions that change the page atmosphere as users browse different art styles.

**Live shop**: External link to `cavagraphics.printful.me` (Printful e-commerce).

## Tech Stack

- **HTML5** / **CSS3** / **Vanilla JavaScript (ES6+)**
- **Bootstrap 5.3.3** (loaded via CDN with SRI hashes)
- **No build system** — no bundler, no transpiler, no package.json
- **No testing framework** — no tests exist
- **No linting/formatting tools** configured
- **No CI/CD pipeline**

## Project Structure

```
├── index.html              # Single page entry point
├── css/
│   └── style.css           # All styles (269 lines)
├── js/
│   └── main.js             # All application logic (323 lines)
├── data/
│   └── artworks.json       # Artwork metadata (90 records)
├── images/                 # ~64MB of artwork images
│   ├── james-cavanaugh-oneline-tight.svg  # Artist logo/signature
│   ├── colored-pencil/     # 29 images
│   ├── pen-ink/            # 14 images
│   ├── silk-screen/        # 11 images
│   ├── woodcut/            # 8 images
│   ├── oil/                # 7 images
│   ├── etching/            # 5 images
│   ├── cross-hatching/     # 4 images
│   ├── pastels/            # 3 images
│   ├── pencil/             # 3 images
│   ├── lithograph/         # 2 images
│   ├── charcoal/           # 1 image
│   ├── mezzotint/          # 1 image
│   ├── sculpture/          # 1 image
│   └── watercolor/         # 1 image
├── icons/                  # Favicons and PWA icons
│   ├── favicon-*.png       # Multiple sizes (16–512px)
│   ├── favicon.ico
│   └── site.webmanifest    # PWA manifest
├── style-types.txt         # SVG conversion notes
└── README.md               # Minimal (SVG creation commands only)
```

## Development

### Running Locally

No build step required. Serve the root directory with any static HTTP server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

### Key Files to Understand

| File | Purpose |
|------|---------|
| `js/main.js` | Core logic: fetches `artworks.json`, renders gallery sections grouped by style, sets up IntersectionObserver for scroll-based background switching |
| `css/style.css` | All styling including per-style background gradients (`body.style-oil`, `body.style-pastels`, etc.), card layout, animations |
| `data/artworks.json` | Array of artwork objects — the single source of truth for all gallery content |
| `index.html` | Page shell: navbar, hero section, `<main id="gallery-root">` (populated by JS), footer |

## Architecture & Key Patterns

### Data-Driven Rendering

All artwork content lives in `data/artworks.json`. The JS fetches this file on page load and dynamically generates the entire gallery. No artwork HTML is hardcoded.

### Artwork JSON Schema

Each artwork object in `artworks.json` follows this structure:

```json
{
  "id": "FR-01",
  "title": "Flower Bush",
  "style": "colored-pencil",
  "year": 2010,
  "size": "4.5×6.5",
  "medium": "Colored pencil",
  "description": "",
  "image": "/images/colored-pencil/fr-01.jpg",
  "featured": true,
  "background": true
}
```

- **`id`**: Unique identifier (e.g., `FR-01`, `WC-01`)
- **`style`**: Must match a key in `STYLE_CONFIG` in `main.js` (kebab-case)
- **`image`**: Path follows pattern `/images/{style}/{id-lowercase}.jpg`
- **`featured`** (optional): If `true`, appears in the Featured Works section at top
- **`background`** (optional): If `true`, that artwork's image is used as a blurred background for its style section

### Style Configuration

The `STYLE_CONFIG` object in `js/main.js` maps style keys to display labels and descriptions. When adding a new style:
1. Add the key to `STYLE_CONFIG` in `main.js`
2. Add a corresponding `body.style-{key}` CSS rule in `style.css` for the background gradient
3. Create the image directory under `images/`
4. Add artwork entries in `artworks.json`

### Scroll-Based Backgrounds

`IntersectionObserver` watches `.style-section` elements. When a section enters the viewport (threshold: 0.3), the body gets a `style-{key}` class that applies a unique background gradient. If an artwork is marked `"background": true`, its image is displayed as a faded overlay via `body::before`.

### Gallery Rendering Flow

1. `DOMContentLoaded` fires
2. `initGallery()` fetches `data/artworks.json`
3. Artworks are grouped by `style` key using `groupBy()`
4. Featured artworks (if any) render in a dedicated top section
5. Each style group renders as a `<section class="style-section">` with a card grid
6. Within each section, featured artworks sort first, then alphabetical by title
7. `setupStyleObserver()` attaches IntersectionObserver for background transitions

## Conventions

### Code Style
- 2-space indentation in all files
- Template literals for HTML generation in JS
- System font stack (no custom fonts loaded)
- Bootstrap utility classes for layout

### Naming
- Style keys: **kebab-case** (e.g., `pen-ink`, `colored-pencil`, `cross-hatching`)
- Image directories match style keys exactly
- Artwork IDs: uppercase prefix + number (e.g., `FR-01`, `WC-01`)
- Image filenames: lowercase ID (e.g., `fr-01.jpg`)

### CSS Organization
- Base styles at top
- Component styles (navbar, hero, cards, sections)
- Per-style background gradients (`body.style-*` rules)
- Animations at bottom

## Known Issues

- **CSS filename mismatch**: `index.html:17` references `/css/styles.css` (with 's') but the actual file is `css/style.css`. One of these needs to be corrected for styles to load.
- **No `.gitignore`**: Repository has no `.gitignore` file.
- **Aggressive image CSS**: `style.css` has a bare `img` selector with `!important` rules (lines 121-132) that affects all images on the page, not just artwork images.
- **No error boundary**: If `artworks.json` fails to load, a generic error message is shown but there's no retry mechanism.

## Adding New Artwork

1. Add the image file to the appropriate `images/{style}/` directory
2. Add a new entry to `data/artworks.json` following the schema above
3. If it's a new style, update `STYLE_CONFIG` in `main.js` and add a `body.style-{key}` rule in `style.css`

## External Dependencies (CDN)

- Bootstrap CSS 5.3.3: `cdn.jsdelivr.net` (with SRI hash)
- Bootstrap JS 5.3.3: `cdn.jsdelivr.net` (with SRI hash)

No npm packages or local dependencies.
