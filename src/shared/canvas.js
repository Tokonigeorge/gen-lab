/**
 * Canvas utilities — shared setup for full-screen canvas experiments.
 */

/**
 * Create a full-screen canvas, append it to the document, and handle resizing.
 * Returns { canvas, ctx, width(), height() }.
 */
export function createFullscreenCanvas(container) {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = container.clientWidth;
    h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  return {
    canvas,
    ctx,
    width: () => w,
    height: () => h,
    resize,
  };
}

/**
 * Save the current canvas as a PNG download.
 */
export function saveCanvasPNG(canvas, filename = 'generative-lab.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
