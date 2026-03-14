/**
 * Palette System — shared color palettes for all experiments
 * ===========================================================
 *
 * TWO PALETTE FORMATS
 * --------------------
 * Experiments render in different ways, so we provide two formats:
 *
 *   1. RGB palettes — (t: 0→1) => [r, g, b] (values 0–255)
 *      Used by experiments that write to ImageData pixel buffers (003, 004).
 *
 *   2. CSS palettes — (t: 0→1) => "hsla(...)" string
 *      Used by experiments that set ctx.fillStyle (001, 002).
 *
 * Both map a parameter t ∈ [0, 1] to a color. t can be anything: particle
 * age, noise value, density, concentration — whatever the experiment needs.
 *
 * WHY HSL INSTEAD OF RGB?
 * -----------------------
 * RGB (Red, Green, Blue) is how screens emit light, but it's unintuitive
 * for humans. HSL (Hue, Saturation, Lightness) maps to how we think:
 *   - Hue (0–360°): color wheel position. 0 = red, 120 = green, 240 = blue
 *   - Saturation (0–100%): intensity. 0% = gray, 100% = vivid
 *   - Lightness (0–100%): brightness. 0% = black, 50% = pure, 100% = white
 *
 * For generative art, HSL lets us walk smoothly around the color wheel,
 * control mood via saturation, and create gradients that don't pass through
 * muddy intermediate tones (a common RGB interpolation problem).
 */

// -----------------------------------------------------------------------
// RGB Palettes — (t: 0→1) => [r, g, b]
// -----------------------------------------------------------------------
//
// These are the primary palette format. Each maps a normalized value to
// an RGB triple. All experiments can use these — for canvas fillStyle,
// just wrap with rgbToCSS().
// -----------------------------------------------------------------------

export const rgbPalettes = {
  /** Pure grayscale — black to white */
  mono(t) {
    const v = t * 255;
    return [v, v, v];
  },

  /** Ink — cool-tinted grayscale, like pen on paper */
  ink(t) {
    return [t * 200, t * 210, t * 230];
  },

  /** Ember — black → red → orange → yellow → white (fire tones) */
  ember(t) {
    if (t < 0.33) {
      const s = t / 0.33;
      return [s * 180, s * 30, s * 5];
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      return [180 + s * 75, 30 + s * 130, 5 + s * 10];
    }
    const s = (t - 0.66) / 0.34;
    return [255, 160 + s * 95, 15 + s * 200];
  },

  /** Ice — black → deep blue → cyan → white */
  ice(t) {
    if (t < 0.5) {
      const s = t / 0.5;
      return [s * 20, s * 60, s * 180];
    }
    const s = (t - 0.5) / 0.5;
    return [20 + s * 235, 60 + s * 195, 180 + s * 75];
  },

  /** Emerald — black → dark green → bright green → pale */
  emerald(t) {
    if (t < 0.5) {
      const s = t / 0.5;
      return [s * 15, s * 180, s * 80];
    }
    const s = (t - 0.5) / 0.5;
    return [15 + s * 180, 180 + s * 75, 80 + s * 140];
  },

  /** Neon — black → purple → magenta → hot pink → white */
  neon(t) {
    if (t < 0.33) {
      const s = t / 0.33;
      return [s * 100, s * 10, s * 160];
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      return [100 + s * 155, 10 + s * 30, 160 + s * 40];
    }
    const s = (t - 0.66) / 0.34;
    return [255, 40 + s * 160, 200 + s * 55];
  },

  /** Plasma — dark blue → purple → magenta → orange → yellow */
  plasma(t) {
    if (t < 0.25) {
      const s = t / 0.25;
      return [13 + s * 90, 8 + s * 2, 135 + s * 30];
    } else if (t < 0.5) {
      const s = (t - 0.25) / 0.25;
      return [103 + s * 97, 10 + s * 15, 165 - s * 45];
    } else if (t < 0.75) {
      const s = (t - 0.5) / 0.25;
      return [200 + s * 43, 25 + s * 95, 120 - s * 80];
    }
    const s = (t - 0.75) / 0.25;
    return [243 + s * 12, 120 + s * 110, 40 - s * 30];
  },

  /** Ocean — dark navy → teal → aquamarine → foam white */
  ocean(t) {
    if (t < 0.4) {
      const s = t / 0.4;
      return [s * 5, s * 40, 30 + s * 90];
    } else if (t < 0.7) {
      const s = (t - 0.4) / 0.3;
      return [5 + s * 30, 40 + s * 130, 120 + s * 60];
    }
    const s = (t - 0.7) / 0.3;
    return [35 + s * 180, 170 + s * 70, 180 + s * 60];
  },

  /** Sunset — dark purple → magenta → red → orange → gold */
  sunset(t) {
    if (t < 0.25) {
      const s = t / 0.25;
      return [30 + s * 70, s * 10, 40 + s * 60];
    } else if (t < 0.5) {
      const s = (t - 0.25) / 0.25;
      return [100 + s * 100, 10 + s * 15, 100 - s * 60];
    } else if (t < 0.75) {
      const s = (t - 0.5) / 0.25;
      return [200 + s * 55, 25 + s * 75, 40 - s * 30];
    }
    const s = (t - 0.75) / 0.25;
    return [255, 100 + s * 100, 10 + s * 50];
  },

  /** Spectrum — full rainbow, hue mapped across [0, 360] */
  spectrum(t) {
    // Convert hue (0–360) to RGB using the standard algorithm
    const h = t * 360;
    const s = 0.85, l = 0.55;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  },

  /** Warm — black → deep red → orange → golden yellow */
  warm(t) {
    if (t < 0.33) {
      const s = t / 0.33;
      return [s * 160, s * 20, s * 5];
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      return [160 + s * 80, 20 + s * 80, 5];
    }
    const s = (t - 0.66) / 0.34;
    return [240 + s * 15, 100 + s * 120, 5 + s * 60];
  },

  /** Cold — black → indigo → blue → lavender → pale blue */
  cold(t) {
    if (t < 0.4) {
      const s = t / 0.4;
      return [s * 40, s * 20, s * 140];
    } else if (t < 0.7) {
      const s = (t - 0.4) / 0.3;
      return [40 + s * 30, 20 + s * 60, 140 + s * 60];
    }
    const s = (t - 0.7) / 0.3;
    return [70 + s * 120, 80 + s * 100, 200 + s * 40];
  },

  /** Rust — dark brown → burnt orange → tan */
  rust(t) {
    if (t < 0.5) {
      const s = t / 0.5;
      return [40 + s * 120, 15 + s * 45, 5 + s * 10];
    }
    const s = (t - 0.5) / 0.5;
    return [160 + s * 70, 60 + s * 100, 15 + s * 80];
  },
};

// -----------------------------------------------------------------------
// Custom palette factory — build a palette from any user-selected color
// -----------------------------------------------------------------------
//
// Creates a gradient: black → user color → white. This ensures the palette
// always has good contrast on a dark background (low t = dark, high t = light)
// and works with any base color the user picks.
// -----------------------------------------------------------------------

/**
 * Create a custom RGB palette from a hex color string.
 * @param {string} hex - CSS hex color, e.g. "#ff6600"
 * @returns {function} palette function (t: 0-1) => [r, g, b]
 */
export function makeCustomPalette(hex) {
  const cr = parseInt(hex.slice(1, 3), 16);
  const cg = parseInt(hex.slice(3, 5), 16);
  const cb = parseInt(hex.slice(5, 7), 16);

  return function custom(t) {
    if (t < 0.5) {
      // Black → chosen color
      const s = t / 0.5;
      return [cr * s, cg * s, cb * s];
    }
    // Chosen color → white
    const s = (t - 0.5) / 0.5;
    return [cr + (255 - cr) * s, cg + (255 - cg) * s, cb + (255 - cb) * s];
  };
}

// -----------------------------------------------------------------------
// Helpers for converting RGB palettes to CSS strings
// -----------------------------------------------------------------------

/** Convert [r, g, b] + alpha to a CSS rgba() string for ctx.fillStyle */
export function rgbToCSS(rgb, alpha = 1) {
  return `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${alpha})`;
}

/** Get all preset palette names */
export function paletteNames() {
  return Object.keys(rgbPalettes);
}

// -----------------------------------------------------------------------
// Curated swatch colors — a handpicked grid of nice colors for the
// custom palette picker. 4 rows × 8 columns = 32 swatches covering
// warm, cool, neutral, neon, pastel, and earth tones.
// -----------------------------------------------------------------------

export const SWATCH_COLORS = [
  // Row 1 — vivid primaries & secondaries
  '#ff3b30', '#ff6b00', '#ffcc00', '#34c759',
  '#00c7be', '#007aff', '#5856d6', '#af52de',
  // Row 2 — softer / pastel variants
  '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c',
  '#66d9e8', '#74c0fc', '#9775fa', '#da77f2',
  // Row 3 — deep / rich tones
  '#c92a2a', '#d9480f', '#e67700', '#2b8a3e',
  '#0b7285', '#1864ab', '#5f3dc4', '#862e9c',
  // Row 4 — earth, neutrals, and special
  '#a0522d', '#8b6914', '#556b2f', '#4a7c59',
  '#4682b4', '#708090', '#e0e0e0', '#ffffff',
];

/**
 * Build a floating swatch picker overlay.
 *
 * Creates a small overlay panel with a grid of color swatches that appears
 * anchored to the given trigger element (typically the palette dropdown).
 * Clicking a swatch selects it and calls onSelect. Clicking outside dismisses.
 *
 * @param {HTMLElement} anchor - element to position the overlay near
 * @param {function} onSelect - called with hex string when a swatch is clicked
 * @returns {{ show: () => void, hide: () => void, setActive: (hex) => void }}
 */
export function buildSwatchPicker(anchor, onSelect) {
  // --- Overlay panel ---
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed',
    zIndex: '20',
    background: 'rgba(10, 10, 15, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px',
    display: 'none',
    width: 'fit-content',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  });

  // --- Grid inside the panel ---
  const grid = document.createElement('div');
  Object.assign(grid.style, {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 22px)',
    gap: '5px',
  });
  panel.appendChild(grid);

  let activeEl = null;

  function markActive(el) {
    if (activeEl) {
      activeEl.style.borderColor = 'transparent';
      activeEl.style.transform = '';
    }
    el.style.borderColor = '#fff';
    el.style.transform = 'scale(1.1)';
    activeEl = el;
  }

  for (const hex of SWATCH_COLORS) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      width: '22px',
      height: '22px',
      borderRadius: '5px',
      border: '2px solid transparent',
      cursor: 'pointer',
      background: hex,
      transition: 'border-color 0.15s, transform 0.15s',
    });
    el.dataset.hex = hex;

    el.addEventListener('mouseenter', () => {
      if (el !== activeEl) {
        el.style.transform = 'scale(1.18)';
        el.style.borderColor = 'rgba(255,255,255,0.4)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (el !== activeEl) {
        el.style.transform = '';
        el.style.borderColor = 'transparent';
      }
    });
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      markActive(el);
      onSelect(hex);
    });

    grid.appendChild(el);
  }

  // Default active = first swatch
  if (grid.children[0]) markActive(grid.children[0]);

  document.body.appendChild(panel);

  // --- Position and show/hide ---
  function positionPanel() {
    const rect = anchor.getBoundingClientRect();
    // Temporarily show off-screen to measure actual size
    panel.style.visibility = 'hidden';
    panel.style.display = '';
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    panel.style.display = 'none';
    panel.style.visibility = '';

    // Try to place to the left of the controls panel, vertically centered on anchor
    let left = rect.left - pw - 10;
    let top = rect.top - ph / 2 + rect.height / 2;

    // If not enough room on the left, fall back to below the anchor
    if (left < 8) {
      left = rect.right - pw;
      top = rect.bottom + 6;
      if (left < 8) left = 8;
    }
    // Clamp vertically
    if (top < 8) top = 8;
    if (top + ph > window.innerHeight - 8) top = window.innerHeight - 8 - ph;

    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
  }

  function show() {
    positionPanel();
    panel.style.display = '';
    // Dismiss on outside click (added on next tick so the triggering click doesn't fire it)
    setTimeout(() => document.addEventListener('click', outsideClick), 0);
  }

  function hide() {
    panel.style.display = 'none';
    document.removeEventListener('click', outsideClick);
  }

  function outsideClick(e) {
    if (!panel.contains(e.target) && !anchor.contains(e.target)) hide();
  }

  // Stop clicks inside the panel from propagating to the outside-click handler
  panel.addEventListener('click', (e) => e.stopPropagation());

  return {
    show,
    hide,
    toggle() { panel.style.display === 'none' ? show() : hide(); },
    setActive(hex) {
      const el = grid.querySelector(`[data-hex="${hex}"]`);
      if (el) markActive(el);
    },
  };
}

// -----------------------------------------------------------------------
// Legacy CSS-string palettes (kept for backward compatibility with 001/002)
// -----------------------------------------------------------------------

function hsla(h, s, l, a = 1) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export const palettes = {
  ink(t) {
    return hsla(220, 5, 60 + t * 30, 0.6 + t * 0.3);
  },
  warm(t) {
    return hsla(t * 45, 70 + t * 20, 45 + t * 20, 0.7 + t * 0.25);
  },
  cold(t) {
    return hsla(200 + t * 60, 50 + t * 30, 40 + t * 30, 0.6 + t * 0.3);
  },
  spectrum(t) {
    return hsla(t * 360, 75, 55, 0.7 + t * 0.2);
  },
  rust(t) {
    return hsla(15 + t * 20, 50 + t * 30, 25 + t * 35, 0.65 + t * 0.3);
  },
  neon(t) {
    return hsla((300 + t * 120) % 360, 90 + t * 10, 50 + t * 15, 0.8 + t * 0.15);
  },
};

export function getPalette(name) {
  return palettes[name] || palettes.spectrum;
}
