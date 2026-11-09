import { describe, it, expect } from 'vitest';
import { loadGame, loadGameAsync, saveGame, saveGameAsync, clearSave, clearSaveAsync, hasSave, SAVE_KEY } from '../storage/saveStorage.js';
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
    const game = { ...completeChapter1(newStore()).game, developerMode: true };
    expect(saveGame(game, store).ok).toBe(true);
    const r = loadGame(store);
    expect(r.status).toBe('loaded');
    expect(r.state.progress.xp).toBe(game.progress.xp);
    expect(r.state.progress.grimoire).toEqual(game.progress.grimoire);
    expect(r.state.progress.bestiary).toEqual(game.progress.bestiary);
    expect(r.state.player).toEqual(game.player);
    expect(r.state.pathId).toBe('blue');
    expect(r.state.developerMode).toBe(true);
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

describe('desktop save bridge', () => {
  it('round-trips the game through an asynchronous save file adapter', async () => {
    let text = null;
    const storage = {
      readSave: async () => text,
      writeSave: async (value) => { text = value; },
      clearSave: async () => { text = null; },
    };
    const game = { ...completeChapter1(newStore()).game, developerMode: true };

    expect((await loadGameAsync(storage)).status).toBe('new');
    expect(await saveGameAsync(game, storage)).toEqual({ ok: true });
    const restored = await loadGameAsync(storage);
    expect(restored.status).toBe('loaded');
    expect(restored.state.progress.xp).toBe(game.progress.xp);
    expect(restored.state.progress.grimoire).toEqual(game.progress.grimoire);
    expect(restored.state.player).toEqual(game.player);
    expect(await clearSaveAsync(storage)).toBe(true);
    expect((await loadGameAsync(storage)).status).toBe('new');
  });

  it('reports desktop save-file read and write failures', async () => {
    const storage = {
      readSave: async () => { throw new Error('read failed'); },
      writeSave: async () => { throw new Error('write failed'); },
      clearSave: async () => { throw new Error('clear failed'); },
    };

    expect((await loadGameAsync(storage)).status).toBe('unavailable');
    expect(await saveGameAsync(createInitialState(), storage)).toEqual({ ok: false, error: 'unknown' });
    expect(await clearSaveAsync(storage)).toBe(false);
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
    expect(r.state.tutorialCompleted).toBe(true);
    expect(r.state.progress.xp).toBe(120);
    expect(r.state.progress.completedQuests).toEqual(['bells-of-the-silent-watch']);
  });
  it('marks existing version-five saves as having already seen the intro', () => {
    const player = { name: 'Mira', address: '', archetypeId: 'investigator', portraitId: 'mage', color: 'violet', equipmentId: 'lantern' };
    const migrated = sanitizeState({ version: 5, player, progress: { xp: 80 } });
    expect(migrated.ok).toBe(true);
    expect(migrated.state.introCompleted).toBe(true);
    expect(migrated.state.settings.musicVolume).toBe(0.25);
    expect(migrated.state.settings.muted).toBe(false);
    expect(migrated.state.settings.musicMuted).toBe(false);
    expect(createInitialState().introCompleted).toBe(false);
  });
  it('enables newly-defaulted audio for existing saves while preserving their progress', () => {
    const migrated = sanitizeState({
      version: 6,
      settings: { language: 'en', muted: true, volume: 0.4, musicVolume: 0.3 },
      progress: { xp: 125, completedQuests: ['bells-of-the-silent-watch'] },
    });
    expect(migrated.ok).toBe(true);
    expect(migrated.state.settings.muted).toBe(false);
    expect(migrated.state.settings.musicMuted).toBe(false);
    expect(migrated.state.progress.xp).toBe(125);
    expect(migrated.state.progress.completedQuests).toContain('bells-of-the-silent-watch');
  });
  it('migrates version-seven saves with developer mode disabled by default', () => {
    const migrated = sanitizeState({ version: 7, player: { name: 'Mira' }, progress: { xp: 20 } });
    expect(migrated.ok).toBe(true);
    expect(migrated.state.version).toBe(SAVE_VERSION);
    expect(migrated.state.developerMode).toBe(false);
  });
  it('migrates existing version-eight saves without replaying the first-time guide', () => {
    const migrated = sanitizeState({
      version: 8,
      player: { name: 'Mira' },
      settings: { difficulty: 'hard' },
      progress: { xp: 20 },
    });
    expect(migrated.ok).toBe(true);
    expect(migrated.state.version).toBe(SAVE_VERSION);
    expect(migrated.state.tutorialCompleted).toBe(true);
    expect(migrated.state.settings.difficulty).toBe('hard');
  });
  it('sanitizes difficulty and academy training records', () => {
    const migrated = sanitizeState({
      version: SAVE_VERSION,
      settings: { difficulty: 'impossible' },
      progress: {
        training: {
          packetAnalysis: { passed: true, attempts: 2, extra: 'ignored' },
          forged: { passed: true, attempts: 1 },
        },
      },
    });
    expect(migrated.state.settings.difficulty).toBe('normal');
    expect(migrated.state.progress.training).toEqual({ packetAnalysis: { passed: true, attempts: 2 } });
  });
  it('migrates v2 saves without losing progress and adds an empty investigation record map', () => {
    const r = sanitizeState({ version: 2, progress: { xp: 75, completedQuests: ['bells-of-the-silent-watch'] } });
    expect(r.ok).toBe(true);
    expect(r.state.version).toBe(SAVE_VERSION);
    expect(r.state.progress.xp).toBe(75);
    expect(r.state.progress.completedQuests).toEqual(['bells-of-the-silent-watch']);
    expect(r.state.progress.investigationRecords).toEqual({});
  });
  it('sanitizes investigation records to bounded, known fields', () => {
    const r = sanitizeState({
      version: SAVE_VERSION,
      progress: {
        investigationRecords: {
          watchtower: { passed: true, bestScore: 5, attempts: -3, extra: 'ignored' },
          forgedBoard: { passed: true, bestScore: 1, attempts: 1 },
        },
      },
    });
    expect(r.state.progress.investigationRecords).toEqual({
      watchtower: { passed: true, bestScore: 1, attempts: 0, rewardedXp: 35 },
    });
  });
  it('migrates v3 saves and restores bounded investigation drafts', () => {
    const r = sanitizeState({
      version: 3,
      progress: {
        xp: 40,
        investigationRecords: { watchtower: { passed: true, bestScore: 1, attempts: 2 } },
        investigationDrafts: {
          watchtower: {
            connections: ['login-to-export', 'forged'],
            timelineOrder: ['gate-opening'],
            evidenceStatuses: { 'owner-statement': 'unresolved', forged: 'invalid' },
            boardEvidence: ['owner-statement'],
            conclusionId: 'supported-correlation',
            nextEvidenceId: 'corroborating-records',
            secrets: 'ignored',
          },
        },
      },
    });
    expect(r.ok).toBe(true);
    expect(r.state.version).toBe(SAVE_VERSION);
    expect(r.state.progress.xp).toBe(40);
    expect(r.state.progress.investigationRecords.watchtower.rewardedXp).toBe(35);
    expect(r.state.progress.investigationDrafts.watchtower).toEqual({
      connections: ['login-to-export', 'forged'],
      timelineOrder: ['gate-opening'],
      evidenceStatuses: { 'owner-statement': 'unresolved' },
      boardEvidence: ['owner-statement'],
      conclusionId: 'supported-correlation',
      nextEvidenceId: 'corroborating-records',
    });
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
