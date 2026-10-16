/**
 * Deterministic pixel terrain for the world map. Pure function of the region list, so it is stable and testable.
 * Returns { w, h, paths: { [colour]: svgPathString } } to be drawn as crisp 1x1 cells.
 */
const W = 64;
const H = 40;

function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function smoothNoise(x, y, scale) {
  const gx = x / scale; const gy = y / scale;
  const x0 = Math.floor(gx); const y0 = Math.floor(gy);
  const fx = gx - x0; const fy = gy - y0;
  const s = (t) => t * t * (3 - 2 * t);
  const a = hash(x0, y0); const b = hash(x0 + 1, y0); const c = hash(x0, y0 + 1); const d = hash(x0 + 1, y0 + 1);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
}

const TINT = {
  crimson_depths: '#6e2a3a',
  veil_of_twilight: '#5a4a8a',
  memory_crypt: '#8a7440',
  nightwatch_citadel: '#3e5a8c',
  shattered_web: '#4f6b4a',
  rune_gates: '#5d6a78',
  crownlands: '#3f7a4c',
  blighted_reach: '#68483e',
  forgotten_observatory: '#615c79',
};

export function buildTerrain(regions) {
  const cells = {};
  const put = (color, x, y) => { (cells[color] ||= []).push(`M${x} ${y}h1v1h-1z`); };
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const nx = x / W; const ny = y / H;
      // Island mass: an ellipse, roughened by noise.
      const dx = (nx - 0.5) / 0.48; const dy = (ny - 0.5) / 0.46;
      const mass = 1 - (dx * dx + dy * dy) + (smoothNoise(x, y, 7) - 0.5) * 0.55 + (smoothNoise(x, y, 3) - 0.5) * 0.18;
      let color;
      if (mass < 0.0) color = (x + y) % 7 === 0 && hash(x, y) > 0.7 ? '#2f4a8c' : '#223a78';
      else if (mass < 0.07) color = '#d6bd82'; // beach
      else {
        // Which region is nearest? Tint the land around it.
        let near = null; let best = 1e9;
        for (const r of regions) {
          const d = ((r.x / 100 - nx) * W) ** 2 + ((r.y / 100 - ny) * H * 1.4) ** 2;
          if (d < best) { best = d; near = r; }
        }
        const base = best < 70 && near ? TINT[near.id] ?? '#3f7a4c' : '#3a6e46';
        const n = smoothNoise(x + 40, y + 20, 4);
        if (n > 0.74) color = '#7b7a86'; // mountain
        else if (n < 0.3) color = '#2b5636'; // forest
        else color = hash(x, y) > 0.9 ? '#4b8a58' : base;
      }
      put(color, x, y);
    }
  }
  const paths = Object.fromEntries(Object.entries(cells).map(([c, segs]) => [c, segs.join('')]));
  return { w: W, h: H, paths };
}
