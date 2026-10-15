/**
 * Central asset registry. Content refers to assets by key (e.g. 'worm'); this is the only place that knows file paths.
 * Replace any PNG in src/assets to upgrade art. Keys with no file render a clearly marked placeholder glyph.
 */
const modules = import.meta.glob('../../assets/**/*.png', { eager: true, query: '?url', import: 'default' });
const byKey = {};
for (const [path, url] of Object.entries(modules)) {
  byKey[path.split('/').pop().replace('.png', '')] = url;
}
export const asset = (key) => (key ? byKey[key] ?? null : null);
