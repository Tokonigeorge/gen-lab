/**
 * 2D Simplex Noise with Fractal/Octave Support
 * ==============================================================================
 *
 * WHAT IS GRADIENT NOISE?
 * -----------------------
 * In 1983, Ken Perlin needed a way to make computer graphics look natural.
 * Real-world textures — marble, wood, clouds — are random but *smooth*.
 * Pure random numbers (white noise) are too chaotic. Perlin's idea: place
 * random *gradient vectors* at regular grid points, then smoothly interpolate
 * between them. The result is "gradient noise" — a continuous, smooth function
 * that looks organic. It won him an Academy Award.
 *
 * WHAT IS A SIMPLEX (AND WHY NOT A GRID)?
 * ----------------------------------------
 * Classic Perlin noise works on a square grid. In 2D that means interpolating
 * between 4 corners (2^2). In 3D it's 8 corners (2^3). That's expensive, and
 * the square grid introduces visible axis-aligned artifacts.
 *
 * A *simplex* is the simplest shape that fills N-dimensional space:
 *   - In 1D: a line segment (2 vertices)
 *   - In 2D: an equilateral triangle (3 vertices)
 *   - In 3D: a tetrahedron (4 vertices)
 *
 * Simplex noise (Perlin, 2001) tiles space with simplices instead of
 * hypercubes. Benefits:
 *   1. Fewer vertices to interpolate → faster (3 in 2D vs 4)
 *   2. No axis-aligned bias → fewer directional artifacts
 *   3. Computational cost scales as O(N) instead of O(2^N)
 *
 * The trick to finding which simplex a point falls in: skew the input space
 * so that simplices align with a regular grid, do a simple floor() to find the
 * cell, then determine which triangle within that cell based on whether x > y.
 *
 * FURTHER READING:
 *   - Stefan Gustavson's "Simplex noise demystified" (2005)
 *   - Ken Perlin's original SIGGRAPH 2002 paper on improved noise
 *   - Inigo Quilez's articles at https://iquilezles.org/articles/
 */

// ---------------------------------------------------------------------------
// Permutation table: a shuffled array of 0–255, doubled to avoid wrapping.
// This gives us a cheap, deterministic hash: perm[x + perm[y]] maps any
// 2D integer coordinate to one of 256 values.
// ---------------------------------------------------------------------------
const PERM = new Uint8Array(512);
const PERM_MOD12 = new Uint8Array(512);

/**
 * Seed the permutation table. Different seeds → different noise landscapes.
 * We use a simple linear congruential generator to shuffle.
 */
export function seed(s) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;

  // Fisher-Yates shuffle driven by the seed
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647; // Park-Miller LCG
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }

  for (let i = 0; i < 512; i++) {
    PERM[i] = p[i & 255];
    PERM_MOD12[i] = PERM[i] % 12;
  }
}

// Seed with a default so the module works without explicit seeding
seed(42);

// ---------------------------------------------------------------------------
// Gradient vectors for 2D simplex noise.
// These are the 12 edge directions of a regular polygon. Each gradient is a
// unit-ish vector; the dot product with the distance vector gives the
// contribution from that corner.
// ---------------------------------------------------------------------------
const GRAD3 = [
  [1, 1], [- 1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, 1], [1, -1], [-1, -1],
];

/**
 * The skewing factor for 2D simplex noise.
 *
 * To find which simplex (triangle) a point falls in, we *skew* the coordinate
 * system so that the triangular grid becomes a square grid. Then a simple
 * floor() tells us the cell.
 *
 *   F = (√3 - 1) / 2 ≈ 0.3660  — skew input to grid space
 *   G = (3 - √3) / 6 ≈ 0.2113  — unskew grid back to input space
 */
const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

/**
 * Compute raw 2D simplex noise at coordinates (x, y).
 * Returns a value in approximately [-1, 1].
 */
export function simplex2D(x, y) {
  // --- Step 1: Skew input space to find the simplex cell ---
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  // --- Step 2: Unskew back to find the cell origin in input space ---
  const t = (i + j) * G2;
  const X0 = i - t; // cell origin in real (unskewed) coords
  const Y0 = j - t;
  const x0 = x - X0; // distance from cell origin
  const y0 = y - Y0;

  // --- Step 3: Determine which simplex (triangle) we're in ---
  // In 2D, the simplex is a triangle. The cell has two triangles.
  // If x0 > y0 we're in the lower triangle, else the upper one.
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;

  // Offsets for the second and third corners (in unskewed coords)
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  // --- Step 4: Hash the triangle corners to get gradient indices ---
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = PERM_MOD12[ii + PERM[jj]];
  const gi1 = PERM_MOD12[ii + i1 + PERM[jj + j1]];
  const gi2 = PERM_MOD12[ii + 1 + PERM[jj + 1]];

  // --- Step 5: Compute contribution from each corner ---
  // Each corner's influence is: max(0, r² - d²)^4 · dot(gradient, distance)
  // where r² = 0.5. The quartic falloff ensures smooth, continuous noise.
  let n0 = 0, n1 = 0, n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * (GRAD3[gi0][0] * x0 + GRAD3[gi0][1] * y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * (GRAD3[gi1][0] * x1 + GRAD3[gi1][1] * y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * (GRAD3[gi2][0] * x2 + GRAD3[gi2][1] * y2);
  }

  // Scale to [-1, 1]. The magic number 70.0 normalizes the output range.
  return 70.0 * (n0 + n1 + n2);
}

/**
 * Fractal Brownian Motion (fBm) — layered simplex noise
 * ======================================================
 *
 * WHAT ARE OCTAVES?
 * -----------------
 * A single layer of noise is smooth and blobby — think gently rolling hills.
 * Natural textures have detail at *every* scale: mountains have ridges which
 * have rocks which have grains. We simulate this by summing multiple layers
 * ("octaves") of noise, each at a higher frequency and lower amplitude:
 *
 *   octave 0: frequency = 1×,   amplitude = 1×     (big shapes)
 *   octave 1: frequency = 2×,   amplitude = 0.5×   (medium detail)
 *   octave 2: frequency = 4×,   amplitude = 0.25×  (fine detail)
 *   octave 3: frequency = 8×,   amplitude = 0.125× (tiny detail)
 *
 * The name "octave" comes from music: each octave doubles the frequency,
 * just like going up one octave on a piano doubles the pitch.
 *
 * LACUNARITY AND PERSISTENCE
 * --------------------------
 * These two parameters control the character of the fractal noise:
 *
 *   lacunarity (default 2.0) — the frequency multiplier between octaves.
 *     lacunarity = 2.0 means each octave is twice as "zoomed in."
 *     Higher values skip to fine detail faster; lower values keep octaves
 *     more similar in scale.
 *
 *   persistence (default 0.5) — the amplitude multiplier between octaves.
 *     persistence = 0.5 means each octave contributes half as much.
 *     Higher persistence (e.g. 0.7) makes fine detail louder → rougher look.
 *     Lower persistence (e.g. 0.3) makes fine detail quieter → smoother look.
 *
 * The total is normalized by dividing by the sum of all amplitudes, so the
 * output stays in [-1, 1] regardless of octave count.
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} octaves - Number of noise layers (1–8 is typical)
 * @param {number} lacunarity - Frequency multiplier per octave (default 2.0)
 * @param {number} persistence - Amplitude multiplier per octave (default 0.5)
 * @returns {number} Noise value in [-1, 1]
 */
export function fractal2D(x, y, octaves = 4, lacunarity = 2.0, persistence = 0.5) {
  let value = 0;
  let amplitude = 1.0; // starts at 1, halved each octave (by default)
  let frequency = 1.0; // starts at 1, doubled each octave (by default)
  let maxAmplitude = 0; // tracks the theoretical max for normalization

  for (let i = 0; i < octaves; i++) {
    // Sample noise at this octave's frequency, scaled by its amplitude
    value += amplitude * simplex2D(x * frequency, y * frequency);
    maxAmplitude += amplitude;

    // Next octave: zoom in (higher frequency), quieter (lower amplitude)
    frequency *= lacunarity;
    amplitude *= persistence;
  }

  // Normalize to [-1, 1] so the output range is independent of octave count
  return value / maxAmplitude;
}
