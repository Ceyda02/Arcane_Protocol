import { describe, expect, it } from 'vitest';
import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';
import { evaluateInvestigation } from '../engine/investigationEngine.js';
import { gameReducer } from '../state/gameReducer.js';
import { completeChapter1, newStore } from './helpers.js';

const BOARD = INVESTIGATION_BOARDS.watchtower;
const ANSWER = {
  connections: [...BOARD.correctConnections],
  timelineOrder: BOARD.timeline.map((event) => event.id),
  evidenceStatuses: Object.fromEntries(BOARD.evidence.map(({ id, status }) => [id, status])),
  boardEvidence: [...BOARD.expectedBoardEvidence],
  conclusionId: 'supported-correlation',
  nextEvidenceId: 'corroborating-records',
};

describe('evidence-based investigation board', () => {
  it('keeps the case sealed until all required chapter challenges are passed', () => {
    const result = evaluateInvestigation('watchtower', ANSWER, {});
    expect(result.unlocked).toBe(false);
    expect(result.missingChallenges).toEqual(['c1-ledger', 'c1-timeline', 'c1-shapeshifter']);
  });

  it('requires classified evidence, placed clues, an ordered timeline, supported links, conclusion, and corroboration', () => {
    const game = completeChapter1(newStore()).game;
    const result = evaluateInvestigation('watchtower', ANSWER, game.progress.challengeRecords);
    expect(result).toMatchObject({
      unlocked: true,
      passed: true,
      score: 1,
      checks: {
        connectionsCorrect: true,
        timelineCorrect: true,
        evidenceStatusesCorrect: true,
        boardEvidenceCorrect: true,
        conclusionCorrect: true,
        nextEvidenceCorrect: true,
      },
    });

    const guess = evaluateInvestigation('watchtower', {
      connections: ['same-person-proven'],
      timelineOrder: [...ANSWER.timelineOrder].reverse(),
      evidenceStatuses: {},
      boardEvidence: [],
      conclusionId: 'proven-attribution',
      nextEvidenceId: 'assume-attacker',
    }, game.progress.challengeRecords);
    expect(guess.passed).toBe(false);
    expect(guess.score).toBe(0);
  });

  it('awards partial XP as reasoning improves and never pays the same points twice', () => {
    const started = completeChapter1(newStore());
    const initialXp = started.game.progress.xp;
    const partial = gameReducer(started, {
      type: 'SUBMIT_INVESTIGATION',
      boardId: 'watchtower',
      answer: { ...ANSWER, connections: ['login-to-export'], timelineOrder: [...ANSWER.timelineOrder].reverse(), evidenceStatuses: {}, boardEvidence: [], conclusionId: '', nextEvidenceId: '' },
    });
    expect(partial.game.progress.xp).toBeGreaterThan(initialXp);
    expect(partial.game.progress.investigationRecords.watchtower.passed).toBe(false);

    const first = gameReducer(partial, { type: 'SUBMIT_INVESTIGATION', boardId: 'watchtower', answer: ANSWER });
    expect(first.game.progress.xp).toBe(initialXp + 35);
    expect(first.game.progress.skillXp.forensics).toBe(started.game.progress.skillXp.forensics + 35);
    expect(first.game.progress.investigationRecords.watchtower).toEqual({ passed: true, bestScore: 1, attempts: 2, rewardedXp: 35 });

    const replay = gameReducer(first, { type: 'SUBMIT_INVESTIGATION', boardId: 'watchtower', answer: ANSWER });
    expect(replay.game.progress.xp).toBe(first.game.progress.xp);
    expect(replay.game.progress.investigationRecords.watchtower.attempts).toBe(3);
  });

  it('persists a sanitized draft and ignores invalid evidence, statuses, and relationships', () => {
    const started = completeChapter1(newStore());
    const saved = gameReducer(started, {
      type: 'SAVE_INVESTIGATION_DRAFT',
      boardId: 'watchtower',
      answer: { ...ANSWER, connections: ['login-to-export', 'forged'], evidenceStatuses: { 'owner-statement': 'unresolved', injected: 'relevant' } },
    });
    expect(saved.game.progress.investigationDrafts.watchtower.connections).toEqual(['login-to-export']);
    expect(saved.game.progress.investigationDrafts.watchtower.evidenceStatuses).toEqual({ 'owner-statement': 'unresolved' });
    const unchanged = gameReducer(started, { type: 'SAVE_INVESTIGATION_DRAFT', boardId: 'unknown', answer: ANSWER });
    expect(unchanged).toBe(started);
  });

  it('does not record or reward submissions before the board is unlocked', () => {
    const started = newStore();
    const next = gameReducer(started, { type: 'SUBMIT_INVESTIGATION', boardId: 'watchtower', answer: ANSWER });
    expect(next).toBe(started);
  });
});
