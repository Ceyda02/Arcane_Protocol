import { describe, expect, it } from 'vitest';
import { getChronicleData } from '../engine/chronicleEngine.js';
import { gameReducer } from '../state/gameReducer.js';
import { sanitizeState, SAVE_VERSION } from '../storage/saveSchema.js';
import { newStore } from './helpers.js';

describe('Chronicle of Echoes progression', () => {
  it('reveals story people and the original report only after the chapter begins', () => {
    const fresh = newStore().game;
    expect(getChronicleData(fresh).people).toEqual([]);
    expect(getChronicleData(fresh).clues).toEqual([]);

    const begun = {
      ...fresh,
      progress: {
        ...fresh.progress,
        questState: { 'bells-of-the-silent-watch': { stage: 1, flags: { askedFirst: 'ash' } } },
      },
    };
    const data = getChronicleData(begun);
    expect(data.people.map((person) => person.id)).toEqual(['rowan', 'ash', 'elowen']);
    expect(data.clues.map((clue) => clue.id)).toContain('clue:original-report');
    expect(data.journey.map((entry) => entry.id)).toContain('journey:decision:first-question');
  });

  it('reveals Bram and Orla only when the story reaches their scenes', () => {
    const base = newStore().game;
    const atBram = {
      ...base,
      progress: {
        ...base.progress,
        questState: { 'bells-of-the-silent-watch': { stage: 5, flags: {} } },
      },
    };
    expect(getChronicleData(atBram).people.map((person) => person.id)).toContain('bram');
    expect(getChronicleData(atBram).people.map((person) => person.id)).not.toContain('orla');
    const atOrla = {
      ...atBram,
      progress: { ...atBram.progress, questState: { 'bells-of-the-silent-watch': { stage: 10, flags: {} } } },
    };
    expect(getChronicleData(atOrla).people.map((person) => person.id)).toContain('orla');
  });

  it('keeps investigation clues, hypotheses, and unresolved questions distinct', () => {
    const base = newStore().game;
    const unopened = getChronicleData(base);
    expect(unopened.mysteries).toHaveLength(0);

    const investigating = {
      ...base,
      progress: {
        ...base.progress,
        investigationDrafts: {
          watchtower: {
            evidenceStatuses: { 'owner-statement': 'unresolved' },
            boardEvidence: ['login-pattern'],
            conclusionId: 'supported-correlation',
          },
        },
      },
    };
    const data = getChronicleData(investigating);
    expect(data.mysteries).toHaveLength(4);
    expect(data.clues.find((entry) => entry.id === 'clue:watchtower:owner-statement').status).toBe('unresolved');
    expect(data.clues.find((entry) => entry.id === 'hypothesis:watchtower').status).toBe('hypothesis');
    expect(data.clues.find((entry) => entry.id === 'hypothesis:watchtower').descriptionKey).toBe('chronicle.hypothesis.correlation');
  });

  it('derives clue and journey entries deterministically without duplicating saved events', () => {
    const base = newStore().game;
    const completed = {
      ...base,
      progress: {
        ...base.progress,
        completedQuests: ['bells-of-the-silent-watch'],
        challengeRecords: { 'c1-ledger': { passed: true, attempts: 2 } },
        bestiary: { shapeshifter: 'investigated' },
        achievements: ['first_rune'],
        investigationRecords: { watchtower: { passed: false, bestScore: 0.6, attempts: 2 } },
      },
    };
    const first = getChronicleData(completed);
    const second = getChronicleData(completed);
    expect(first).toEqual(second);
    expect(first.clues.filter((entry) => entry.id === 'clue:challenge:c1-ledger')).toHaveLength(1);
    expect(first.journey.map((entry) => entry.id)).toContain('journey:creature:shapeshifter');
    expect(first.journey.map((entry) => entry.id)).toContain('journey:achievement:first_rune');
    expect(first.journey.find((entry) => entry.id === 'journey:investigation:watchtower').status).toBe('active');
  });

  it('persists read state, pinning, and tracker visibility while rejecting invalid objectives', () => {
    const store = newStore();
    const objectiveId = 'bells-of-the-silent-watch:c1-events';
    let changed = gameReducer(store, { type: 'PIN_CHRONICLE_OBJECTIVE', objectiveId });
    changed = gameReducer(changed, { type: 'MARK_CHRONICLE_ENTRY', entryId: 'clue:original-report', read: true });
    changed = gameReducer(changed, { type: 'MARK_CHRONICLE_ENTRY', entryId: 'clue:original-report', read: true });
    changed = gameReducer(changed, { type: 'SET_CHRONICLE_TRACKER_HIDDEN', hidden: true });
    expect(changed.game.progress.chronicle).toEqual({
      readEntryIds: ['clue:original-report'],
      pinnedObjectiveId: objectiveId,
      trackerHidden: true,
    });

    const invalid = gameReducer(changed, { type: 'PIN_CHRONICLE_OBJECTIVE', objectiveId: 'invalid:challenge' });
    expect(invalid.game.progress.chronicle.pinnedObjectiveId).toBe(objectiveId);
    const restored = sanitizeState(changed.game);
    expect(restored.state.progress.chronicle).toEqual(changed.game.progress.chronicle);
  });

  it('migrates existing version-four progress without dropping its challenge history', () => {
    const migrated = sanitizeState({
      version: 4,
      progress: {
        xp: 90,
        challengeRecords: { 'c1-ledger': { passed: true, attempts: 1 } },
        completedQuests: ['bells-of-the-silent-watch'],
      },
    });
    expect(migrated.ok).toBe(true);
    expect(migrated.state.version).toBe(SAVE_VERSION);
    expect(migrated.state.progress.xp).toBe(90);
    expect(migrated.state.progress.challengeRecords['c1-ledger'].passed).toBe(true);
    expect(migrated.state.progress.chronicle).toEqual({ readEntryIds: [], pinnedObjectiveId: null, trackerHidden: false });
  });
});
