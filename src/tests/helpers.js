import { gameReducer, initStore } from '../state/gameReducer.js';
import { createInitialState } from '../storage/saveSchema.js';
import { validateChallenge } from '../engine/challengeEngine.js';
import { CHALLENGES } from '../content/index.js';
import { DEFAULT_PLAYER } from '../content/archetypes.js';

/** Builds the correct answer for any challenge purely from its data definition. */
export function correctAnswer(c) {
  const d = c.data;
  switch (c.type) {
    case 'multiple_choice': return d.correctId;
    case 'multi_select': return [...d.correctIds];
    case 'match_pairs': return { ...d.correct };
    case 'sort_order': return [...d.correctOrder];
    case 'decision_tree': return Object.fromEntries(d.steps.map((s) => [s.id, s.options.reduce((b, o) => (o.score > b.score ? o : b)).id]));
    case 'permission_review': return Object.fromEntries(d.items.map((i) => [i.id, { verdict: i.correctVerdict, grants: i.correctVerdict === 'approve' ? i.permissions.filter((p) => p.needed).map((p) => p.id) : [] }]));
    case 'network_spread': return { patientZero: d.graph.source, wrongGuesses: 0, actions: [{ type: 'isolate', node: d.graph.source }], done: true };
    default: throw new Error(`no helper for ${c.type}`);
  }
}

export function newStore(extra = {}) {
  const game = { ...createInitialState(), player: { ...DEFAULT_PLAYER }, pathId: 'blue', ...extra };
  return initStore(game);
}

/** Pass a challenge through the real reducer using the real validator. */
export function passChallenge(store, id, { hints = 0, grimoire } = {}) {
  const c = CHALLENGES[id];
  const result = validateChallenge(c, correctAnswer(c));
  if (!result.passed) throw new Error(`correct answer did not pass ${id}: ${result.feedback}`);
  return gameReducer(store, { type: 'RECORD_CHALLENGE', challengeId: id, result, hintsUsed: hints, grimoire });
}

export function completeChapter1(store) {
  let s = store;
  const gr = { 'c1-events': 'events-alerts-incidents', 'c1-ledger': 'reading-the-ledger', 'c1-timezones': 'timelines-and-time-zones', 'c1-shapeshifter': 'context-and-correlation' };
  for (const id of ['c1-events', 'c1-ledger', 'c1-timeline', 'c1-timezones', 'c1-shapeshifter']) s = passChallenge(s, id, { grimoire: gr[id] });
  return gameReducer(s, { type: 'COMPLETE_QUEST', questId: 'bells-of-the-silent-watch' });
}
