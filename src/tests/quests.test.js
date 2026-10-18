import { describe, it, expect } from 'vitest';
import { gameReducer } from '../state/gameReducer.js';
import { QUESTS, MALWARE_CREATURES } from '../content/index.js';
import { REGIONS } from '../content/world.js';
import { questStatus, regionStatus, regionProgress, unmetRequirements } from '../engine/unlockEngine.js';
import { meetsCompletion, nextQuest } from '../engine/questEngine.js';
import { newStore, passChallenge, completeChapter1 } from './helpers.js';

describe('chapter completion conditions', () => {
  it('is not complete until every required challenge is passed', () => {
    let s = newStore();
    const q = QUESTS['bells-of-the-silent-watch'];
    for (const id of q.requiredChallenges.slice(0, -1)) s = passChallenge(s, id);
    expect(meetsCompletion(q, s.game.progress)).toBe(false);
    const attempted = gameReducer(s, { type: 'COMPLETE_QUEST', questId: q.id });
    expect(attempted.game.progress.completedQuests).toEqual([]);
  });
  it('completing Chapter 1 awards rewards and unlocks the page, Bestiary entry, and next quests', () => {
    const s = completeChapter1(newStore());
    const p = s.game.progress;
    expect(p.completedQuests).toContain('bells-of-the-silent-watch');
    expect(p.grimoire).toEqual(expect.arrayContaining(['events-alerts-incidents', 'reading-the-ledger', 'timelines-and-time-zones', 'context-and-correlation']));
    expect(p.bestiary.shapeshifter).toBe('seen');
    expect(p.xp).toBeGreaterThan(100);
    expect(questStatus(QUESTS['encounter-worm'], s.game)).toBe('available');
    expect(questStatus(QUESTS['night-watch-2'], s.game)).toBe('coming_soon');
    expect(s.events.some((e) => e.type === 'quest')).toBe(true);
  });
  it('completion is idempotent: rewards are not doubled', () => {
    const s = completeChapter1(newStore());
    const again = gameReducer(s, { type: 'COMPLETE_QUEST', questId: 'bells-of-the-silent-watch' });
    expect(again.game.progress.xp).toBe(s.game.progress.xp);
  });
});

describe('quest dependencies and unlocks', () => {
  it('encounters are locked until Chapter 1 is complete', () => {
    const g = newStore().game;
    for (const id of ['encounter-worm', 'encounter-trojan', 'encounter-ransomware']) expect(questStatus(QUESTS[id], g)).toBe('locked');
  });
  it('ransomware stays locked after Chapter 1 until the worm or the trojan is complete (requiresAny)', () => {
    let s = completeChapter1(newStore());
    expect(questStatus(QUESTS['encounter-ransomware'], s.game)).toBe('locked');
    expect(unmetRequirements({ quests: QUESTS['encounter-ransomware'].requires, anyQuests: QUESTS['encounter-ransomware'].requiresAny }, s.game).join(' ')).toMatch(/one of/);
    for (const id of ['worm-beginner', 'worm-intermediate', 'worm-boss']) s = passChallenge(s, id);
    s = gameReducer(s, { type: 'COMPLETE_QUEST', questId: 'encounter-worm' });
    expect(questStatus(QUESTS['encounter-ransomware'], s.game)).toBe('available');
  });
  it('the reducer itself refuses to complete a locked quest, even if its challenges were passed', () => {
    let s = newStore();
    for (const id of QUESTS['encounter-worm'].requiredChallenges) s = passChallenge(s, id);
    const r = gameReducer(s, { type: 'COMPLETE_QUEST', questId: 'encounter-worm' });
    expect(r.game.progress.completedQuests).toEqual([]);
  });
  it('Continue Adventure resumes the correct incomplete quest', () => {
    let s = newStore();
    expect(nextQuest(s.game).id).toBe('bells-of-the-silent-watch');
    s = gameReducer(s, { type: 'SET_QUEST_STAGE', questId: 'bells-of-the-silent-watch', stage: 4 });
    expect(nextQuest(s.game).id).toBe('bells-of-the-silent-watch');
    s = completeChapter1(s);
    expect(nextQuest(s.game).id).toBe('encounter-worm');
  });
  it('quest stage and flags persist in state', () => {
    let s = gameReducer(newStore(), { type: 'SET_FLAGS', questId: 'bells-of-the-silent-watch', flags: { askedFirst: 'elowen' } });
    s = gameReducer(s, { type: 'SET_QUEST_STAGE', questId: 'bells-of-the-silent-watch', stage: 3 });
    expect(s.game.progress.questState['bells-of-the-silent-watch']).toEqual({ stage: 3, flags: { askedFirst: 'elowen' } });
  });
});

describe('world map unlock conditions', () => {
  const by = (id) => REGIONS.find((r) => r.id === id);
  it('only the Crownlands is open at the start', () => {
    const g = newStore().game;
    expect(regionStatus(by('crownlands'), g)).toBe('available');
    for (const r of REGIONS.filter((x) => x.id !== 'crownlands')) expect(regionStatus(r, g), r.id).toBe('locked');
  });
  it('Chapter 1 opens the Rune Gates and the Nightwatch Citadel', () => {
    const g = completeChapter1(newStore()).game;
    expect(regionStatus(by('rune_gates'), g)).toBe('available');
    expect(regionStatus(by('nightwatch_citadel'), g)).toBe('available');
    expect(regionStatus(by('shattered_web'), g)).toBe('locked');
  });
  it('level requirements are honoured', () => {
    let s = completeChapter1(newStore());
    for (const id of ['trojan-beginner', 'trojan-intermediate', 'trojan-boss']) s = passChallenge(s, id);
    s = gameReducer(s, { type: 'COMPLETE_QUEST', questId: 'encounter-trojan' });
    expect(regionStatus(by('shattered_web'), s.game)).toBe('available');
    const needsLevel = unmetRequirements(by('veil_of_twilight').unlock, s.game);
    expect(needsLevel.join(' ')).toMatch(/Complete/);
  });
  it('Crownlands progress percentage updates as quests complete', () => {
    const before = regionProgress(by('crownlands'), newStore().game);
    expect(before.percent).toBe(0);
    const after = regionProgress(by('crownlands'), completeChapter1(newStore()).game);
    expect(after.percent).toBe(25);
    expect(after.total).toBe(4);
  });
  it('every post-Crownlands region has an associated playable field study', () => {
    const assigned = REGIONS.flatMap((region) => (region.studies || []).map((id) => ({ region, id })));
    const studyCreatures = MALWARE_CREATURES.filter((creature) => creature.availability === 'field-study');
    expect(assigned.map(({ id }) => id).sort()).toEqual(studyCreatures.map(({ id }) => id).sort());
    for (const { region, id } of assigned) {
      expect(MALWARE_CREATURES.find((creature) => creature.id === id)?.studyRegionId).toBe(region.id);
      expect(regionStatus(region, newStore().game)).toBe('locked');
    }
  });
  it('regional field study completion updates its progress and status', () => {
    const region = REGIONS.find((entry) => entry.id === 'rune_gates');
    let state = completeChapter1(newStore());
    expect(regionProgress(region, state.game)).toEqual({ done: 0, total: 1, percent: 0, playable: true });
    state = passChallenge(state, 'virus-beginner');
    expect(regionProgress(region, state.game)).toEqual({ done: 1, total: 1, percent: 100, playable: true });
    expect(regionStatus(region, state.game)).toBe('completed');
  });
});
