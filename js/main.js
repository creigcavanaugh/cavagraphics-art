// js/main.js

// Map internal style keys to nice labels and optional descriptions
const STYLE_CONFIG = {
  oil: {
    label: "Oil Paintings",
    description: "Rich textures and layered color studies in oil on canvas."
  },
  "cross-hatching": {
    label: "Cross Hatching",
    description:
      "Intricate lines built up to create depth, shadow, and energy in the scene."
  },
  pastels: {
    label: "Pastels",
    description:
      "Soft, luminous works exploring color and atmosphere through pastel sticks."
  },
  "silk-screen": {
    label: "Silk Screen",
    description:
      "Bold, graphic impressions using layered inks and screens."
  },
  "pen-ink": {
    label: "Pen & Ink",
    description:
      "Precise line work capturing form, texture, and light in monochrome."
  },
  "colored-pencil": {
    label: "Colored Pencil",
    description:
      "Layered strokes of colored pencil bringing detail and color to everyday scenes."
  },
  charcoal: {
    label: "Charcoal",
    description:
      "Expressive tonal drawings using soft and dramatic charcoal marks."
  },
  woodcut: {
    label: "Woodcut",
    description:
      "Carved blocks printed in ink, creating strong contrasts and textures."
  },
  etching: {
    label: "Etching",
    description:
      "Intaglio prints with fine lines and subtle tonal variations."
  },
  lithograph: {
    label: "Lithograph",
    description:
      "Planographic prints using drawn imagery on stone or plate."
  },
  mezzotint: {
    label: "Mezzotint",
    description:
      "Prints with rich, velvety blacks and delicate gradations of tone."
  },
  pencil: {
    label: "Pencil",
    description:
      "Graphite drawings exploring form, value, and composition."
  },
  watercolor: {
    label: "Watercolor",
    description:
      "Transparent washes of pigment capturing light and atmosphere."
  },
  sculpture: {
    label: "Sculpture",
    description:
      "Three-dimensional work exploring form, texture, and light."
  }
  // Add more styles here as needed
};

const FEATURED_MAX = 5;

// Helper: group array of items by key
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// Render the gallery sections
async function initGallery() {
  const root = document.getElementById("gallery-root");
  if (!root) return;

  try {
    // IMPORTANT: relative path for Cloudflare + local dev
    const res = await fetch("data/artworks.json");
    if (!res.ok) {
      throw new Error("Could not load artworks.json");
    }

    const artworks = await res.json();

    // Collect featured artworks
    const featuredArtworks = artworks.filter((a) => a.featured === true);

    // Group by style
    const byStyle = groupBy(artworks, (a) => a.style || "other");
    const styleKeys = Object.keys(byStyle).sort();

    const fragments = document.createDocumentFragment();

    // 1) Dedicated "Featured Works" section at the top (items 3 & 5)
    if (featuredArtworks.length > 0) {
      const featuredSection = renderFeaturedSection(featuredArtworks);
      fragments.appendChild(featuredSection);
    }

    // 2) Style sections, with featured at top and optional background art
    styleKeys.forEach((styleKey) => {
      const section = document.createElement("section");
      section.className = "style-section";
      section.dataset.style = styleKey;

      const config = STYLE_CONFIG[styleKey] || {
        label: styleKey[0].toUpperCase() + styleKey.slice(1),
        description: ""
      };

      // Copy + sort artworks for this style so featured come first
      const artworksForStyle = byStyle[styleKey].slice();
      artworksForStyle.sort((a, b) => {
        const aFeatured = a.featured === true ? 1 : 0;
        const bFeatured = b.featured === true ? 1 : 0;
        if (aFeatured !== bFeatured) {
          return bFeatured - aFeatured; // featured first
        }
        const aTitle = (a.title || "").toLowerCase();
        const bTitle = (b.title || "").toLowerCase();
        return aTitle.localeCompare(bTitle);
      });

      // Optional: find an artwork marked as background for this style
      const bgArt = artworksForStyle.find((a) => a.background === true);
      if (bgArt && bgArt.image) {
        section.classList.add("style-section-has-bg");
        section.style.setProperty("--section-bg-image", `url(${bgArt.image})`);
      }

      section.innerHTML = `
        <div class="container">
          <div class="style-section-header">
            <div class="d-flex align-items-baseline justify-content-between gap-3">
              <div>
                <h2 class="h3 mb-1">${config.label}</h2>
                ${
                  config.description
                    ? `<p class="small text-muted mb-0">${config.description}</p>`
                    : ""
                }
              </div>
              <span class="style-badge text-muted d-none d-md-inline">
                ${artworksForStyle.length} piece${
        artworksForStyle.length !== 1 ? "s" : ""
      }
              </span>
            </div>
          </div>

          <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 artwork-grid">
            ${artworksForStyle.map((art) => renderArtworkCard(art)).join("")}
          </div>
        </div>
      `;

      fragments.appendChild(section);
    });

    root.appendChild(fragments);

    // After rendering, set up scroll-based background switching
    setupStyleObserver();
  } catch (err) {
    console.error(err);
    root.innerHTML =
      '<div class="container py-5 text-center text-muted">Unable to load artwork at this time.</div>';
  }
}

// Render a single artwork card as HTML string
function renderArtworkCard(art) {
  const { title, year, medium, size, description, image, featured } = art;

  const metaParts = [];
  if (year) metaParts.push(year);
  if (medium) metaParts.push(medium);
  if (size) metaParts.push(size);

  const metaText = metaParts.join(" • ");

  return `
    <div class="col">
      <article class="card artwork-card h-100">
        <div class="ratio ratio-4x3">
          <img
            src="${image}"
            alt="${title ? title.replace(/"/g, "&quot;") : "Artwork"}"
            loading="lazy"
          />
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <h3 class="h6 mb-0">${title || "Untitled"}</h3>
            ${
              featured
                ? '<span class="badge bg-warning text-dark ms-2">Featured</span>'
                : ""
            }
          </div>
          ${
            metaText ? `<p class="artwork-meta mb-2">${metaText}</p>` : ""
          }
          ${
            description
              ? `<p class="artwork-description mb-0">${description}</p>`
              : ""
          }
        </div>
      </article>
    </div>
  `;
}

// Render the dedicated "Featured Works" section (items 3 & 5)
function renderFeaturedSection(featuredArtworks) {
  const section = document.createElement("section");
  section.className = "featured-section";

  const topFeatured = featuredArtworks.slice(0, FEATURED_MAX);

  section.innerHTML = `
    <div class="container">
      <div class="featured-section-header d-flex flex-wrap align-items-baseline justify-content-between gap-3 mb-3">
        <div>
          <h2 class="h3 mb-1">Featured Works</h2>
          <p class="small text-muted mb-0">
            A selection of highlighted pieces from across all styles.
          </p>
        </div>
        <span class="style-badge text-muted">
          ${featuredArtworks.length} total featured
        </span>
      </div>

      <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
        ${topFeatured.map((art) => renderArtworkCard(art)).join("")}
      </div>
    </div>
  `;

  return section;
}

// Use IntersectionObserver to toggle body style class as you scroll
function setupStyleObserver() {
  const sections = document.querySelectorAll(".style-section");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const body = document.body;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const styleKey = entry.target.dataset.style;
          // Remove any existing style-* classes
          body.className = body.className
            .split(" ")
            .filter((c) => !c.startsWith("style-"))
            .join(" ")
            .trim();

          if (styleKey) {
            body.classList.add(`style-${styleKey}`);
          }
        }
      });
    },
    {
      threshold: 0.4
    }
  );

  sections.forEach((section) => observer.observe(section));
}

// Footer year
function setFooterYear() {
  const el = document.getElementById("footer-year");
  if (el) el.textContent = new Date().getFullYear();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();
  initGallery();
});

