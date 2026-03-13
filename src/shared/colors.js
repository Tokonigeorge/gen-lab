/**
 * Palette System — named color palettes for generative art
 * =========================================================
 *
 * WHY HSL INSTEAD OF RGB?
 * -----------------------
 * RGB (Red, Green, Blue) is how screens physically emit light, but it's
 * unintuitive for humans. "Make this color more muted" or "shift toward
 * warm tones" is awkward to express as changes to R, G, and B channels.
 *
 * HSL (Hue, Saturation, Lightness) maps to how we *think* about color:
 *   - Hue (0–360°): the color wheel position. 0 = red, 120 = green, 240 = blue
 *   - Saturation (0–100%): intensity. 0% = gray, 100% = vivid
 *   - Lightness (0–100%): brightness. 0% = black, 50% = pure color, 100% = white
 *
 * For generative art, HSL lets us:
 *   1. Walk smoothly around the color wheel by varying hue
 *   2. Control mood by adjusting saturation (muted vs. vivid)
 *   3. Create natural-feeling gradients that don't pass through muddy tones
 *      (a common problem with RGB interpolation)
 *
 * Each palette below is a function that takes t in [0, 1] and returns an
 * rgba string. This makes palettes composable with any parameter — noise
 * values, particle age, screen position, etc.
 */

/**
 * Helper: attempt to convert HSL to an RGB string with alpha.
 * We use CSS hsl() for readability, but some canvas operations need rgba.
 */
function hsla(h, s, l, a = 1) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

/**
 * Ink — monochrome, like pen on paper. Varies only in lightness.
 * Great for emphasizing structure over color.
 */
function ink(t) {
  const lightness = 60 + t * 30; // 60–90%: light strokes on dark bg
  return hsla(220, 5, lightness, 0.6 + t * 0.3);
}

/**
 * Warm — sunset tones: reds through oranges to golds.
 * Hue sweeps from 0 (red) through 45 (orange-gold).
 */
function warm(t) {
  const hue = t * 45; // 0 → 45
  const sat = 70 + t * 20;
  const light = 45 + t * 20;
  return hsla(hue, sat, light, 0.7 + t * 0.25);
}

/**
 * Cold — ocean and ice: deep blues through teals to pale cyan.
 * Hue sweeps from 200 (blue) to 260 (violet-blue).
 */
function cold(t) {
  const hue = 200 + t * 60;
  const sat = 50 + t * 30;
  const light = 40 + t * 30;
  return hsla(hue, sat, light, 0.6 + t * 0.3);
}

/**
 * Spectrum — full rainbow. Hue traverses the entire wheel (0–360°).
 * Useful for visualizing the full range of a noise field.
 */
function spectrum(t) {
  const hue = t * 360;
  return hsla(hue, 75, 55, 0.7 + t * 0.2);
}

/**
 * Rust — oxidation tones: dark browns through burnt orange to pale tan.
 * A narrow hue band (15–35) with strong saturation variation.
 */
function rust(t) {
  const hue = 15 + t * 20;
  const sat = 50 + t * 30;
  const light = 25 + t * 35;
  return hsla(hue, sat, light, 0.65 + t * 0.3);
}

/**
 * Neon — electric, high-saturation colors that pop on dark backgrounds.
 * Cycles through magenta → cyan → green with max saturation.
 */
function neon(t) {
  const hue = 300 + t * 120; // magenta (300) → cyan-ish (420/60)
  const sat = 90 + t * 10;
  const light = 50 + t * 15;
  return hsla(hue % 360, sat, light, 0.8 + t * 0.15);
}

/** All available palettes, keyed by name */
export const palettes = { ink, warm, cold, spectrum, rust, neon };

/** Get a palette function by name (defaults to "spectrum") */
export function getPalette(name) {
  return palettes[name] || palettes.spectrum;
}

/** Get all palette names */
export function paletteNames() {
  return Object.keys(palettes);
}
