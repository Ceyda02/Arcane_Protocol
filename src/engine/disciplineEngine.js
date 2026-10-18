import { CHALLENGES } from '../content/index.js';
import { DISCIPLINES } from '../content/disciplines.js';

const VALID_PATH_IDS = new Set(['blue', 'red', 'purple', 'echoes']);

export function validateDisciplines(disciplines = DISCIPLINES, challengeIds = Object.keys(CHALLENGES)) {
  const errors = [];
  const ids = new Set();
  const allowedChallenges = new Set(challengeIds);

  for (const discipline of disciplines) {
    if (!discipline.id || !Array.isArray(discipline.nodes) || discipline.nodes.length === 0) {
      errors.push(`Invalid discipline: ${discipline.id ?? 'unknown'}`);
      continue;
    }
    for (const node of discipline.nodes) {
      if (ids.has(node.id)) errors.push(`Duplicate node: ${node.id}`);
      ids.add(node.id);
      if (!Array.isArray(node.prerequisites) || !Array.isArray(node.challengeIds)) {
        errors.push(`Invalid node requirements: ${node.id}`);
      }
      for (const challengeId of node.challengeIds ?? []) {
        if (!allowedChallenges.has(challengeId)) errors.push(`Unknown challenge ${challengeId} on ${node.id}`);
      }
    }
  }

  const nodeById = new Map(disciplines.flatMap((discipline) => discipline.nodes.map((node) => [node.id, node])));
  for (const node of nodeById.values()) {
    for (const prerequisite of node.prerequisites ?? []) {
      if (!nodeById.has(prerequisite)) errors.push(`Unknown prerequisite ${prerequisite} on ${node.id}`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) {
      errors.push(`Prerequisite cycle at ${id}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const prerequisite of nodeById.get(id)?.prerequisites ?? []) {
      if (nodeById.has(prerequisite)) visit(prerequisite);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of nodeById.keys()) visit(id);
  return errors;
}

export function disciplineNodeStates(discipline, challengeRecords = {}) {
  const nodes = Object.fromEntries(discipline.nodes.map((node) => [node.id, node]));
  const states = {};
  const resolving = new Set();

  function stateFor(id) {
    if (states[id]) return states[id];
    const node = nodes[id];
    if (!node || resolving.has(id)) return 'unknown';
    resolving.add(id);
    const prerequisiteStates = node.prerequisites.map(stateFor);
    const prerequisitesMastered = prerequisiteStates.every((state) => state === 'mastered');
    const hasChallengeEvidence = node.challengeIds.length > 0
      && node.challengeIds.every((challengeId) => challengeRecords[challengeId]?.passed);
    const state = prerequisitesMastered && hasChallengeEvidence
      ? 'mastered'
      : prerequisitesMastered
        ? 'available'
        : prerequisiteStates.length > 0 && prerequisiteStates.every((value) => ['available', 'mastered'].includes(value))
          ? 'discovered'
          : 'unknown';
    resolving.delete(id);
    states[id] = state;
    return state;
  }

  for (const node of discipline.nodes) stateFor(node.id);
  return states;
}

export function recommendedDisciplineId(assessment) {
  const result = assessment?.result;
  if (!result) return 'watcher';
  const scores = result.categoryScores ?? {};
  const applicationScore = (scores.coding ?? 0) + (scores.webapp ?? 0);
  const pathScore = Math.max(...Object.values(result.pathScores ?? {}).filter(Number.isFinite), 0);
  if (applicationScore > pathScore) return 'rune-architect';
  const path = result.recommendedPath;
  if (!VALID_PATH_IDS.has(path)) return 'watcher';
  return DISCIPLINES.find((discipline) => discipline.assessmentPath === path)?.id ?? 'watcher';
}

export function disciplineMasterySummary(disciplines, challengeRecords) {
  return Object.fromEntries(disciplines.map((discipline) => {
    const states = disciplineNodeStates(discipline, challengeRecords);
    return [discipline.id, {
      mastered: Object.values(states).filter((state) => state === 'mastered').length,
      total: discipline.nodes.length,
    }];
  }));
}
