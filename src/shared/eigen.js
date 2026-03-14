/**
 * Eigenvalue Solvers for 2×2 and 3×3 Real Matrices
 * ==================================================
 *
 * WHAT IS AN EIGENVALUE, GEOMETRICALLY?
 * --------------------------------------
 * A matrix transforms space — it stretches, rotates, shears, or reflects
 * vectors. Most vectors get moved to a completely new direction when
 * multiplied by a matrix. But some special vectors only get *scaled* (made
 * longer, shorter, or flipped). These are the **eigenvectors**, and the
 * scale factor is the **eigenvalue** (German: eigen = "own" or "characteristic").
 *
 *   If A·v = λ·v, then:
 *     v is an eigenvector of A
 *     λ is the corresponding eigenvalue
 *
 * Think of it like this: push every direction through the matrix. Most
 * directions come out pointing somewhere new. But eigenvectors come out
 * pointing the same way (or exactly opposite if λ is negative). They're
 * the "natural axes" of the transformation.
 *
 * WHY CAN EIGENVALUES BE COMPLEX EVEN FOR REAL MATRICES?
 * -------------------------------------------------------
 * Consider a 90° rotation matrix: [[0, -1], [1, 0]]. No real vector
 * survives this rotation pointing in the same direction — every vector
 * gets turned. There is no real number λ such that A·v = λ·v for any
 * nonzero real v.
 *
 * But if we allow complex numbers, solutions appear: λ = i and λ = -i.
 * The complex eigenvalues encode the rotation angle (arg(λ)) and scale
 * (|λ|). Complex eigenvalues of real matrices always come in **conjugate
 * pairs**: if a + bi is an eigenvalue, so is a - bi. This is why the
 * plots are always symmetric across the real axis.
 *
 * WHAT DOES "BOHEMIAN" MEAN?
 * --------------------------
 * "Bohemian" is a playful acronym: BOunded HEight Matrix of Integers.
 * A Bohemian matrix family is defined by:
 *   1. A fixed matrix size (e.g. 3×3)
 *   2. A finite set of allowed entries (e.g. {-1, 0, 1})
 *
 * Every possible matrix is enumerated, and all eigenvalues are computed
 * and plotted on the complex plane. The resulting scatter plots reveal
 * extraordinary fractal-like structure — not random scatter, but intricate
 * symmetric constellations. The structure arises because the characteristic
 * polynomial has integer coefficients drawn from a bounded set, creating
 * algebraic constraints that organize the eigenvalues into patterns.
 *
 * For more: https://bohemianmatrices.com
 */

/**
 * 2×2 Eigenvalue Solver — Analytical (Quadratic Formula)
 * =======================================================
 *
 * For a 2×2 matrix:
 *   A = | a  b |
 *       | c  d |
 *
 * The eigenvalues satisfy the characteristic equation det(A - λI) = 0:
 *
 *   | a-λ   b  |
 *   |  c   d-λ | = 0
 *
 *   (a - λ)(d - λ) - bc = 0
 *   λ² - (a + d)λ + (ad - bc) = 0
 *
 * This is a quadratic in λ. The coefficients have names:
 *   - (a + d) is the TRACE of the matrix (sum of diagonal entries)
 *   - (ad - bc) is the DETERMINANT of the matrix
 *
 * So the characteristic equation is:  λ² - trace·λ + det = 0
 *
 * Applying the quadratic formula:
 *   λ = (trace ± √(trace² - 4·det)) / 2
 *
 * The discriminant (trace² - 4·det) determines the nature:
 *   > 0 → two distinct real eigenvalues
 *   = 0 → one repeated real eigenvalue
 *   < 0 → two complex conjugate eigenvalues (a ± bi)
 *
 * @param {number} a - entry [0,0]
 * @param {number} b - entry [0,1]
 * @param {number} c - entry [1,0]
 * @param {number} d - entry [1,1]
 * @returns {Array<{re: number, im: number}>} two eigenvalues as complex numbers
 */
export function eigen2x2(a, b, c, d) {
  // Step 1: Compute trace and determinant
  const trace = a + d;        // sum of diagonal
  const det = a * d - b * c;  // ad - bc

  // Step 2: Compute the discriminant of the characteristic quadratic
  // discriminant = trace² - 4·det
  const disc = trace * trace - 4 * det;

  // Step 3: Apply the quadratic formula, handling real vs complex roots
  const halfTrace = trace / 2;

  if (disc >= 0) {
    // Two real eigenvalues (or one repeated if disc = 0)
    const sqrtDisc = Math.sqrt(disc) / 2;
    return [
      { re: halfTrace + sqrtDisc, im: 0 },
      { re: halfTrace - sqrtDisc, im: 0 },
    ];
  } else {
    // Two complex conjugate eigenvalues: halfTrace ± i·sqrt(|disc|)/2
    // This happens when the matrix encodes a rotation component
    const imagPart = Math.sqrt(-disc) / 2;
    return [
      { re: halfTrace, im: imagPart },
      { re: halfTrace, im: -imagPart },
    ];
  }
}

/**
 * 3×3 Eigenvalue Solver — Analytical (Cubic via Trigonometric/Cardano Method)
 * ============================================================================
 *
 * For a 3×3 matrix:
 *   A = | a  b  c |
 *       | d  e  f |
 *       | g  h  i |
 *
 * The characteristic polynomial is det(A - λI) = 0, which expands to:
 *
 *   -λ³ + (a+e+i)λ² - (ae+ai+ei - bf - cd - gh)λ + det(A) = 0
 *
 * Or in standard form (monic, leading coefficient 1):
 *
 *   λ³ - p·λ² + q·λ - r = 0
 *
 * where:
 *   p = trace(A) = a + e + i
 *   q = sum of 2×2 minor determinants along the diagonal
 *     = (ae - bd) + (ai - cg) + (ei - fh)
 *   r = det(A) = a(ei - fh) - b(di - fg) + c(dh - eg)
 *
 * We solve this using the DEPRESSED CUBIC method:
 *
 * Step 1: Remove the quadratic term with the substitution λ = t + p/3
 *   This shifts the polynomial so the t² term vanishes, giving:
 *   t³ + mt + n = 0
 *   where:
 *     m = q - p²/3
 *     n = r - pq/3 + 2p³/27  (note: we negate to get -r + pq/3 - 2p³/27)
 *
 * Step 2: Classify using the discriminant
 *   Δ = -(4m³ + 27n²)
 *   Δ > 0 → three distinct real roots (use trigonometric method)
 *   Δ = 0 → repeated roots
 *   Δ < 0 → one real root, two complex conjugate roots (use Cardano's formula)
 *
 * Step 3a (Δ ≥ 0): Trigonometric method (Vieta's substitution)
 *   When all roots are real, Cardano's formula involves cube roots of complex
 *   numbers, which is messy. The trigonometric method avoids this:
 *     t_k = 2√(-m/3) · cos(θ/3 - 2πk/3)  for k = 0, 1, 2
 *   where θ = arccos(3n/(2m) · √(-3/m))
 *
 * Step 3b (Δ < 0): Cardano's formula
 *   t = ∛(-n/2 + √(n²/4 + m³/27)) + ∛(-n/2 - √(n²/4 + m³/27))
 *   The other two roots are complex conjugates found by factoring out
 *   the real root and solving the remaining quadratic.
 *
 * @param {number[]} M - 9 entries in row-major order [a,b,c,d,e,f,g,h,i]
 * @returns {Array<{re: number, im: number}>} three eigenvalues as complex numbers
 */
export function eigen3x3(M) {
  const [a, b, c, d, e, f, g, h, i] = M;

  // --- Characteristic polynomial coefficients ---
  // λ³ - p·λ² + q·λ - r = 0

  // p = trace: sum of diagonal entries
  const p = a + e + i;

  // q = sum of the three 2×2 cofactors along the diagonal:
  //   minor at (0,0): |e f|  = ei - fh
  //                   |h i|
  //   minor at (1,1): |a c|  = ai - cg
  //                   |g i|
  //   minor at (2,2): |a b|  = ae - bd
  //                   |d e|
  const q = (a * e - b * d) + (a * i - c * g) + (e * i - f * h);

  // r = determinant of the full 3×3 matrix (cofactor expansion along row 0)
  //   = a(ei - fh) - b(di - fg) + c(dh - eg)
  const r = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

  // --- Depressed cubic substitution: λ = t + p/3 ---
  // This eliminates the λ² term, giving: t³ + mt + n = 0
  const p3 = p / 3;
  const p3sq = p3 * p3;

  // m = q - p²/3  (coefficient of t in the depressed cubic)
  const m = q - p * p3;

  // n = -r + p·q/3 - 2p³/27  (constant term in the depressed cubic)
  // Note the sign convention: our depressed cubic is t³ + mt + n = 0
  const n = -r + p3 * q - 2 * p3 * p3sq;

  // --- Discriminant of the depressed cubic ---
  // The sign of (m³/27 + n²/4) determines the root structure:
  //   < 0 → three distinct real roots (trigonometric case)
  //   ≥ 0 → one real root + two complex conjugates (or repeated roots)
  const m3over27 = m * m * m / 27;
  const n2over4 = n * n / 4;
  const disc = m3over27 + n2over4;

  const results = [];

  if (disc < -1e-14) {
    // --- THREE REAL ROOTS: Trigonometric method (Vieta's substitution) ---
    // When disc < 0, Cardano's formula would require complex intermediate
    // values even though all roots are real (the "casus irreducibilis").
    // The trigonometric method sidesteps this elegantly:
    //
    //   All three roots of t³ + mt + n = 0 can be written as:
    //     t_k = 2·√(-m/3) · cos((1/3)·arccos(3n/(2m)·√(-3/m)) - 2πk/3)
    //
    //   for k = 0, 1, 2. This works because when disc < 0, the expression
    //   inside the arccos is between -1 and 1, so the angle is real.

    const sqrtNegM3 = Math.sqrt(-m / 3);
    // The argument to arccos: (3n) / (2m · √(-m/3)) = 3n·√(-3/m) / (2m)
    const cosArg = (3 * n) / (2 * m * sqrtNegM3);
    // Clamp to [-1, 1] to handle floating-point edge cases
    const theta = Math.acos(Math.max(-1, Math.min(1, cosArg)));

    for (let k = 0; k < 3; k++) {
      const t = 2 * sqrtNegM3 * Math.cos((theta - 2 * Math.PI * k) / 3);
      results.push({ re: t + p3, im: 0 });
    }
  } else {
    // --- ONE REAL ROOT + TWO COMPLEX CONJUGATE ROOTS: Cardano's formula ---
    //
    // For the depressed cubic t³ + mt + n = 0:
    //   Let u = ∛(-n/2 + √disc)  and  v = ∛(-n/2 - √disc)
    //   Then the real root is t₁ = u + v
    //
    //   The remaining two roots come from the factored quadratic:
    //     t₂,₃ = -(u+v)/2 ± i·(u-v)·√3/2

    const sqrtDisc = Math.sqrt(Math.max(0, disc));
    const uArg = -n / 2 + sqrtDisc;
    const vArg = -n / 2 - sqrtDisc;

    // Cube root that preserves sign: cbrt(-8) = -2
    const u = Math.cbrt(uArg);
    const v = Math.cbrt(vArg);

    // Real root
    const t1 = u + v;
    results.push({ re: t1 + p3, im: 0 });

    // Complex conjugate pair from the remaining quadratic factor
    const realPart = -(u + v) / 2;
    const imagPart = (u - v) * Math.sqrt(3) / 2;

    if (Math.abs(imagPart) < 1e-12) {
      // Essentially real (repeated or near-repeated root)
      results.push({ re: realPart + p3, im: 0 });
      results.push({ re: realPart + p3, im: 0 });
    } else {
      results.push({ re: realPart + p3, im: imagPart });
      results.push({ re: realPart + p3, im: -imagPart });
    }
  }

  return results;
}

/**
 * Generate all matrices for a given size and entry set, compute all eigenvalues.
 *
 * For an n×n matrix with entry set of size s, there are s^(n²) matrices.
 * Examples:
 *   2×2 with {-1, 0, 1}: 3^4 = 81 matrices → 162 eigenvalues
 *   3×3 with {-1, 0, 1}: 3^9 = 19683 matrices → 59049 eigenvalues
 *
 * We enumerate by treating each matrix as a base-s number with n² digits.
 *
 * @param {number} size - matrix dimension (2 or 3)
 * @param {number[]} entries - the allowed entry values
 * @param {boolean} distinct - if true, deduplicate eigenvalues
 * @returns {Array<{re: number, im: number}>} all eigenvalues
 */
export function computeAllEigenvalues(size, entries, distinct = false) {
  const numEntries = size * size;
  const totalMatrices = Math.pow(entries.length, numEntries);
  const eigenvalues = [];

  // Pre-allocate a matrix buffer to avoid garbage collection pressure
  const matrix = new Array(numEntries);

  for (let idx = 0; idx < totalMatrices; idx++) {
    // Decode the index into matrix entries (base-s number)
    let rem = idx;
    for (let j = numEntries - 1; j >= 0; j--) {
      matrix[j] = entries[rem % entries.length];
      rem = Math.floor(rem / entries.length);
    }

    // Compute eigenvalues for this matrix
    const eigs = size === 2
      ? eigen2x2(matrix[0], matrix[1], matrix[2], matrix[3])
      : eigen3x3(matrix);

    for (let k = 0; k < eigs.length; k++) {
      eigenvalues.push(eigs[k]);
    }
  }

  if (distinct) {
    return deduplicateEigenvalues(eigenvalues);
  }

  return eigenvalues;
}

/**
 * Compute eigenvalues for a batch of matrices by index range.
 * Used by the reveal animation to process matrices in chunks per frame.
 *
 * @param {number} size - matrix dimension (2 or 3)
 * @param {number[]} entries - allowed entry values
 * @param {number} startIdx - first matrix index (inclusive)
 * @param {number} endIdx - last matrix index (exclusive)
 * @returns {Array<{re: number, im: number}>} eigenvalues for this batch
 */
export function computeBatch(size, entries, startIdx, endIdx) {
  const numEntries = size * size;
  const matrix = new Array(numEntries);
  const batch = [];

  for (let idx = startIdx; idx < endIdx; idx++) {
    let rem = idx;
    for (let j = numEntries - 1; j >= 0; j--) {
      matrix[j] = entries[rem % entries.length];
      rem = Math.floor(rem / entries.length);
    }

    const eigs = size === 2
      ? eigen2x2(matrix[0], matrix[1], matrix[2], matrix[3])
      : eigen3x3(matrix);

    for (let k = 0; k < eigs.length; k++) {
      batch.push(eigs[k]);
    }
  }

  return batch;
}

/**
 * Remove duplicate eigenvalues (within floating-point tolerance).
 * We round to a grid and use a Set for fast lookup.
 */
function deduplicateEigenvalues(eigenvalues) {
  const seen = new Set();
  const result = [];
  const precision = 1e4; // round to 4 decimal places — coarser to catch near-duplicates from float arithmetic

  for (let i = 0; i < eigenvalues.length; i++) {
    const key = `${Math.round(eigenvalues[i].re * precision)},${Math.round(eigenvalues[i].im * precision)}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(eigenvalues[i]);
    }
  }

  return result;
}
