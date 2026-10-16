import { describe, it, expect } from 'vitest';
import { loadGame, saveGame, clearSave, hasSave, SAVE_KEY } from '../storage/saveStorage.js';
import { createInitialState, sanitizeState, migrateSave, SAVE_VERSION } from '../storage/saveSchema.js';
import { completeChapter1, newStore } from './helpers.js';

function memStore(initial = {}) {
  const data = { ...initial };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, removeItem: (k) => { delete data[k]; }, data };
}

describe('save and restore', () => {
  it('starts a new game when nothing is saved', () => {
    const r = loadGame(memStore());
    expect(r.status).toBe('new');
    expect(r.state.player).toBeNull();
  });
  it('round-trips progress without losing anything', () => {
    const store = memStore();
    const game = completeChapter1(newStore()).game;
    expect(saveGame(game, store).ok).toBe(true);
    const r = loadGame(store);
    expect(r.status).toBe('loaded');
    expect(r.state.progress.xp).toBe(game.progress.xp);
    expect(r.state.progress.grimoire).toEqual(game.progress.grimoire);
    expect(r.state.progress.bestiary).toEqual(game.progress.bestiary);
    expect(r.state.player).toEqual(game.player);
    expect(r.state.pathId).toBe('blue');
    expect(hasSave(store)).toBe(true);
  });
  it('clearSave removes the data', () => {
    const store = memStore();
    saveGame(createInitialState(), store);
    clearSave(store);
    expect(hasSave(store)).toBe(false);
  });
  it('never stores anything outside the game state (no secrets)', () => {
    const store = memStore();
    saveGame(newStore().game, store);
    expect(Object.keys(store.data)).toEqual([SAVE_KEY]);
    expect(store.data[SAVE_KEY]).not.toMatch(/password|apikey|token/i);
  });
});

describe('invalid, outdated, and unavailable storage', () => {
  it('recovers from corrupt JSON with a clear message', () => {
    const r = loadGame(memStore({ [SAVE_KEY]: '{nope' }));
    expect(r.status).toBe('corrupt');
    expect(r.error).toMatch(/could not be read/);
    expect(r.state.progress.xp).toBe(0);
  });
  it('rejects non-object payloads', () => {
    expect(loadGame(memStore({ [SAVE_KEY]: '[1,2,3]' })).status).toBe('corrupt');
    expect(loadGame(memStore({ [SAVE_KEY]: '"hello"' })).status).toBe('corrupt');
  });
  it('sanitizes hostile or malformed fields instead of trusting them', () => {
    const evil = { version: 1, player: { name: 'x'.repeat(500), color: { a: 1 } }, progress: { xp: 'lots', skillXp: { networking: -50, webapp: 'NaN' }, grimoire: [1, 'ok', null], bestiary: { worm: 'godmode' }, challengeRecords: { x: 5 } }, settings: { textSpeed: 'warp', volume: 99 }, pathId: 'admin' };
    const r = sanitizeState(evil);
    expect(r.ok).toBe(true);
    expect(r.state.player.name.length).toBeLessThanOrEqual(24);
    expect(r.state.progress.xp).toBe(0);
    expect(r.state.progress.skillXp.networking).toBe(0);
    expect(r.state.progress.grimoire).toEqual(['ok']);
    expect(r.state.progress.bestiary.worm).toBe('seen');
    expect(r.state.settings.textSpeed).toBe('normal');
    expect(r.state.settings.volume).toBe(1);
    expect(r.state.pathId).toBeNull();
    expect(r.state.progress.challengeRecords).toEqual({});
  });
  it('migrates an outdated v0 save and keeps what it can', () => {
    const v0 = { version: 0, name: 'Old Hero', xp: 120, completed: ['bells-of-the-silent-watch'] };
    const store = memStore({ [SAVE_KEY]: JSON.stringify(v0) });
    const r = loadGame(store);
    expect(r.status).toBe('migrated');
    expect(r.state.version).toBe(SAVE_VERSION);
    expect(r.state.player.name).toBe('Old Hero');
    expect(r.state.progress.xp).toBe(120);
    expect(r.state.progress.completedQuests).toEqual(['bells-of-the-silent-watch']);
  });
  it('treats a save without a version as v0', () => {
    expect(migrateSave({ name: 'NoVersion', xp: 5 }).ok).toBe(true);
  });
  it('refuses to overwrite a save from a newer game version', () => {
    const r = loadGame(memStore({ [SAVE_KEY]: JSON.stringify({ version: 99 }) }));
    expect(r.status).toBe('corrupt');
    expect(r.reason).toBe('newer-version');
    expect(r.error).toMatch(/newer version/);
  });
  it('reports storage that throws on write (quota)', () => {
    const full = { getItem: () => null, setItem: () => { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; }, removeItem() {} };
    expect(saveGame(createInitialState(), full)).toEqual({ ok: false, error: 'quota' });
  });
  it('reports storage that is unavailable', () => {
    const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
    expect(loadGame(broken).status).toBe('unavailable');
    expect(saveGame(createInitialState(), broken).ok).toBe(false);
  });
});
