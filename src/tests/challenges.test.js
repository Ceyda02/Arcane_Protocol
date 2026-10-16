import { describe, it, expect } from 'vitest';
import { validateChallenge, isAnswerComplete, getHint, lintChallenge } from '../engine/challengeEngine.js';
import { ALL_CHALLENGES, CHALLENGES } from '../content/index.js';
import { correctAnswer } from './helpers.js';

describe('challenge definitions', () => {
  it('every challenge is well formed', () => {
    const problems = ALL_CHALLENGES.flatMap(lintChallenge);
    expect(problems).toEqual([]);
  });
  it('ids are unique', () => {
    expect(new Set(ALL_CHALLENGES.map((c) => c.id)).size).toBe(ALL_CHALLENGES.length);
  });
  it('every challenge is solvable with its correct answer', () => {
    for (const c of ALL_CHALLENGES) {
      const r = validateChallenge(c, correctAnswer(c));
      expect(r.passed, c.id).toBe(true);
      expect(isAnswerComplete(c, correctAnswer(c)), c.id).toBe(true);
    }
  });
  it('no challenge is already solved by its initial presentation order', () => {
    for (const c of ALL_CHALLENGES.filter((x) => x.type === 'sort_order')) {
      expect(c.data.items.map((i) => i.id)).not.toEqual(c.data.correctOrder);
    }
  });
});

describe('answer validation', () => {
  it('multiple choice explains the specific wrong answer', () => {
    const c = CHALLENGES['worm-beginner'];
    const r = validateChallenge(c, 'b');
    expect(r.passed).toBe(false);
    expect(r.feedback).toMatch(/virus/i);
  });
  it('requires an answer before checking', () => {
    expect(validateChallenge(CHALLENGES['worm-beginner'], undefined).passed).toBe(false);
    expect(isAnswerComplete(CHALLENGES['worm-beginner'], undefined)).toBe(false);
  });
  it('multi-select penalizes false positives and misses', () => {
    const c = CHALLENGES['c1-ledger'];
    const r = validateChallenge(c, ['r3', 'r5', 'r6']);
    expect(r.passed).toBe(false);
    expect(r.details.falsePositives).toEqual(['r3', 'r5']);
    expect(r.details.misses).toEqual(['r7', 'r8', 'r9']);
  });
  it('sort order scores partial positions and the timezone challenge needs UTC conversion', () => {
    const c = CHALLENGES['c1-timezones'];
    const naive = ['tz-tower', 'tz-gate', 'tz-ledger', 'tz-guild'];
    expect(validateChallenge(c, naive).passed).toBe(false);
    expect(validateChallenge(c, c.data.correctOrder).passed).toBe(true);
  });
  it('match pairs reports which pairs are wrong', () => {
    const c = CHALLENGES['c1-events'];
    const r = validateChallenge(c, { ...c.data.correct, l2: 'incident' });
    expect(r.passed).toBe(false);
    expect(r.details.wrong).toEqual(['l2']);
  });
  it('decision tree: no fixed failure count is accepted as proof (Shapeshifter)', () => {
    const c = CHALLENGES['c1-shapeshifter'];
    const r = validateChallenge(c, { s1: 'c', s2: 'b', s3: 'b' });
    expect(r.passed).toBe(false);
    expect(r.details.steps[0].feedback).toMatch(/No fixed number/);
  });
  it('decision tree: paying the ransom is a critical failure even with otherwise good answers', () => {
    const c = CHALLENGES['ransomware-boss'];
    const good = correctAnswer(c);
    const r = validateChallenge(c, { ...good, r1: 'a' });
    expect(r.passed).toBe(false);
    expect(r.details.critical).toBe(true);
  });
  it('decision tree requires every decision', () => {
    const c = CHALLENGES['ransomware-boss'];
    expect(validateChallenge(c, { r1: 'b' }).passed).toBe(false);
    expect(isAnswerComplete(c, { r1: 'b' })).toBe(false);
  });
  it('ransomware: newest backup is wrong, the tested offline set is right', () => {
    const c = CHALLENGES['ransomware-boss'];
    const r = validateChallenge(c, { ...correctAnswer(c), r4: 'a' });
    expect(r.details.steps.find((s) => s.stepId === 'r4').feedback).toMatch(/Newest is not cleanest/);
  });
  it('permission review: approve-with-least-privilege, reject, and sandbox are each scored', () => {
    const c = CHALLENGES['trojan-boss'];
    const good = correctAnswer(c);
    expect(validateChallenge(c, good).score).toBe(1);
    // Over-granting the backup tool keeps the verdict point but loses the permission point.
    const over = { ...good, backup: { verdict: 'approve', grants: ['read_archive', 'write_vault', 'send_anywhere'] } };
    expect(validateChallenge(c, over).score).toBeCloseTo((3 + 0.6) / 4);
    // Blindly approving the suspicious book fails.
    const bad = { ...good, sums: { verdict: 'approve', grants: ['read_typed'] } };
    expect(validateChallenge(c, { ...bad, fortune: { verdict: 'approve', grants: [] } }).passed).toBe(false);
  });
  it('permission review requires a verdict on every item', () => {
    const c = CHALLENGES['trojan-boss'];
    expect(isAnswerComplete(c, { sums: { verdict: 'reject', grants: [] } })).toBe(false);
  });
  it('unknown types throw rather than silently pass', () => {
    expect(() => validateChallenge({ type: 'nope' }, 1)).toThrow();
  });
});

describe('hints', () => {
  it('reveal in order and then run out', () => {
    const c = CHALLENGES['c1-ledger'];
    expect(getHint(c, 0)).toBe(c.hints[0]);
    expect(getHint(c, 1)).toBe(c.hints[1]);
    expect(getHint(c, c.hints.length)).toBeNull();
  });
});
