import { describe, expect, it } from 'vitest';
import { evaluateInvestigation } from '../engine/investigationEngine.js';
import { gameReducer } from '../state/gameReducer.js';
import { completeChapter1, newStore } from './helpers.js';

const ANSWER = {
  connections: ['login-to-export', 'export-to-gate'],
  conclusionId: 'supported-correlation',
  nextEvidenceId: 'corroborating-records',
};

describe('evidence-based investigation board', () => {
  it('keeps the case sealed until all required chapter challenges are passed', () => {
    const result = evaluateInvestigation('watchtower', ANSWER, {});
    expect(result.unlocked).toBe(false);
    expect(result.missingChallenges).toEqual(['c1-ledger', 'c1-timeline', 'c1-shapeshifter']);
  });

  it('requires the exact supported timeline links, a measured conclusion, and corroboration', () => {
    const game = completeChapter1(newStore()).game;
    const result = evaluateInvestigation('watchtower', ANSWER, game.progress.challengeRecords);
    expect(result).toMatchObject({
      unlocked: true,
      passed: true,
      score: 1,
      checks: { connectionsCorrect: true, conclusionCorrect: true, nextEvidenceCorrect: true },
    });

    const guess = evaluateInvestigation('watchtower', {
      connections: ['same-person-proven'],
      conclusionId: 'proven-attribution',
      nextEvidenceId: 'assume-attacker',
    }, game.progress.challengeRecords);
    expect(guess.passed).toBe(false);
    expect(guess.score).toBe(0);
  });

  it('awards investigation XP only once, even when the case is replayed', () => {
    const started = completeChapter1(newStore());
    const initialXp = started.game.progress.xp;
    const first = gameReducer(started, { type: 'SUBMIT_INVESTIGATION', boardId: 'watchtower', answer: ANSWER });
    expect(first.game.progress.xp).toBe(initialXp + 35);
    expect(first.game.progress.skillXp.forensics).toBe(started.game.progress.skillXp.forensics + 35);
    expect(first.game.progress.investigationRecords.watchtower).toEqual({ passed: true, bestScore: 1, attempts: 1 });

    const replay = gameReducer(first, { type: 'SUBMIT_INVESTIGATION', boardId: 'watchtower', answer: ANSWER });
    expect(replay.game.progress.xp).toBe(first.game.progress.xp);
    expect(replay.game.progress.investigationRecords.watchtower.attempts).toBe(2);
  });

  it('does not record or reward submissions before the board is unlocked', () => {
    const started = newStore();
    const next = gameReducer(started, { type: 'SUBMIT_INVESTIGATION', boardId: 'watchtower', answer: ANSWER });
    expect(next).toBe(started);
  });
});
