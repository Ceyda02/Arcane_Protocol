import { runSimulation, scoreSimulation } from './spreadEngine.js';

/**
 * Data-driven challenge validation. Every validator is pure and returns:
 * { passed, score (0..1), feedback, details }
 * No player input is ever evaluated as code.
 */
export const CHALLENGE_TYPES = [
  'multiple_choice', 'multi_select', 'match_pairs', 'sort_order', 'decision_tree', 'fill_in', 'network_spread', 'permission_review',
];
export const DEFAULT_PASS = 0.7;

const round2 = (n) => Math.round(n * 100) / 100;
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

const validators = {
  multiple_choice(c, answer) {
    const opt = c.data.options.find((o) => o.id === answer);
    if (!opt) return { passed: false, score: 0, feedback: 'Choose an answer first.', details: {} };
    const ok = opt.id === c.data.correctId;
    return {
      passed: ok,
      score: ok ? 1 : 0,
      feedback: ok ? c.explanation.correct : opt.explanation || c.explanation.wrong || 'Not quite. Review the lesson and try again.',
      details: { chosen: opt.id },
    };
  },

  multi_select(c, answer) {
    const chosen = Array.isArray(answer) ? answer : [];
    const correct = c.data.correctIds;
    const hits = chosen.filter((id) => correct.includes(id)).length;
    const misses = correct.filter((id) => !chosen.includes(id));
    const falsePos = chosen.filter((id) => !correct.includes(id));
    const score = round2(Math.max(0, (hits - falsePos.length * 0.5) / correct.length));
    const passed = misses.length === 0 && falsePos.length === 0;
    const lines = [];
    for (const id of falsePos) lines.push(c.data.explanations?.[id] || `"${id}" is not suspicious on its own.`);
    for (const id of misses) lines.push(c.data.explanations?.[id] || `"${id}" deserved a closer look.`);
    return {
      passed,
      score,
      feedback: passed ? c.explanation.correct : lines.join(' ') || 'Check each item against the lesson.',
      details: { misses, falsePositives: falsePos },
    };
  },

  match_pairs(c, answer = {}) {
    const total = Object.keys(c.data.correct).length;
    const wrong = [];
    let right = 0;
    for (const [l, r] of Object.entries(c.data.correct)) {
      if (answer[l] === r) right += 1;
      else wrong.push(l);
    }
    const score = round2(right / total);
    const passed = score >= (c.passScore ?? 1);
    return {
      passed,
      score,
      feedback: passed
        ? c.explanation.correct
        : `${right} of ${total} pairs match. ${wrong.map((l) => c.data.explanations?.[l] || '').filter(Boolean).join(' ')}`.trim(),
      details: { wrong },
    };
  },

  sort_order(c, answer = []) {
    const correct = c.data.correctOrder;
    if (answer.length !== correct.length) return { passed: false, score: 0, feedback: 'Place every item in the sequence.', details: {} };
    const inPlace = correct.filter((id, i) => answer[i] === id).length;
    const score = round2(inPlace / correct.length);
    const passed = score >= (c.passScore ?? 1);
    return {
      passed,
      score,
      feedback: passed
        ? c.explanation.correct
        : `${inPlace} of ${correct.length} are in the right place. ${c.explanation.wrong || 'Re-read the lesson and look again at the clues.'}`,
      details: { wrongPositions: correct.map((id, i) => (answer[i] === id ? null : i)).filter((x) => x !== null) },
    };
  },

  decision_tree(c, answer = {}) {
    const steps = c.data.steps;
    let total = 0;
    let critical = false;
    const stepResults = [];
    for (const s of steps) {
      const opt = s.options.find((o) => o.id === answer[s.id]);
      const sc = opt ? opt.score : 0;
      if (opt?.critical) critical = true;
      total += sc;
      stepResults.push({
        stepId: s.id,
        optionId: opt?.id ?? null,
        score: sc,
        critical: Boolean(opt?.critical),
        feedback: opt?.feedback ?? 'No decision made.',
      });
    }
    const score = round2(total / steps.length);
    const answered = steps.every((s) => answer[s.id]);
    const passed = answered && !critical && score >= (c.passScore ?? DEFAULT_PASS);
    let feedback = passed
      ? c.explanation.correct
      : critical
        ? c.explanation.critical || 'One decision made things much worse. Review the feedback on each step and try again.'
        : 'Some decisions need another look. Review the feedback on each step.';
    if (!answered) feedback = 'Make a decision at every step first.';
    return { passed, score, feedback, details: { steps: stepResults, critical } };
  },

  fill_in(c, answer = {}) {
    const blanks = c.data.blanks;
    const wrong = blanks.filter((b) => !b.accepted.map(norm).includes(norm(answer[b.id])));
    const score = round2((blanks.length - wrong.length) / blanks.length);
    const passed = wrong.length === 0;
    return {
      passed,
      score,
      feedback: passed ? c.explanation.correct : `Check: ${wrong.map((b) => b.hint || b.id).join('; ')}.`,
      details: { wrong: wrong.map((b) => b.id) },
    };
  },

  network_spread(c, answer = {}) {
    const graph = c.data.graph;
    const actions = Array.isArray(answer.actions) ? answer.actions : [];
    const state = runSimulation(graph, actions);
    const sim = scoreSimulation(graph, state);
    const pzOk = answer.patientZero === graph.source;
    const penalty = Math.min(0.3, (answer.wrongGuesses || 0) * 0.1);
    const score = round2(Math.max(0, (pzOk ? 0.25 : 0) + 0.75 * sim.score - penalty * 0.25));
    const passed = pzOk && sim.protectedArchive && sim.score >= (c.passScore ?? DEFAULT_PASS);
    return {
      passed,
      score,
      feedback: passed
        ? c.explanation.correct
        : sim.protectedArchive
          ? `The archive survived, but the response cost too much. ${sim.notes.join(' ')}`
          : `${sim.notes.join(' ')} ${c.explanation.wrong}`,
      details: { sim, final: state },
    };
  },

  permission_review(c, answer = {}) {
    const items = c.data.items;
    let total = 0;
    const results = [];
    for (const item of items) {
      const a = answer[item.id];
      if (!a || !a.verdict) {
        results.push({ id: item.id, score: 0, note: 'No verdict chosen.' });
        continue;
      }
      const grants = Array.isArray(a.grants) ? a.grants : [];
      const needed = item.permissions.filter((p) => p.needed).map((p) => p.id);
      const verdictOk = a.verdict === item.correctVerdict;
      let grantsOk;
      if (item.correctVerdict === 'approve' && a.verdict === 'approve') grantsOk = sameSet(grants, needed);
      else if (a.verdict === 'approve') grantsOk = false;
      else grantsOk = grants.length === 0;
      const score = (verdictOk ? 0.6 : 0) + (grantsOk ? 0.4 : 0);
      total += score;
      results.push({
        id: item.id,
        score,
        verdictOk,
        grantsOk,
        note: verdictOk && grantsOk ? item.feedback.correct : verdictOk ? item.feedback.grants : item.feedback.verdict,
      });
    }
    const score = round2(total / items.length);
    const answered = items.every((i) => answer[i.id]?.verdict);
    const passed = answered && score >= (c.passScore ?? 0.75);
    return {
      passed,
      score,
      feedback: passed
        ? c.explanation.correct
        : answered
          ? 'Some verdicts or permissions need another look. See the notes on each item.'
          : 'Give every tool a verdict first.',
      details: { items: results },
    };
  },
};

export function validateChallenge(challenge, answer) {
  const fn = validators[challenge.type];
  if (!fn) throw new Error(`Unknown challenge type: ${challenge.type}`);
  return fn(challenge, answer);
}

/** Can the player submit yet? */
export function isAnswerComplete(challenge, answer) {
  switch (challenge.type) {
    case 'multiple_choice': return Boolean(answer);
    case 'multi_select': return Array.isArray(answer) && answer.length > 0;
    case 'match_pairs': return Object.keys(answer || {}).length === Object.keys(challenge.data.correct).length;
    case 'sort_order': return Array.isArray(answer) && answer.length === challenge.data.correctOrder.length;
    case 'decision_tree': return challenge.data.steps.every((s) => answer?.[s.id]);
    case 'fill_in': return challenge.data.blanks.every((b) => norm(answer?.[b.id]));
    case 'network_spread': return Boolean(answer?.done);
    case 'permission_review': return challenge.data.items.every((i) => answer?.[i.id]?.verdict);
    default: return false;
  }
}

/** Hints reveal one at a time. Returns the next hint or null. */
export function getHint(challenge, hintsUsed) {
  const hints = challenge.hints || [];
  return hintsUsed < hints.length ? hints[hintsUsed] : null;
}

/** Check a challenge definition for authoring mistakes (used in tests). */
export function lintChallenge(c) {
  const problems = [];
  for (const f of ['id', 'type', 'title', 'instructions', 'skill', 'difficulty', 'objective', 'data', 'hints', 'explanation', 'xp']) {
    if (c[f] === undefined) problems.push(`${c.id || '?'}: missing ${f}`);
  }
  if (!CHALLENGE_TYPES.includes(c.type)) problems.push(`${c.id}: unknown type ${c.type}`);
  if (!Array.isArray(c.hints) || c.hints.length < 1) problems.push(`${c.id}: needs at least one hint`);
  if (c.type === 'multiple_choice' && !c.data?.options?.some((o) => o.id === c.data.correctId)) problems.push(`${c.id}: correctId not in options`);
  return problems;
}
