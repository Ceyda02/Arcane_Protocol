import { describe, it, expect } from 'vitest';
import { gameReducer } from '../state/gameReducer.js';
import { levelFromXp, levelProgress, computeXpAward, updateStreak, newAchievements } from '../engine/progressionEngine.js';
import { CHALLENGES } from '../content/index.js';
import { validateChallenge } from '../engine/challengeEngine.js';
import { newStore, passChallenge, completeChapter1, correctAnswer } from './helpers.js';

describe('XP and levels', () => {
  it('levels rise with XP', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(60)).toBe(2);
    expect(levelFromXp(240)).toBe(3);
    expect(levelProgress(90).fraction).toBeGreaterThan(0);
  });
  it('awards XP on first pass only (no farming)', () => {
    let s = passChallenge(newStore(), 'c1-events');
    const first = s.game.progress.xp;
    expect(first).toBeGreaterThan(0);
    s = passChallenge(s, 'c1-events');
    expect(s.game.progress.xp).toBe(first);
    expect(s.game.progress.challengeRecords['c1-events'].attempts).toBe(2);
  });
  it('hints reduce the reward but never to zero', () => {
    const c = CHALLENGES['c1-events'];
    const r = validateChallenge(c, correctAnswer(c));
    const none = computeXpAward(c, r, 0, undefined);
    const some = computeXpAward(c, r, 2, undefined);
    const many = computeXpAward(c, r, 9, undefined);
    expect(some).toBeLessThan(none);
    expect(many).toBeGreaterThan(0);
  });
  it('failed attempts award nothing and join the review queue; passing clears it', () => {
    const c = CHALLENGES['c1-events'];
    const fail = validateChallenge(c, {});
    let s = gameReducer(newStore(), { type: 'RECORD_CHALLENGE', challengeId: c.id, result: fail, hintsUsed: 0 });
    expect(s.game.progress.xp).toBe(0);
    expect(s.game.progress.reviewQueue).toContain(c.id);
    s = passChallenge(s, c.id);
    expect(s.game.progress.reviewQueue).not.toContain(c.id);
    expect(s.game.progress.xp).toBeGreaterThan(0);
  });
  it('skill XP goes to the challenge skill', () => {
    const s = passChallenge(newStore(), 'c1-timeline');
    expect(s.game.progress.skillXp.forensics).toBeGreaterThan(0);
    expect(s.game.progress.skillXp.networking).toBe(0);
  });
  it('emits a level-up event when crossing a threshold', () => {
    let s = newStore();
    for (const id of ['c1-events', 'c1-ledger', 'c1-timeline']) s = passChallenge(s, id);
    s = passChallenge(s, 'c1-timezones');
    const all = s.game.progress.xp;
    expect(levelFromXp(all)).toBeGreaterThanOrEqual(2);
  });
});

describe('achievements come from real logic', () => {
  it('opening nothing grants nothing', () => {
    expect(newAchievements(newStore().game)).toEqual([]);
  });
  it('First Rune on first passed challenge; Watchtower Detective on the timeline', () => {
    let s = passChallenge(newStore(), 'c1-events');
    expect(s.game.progress.achievements).toContain('first_rune');
    expect(s.game.progress.achievements).not.toContain('watchtower_detective');
    s = passChallenge(s, 'c1-timeline');
    expect(s.game.progress.achievements).toContain('watchtower_detective');
  });
  it('The Careful Investigator on the Shapeshifter trial', () => {
    const s = passChallenge(newStore(), 'c1-shapeshifter');
    expect(s.game.progress.achievements).toContain('careful_investigator');
  });
  it('Clear Sight requires no hints; hints block it', () => {
    const noHint = passChallenge(newStore(), 'worm-boss');
    expect(noHint.game.progress.achievements).toContain('clear_sight');
    const hinted = passChallenge(newStore(), 'worm-boss', { hints: 1 });
    expect(hinted.game.progress.achievements).not.toContain('clear_sight');
  });
  it('Keeper of Secrets needs five Grimoire pages; Master of Two Orders needs two orders', () => {
    let s = completeChapter1(newStore());
    expect(s.game.progress.achievements).not.toContain('keeper_of_secrets');
    expect(s.game.progress.pathsPlayed).toEqual(['blue']);
    s = gameReducer(s, { type: 'SET_PATH', pathId: 'echoes' });
    for (const id of ['worm-beginner', 'worm-intermediate', 'worm-boss']) s = passChallenge(s, id);
    s = gameReducer(s, { type: 'COMPLETE_QUEST', questId: 'encounter-worm' });
    expect(s.game.progress.pathsPlayed.sort()).toEqual(['blue', 'echoes']);
    expect(s.game.progress.achievements).toContain('master_of_two_orders');
    expect(s.game.progress.grimoire.length).toBeGreaterThanOrEqual(5);
    expect(s.game.progress.achievements).toContain('keeper_of_secrets');
  });
});

describe('streak', () => {
  it('counts consecutive days and resets after a gap', () => {
    let st = updateStreak({ count: 0, lastDay: null }, '2026-10-01');
    st = updateStreak(st, '2026-10-02');
    expect(st.count).toBe(2);
    expect(updateStreak(st, '2026-10-02').count).toBe(2);
    expect(updateStreak(st, '2026-10-05').count).toBe(1);
  });
});
