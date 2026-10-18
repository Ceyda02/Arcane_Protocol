import { QUESTS } from '../content/quests/index.js';
import { REGIONS } from '../content/world.js';
import { CREATURES_BY_ID } from '../content/malware/creatures.js';
import { levelFromXp } from './progressionEngine.js';

const done = (state, id) => state.progress.completedQuests.includes(id);

/** Describe requirements that are not yet met. Empty array = unlocked. */
export function unmetRequirements(rule, state, quests = QUESTS) {
  const out = [];
  for (const id of rule.quests || []) if (!done(state, id)) out.push(`Complete “${quests[id]?.title ?? id}”`);
  if (rule.anyQuests?.length && !rule.anyQuests.some((id) => done(state, id))) {
    out.push(`Complete one of: ${rule.anyQuests.map((id) => `“${quests[id]?.title ?? id}”`).join(' or ')}`);
  }
  if (rule.minLevel && levelFromXp(state.progress.xp) < rule.minLevel) out.push(`Reach level ${rule.minLevel}`);
  return out;
}

export const isUnlocked = (rule, state, quests) => unmetRequirements(rule, state, quests).length === 0;

export function questRule(quest) {
  return { quests: quest.requires || [], anyQuests: quest.requiresAny || [], minLevel: quest.minLevel };
}

/** 'completed' | 'available' | 'locked' | 'coming_soon' */
export function questStatus(quest, state, quests = QUESTS) {
  if (!quest.playable) return isUnlocked(questRule(quest), state, quests) ? 'coming_soon' : 'locked';
  if (done(state, quest.id)) return 'completed';
  return isUnlocked(questRule(quest), state, quests) ? 'available' : 'locked';
}

export function regionStatus(region, state, quests = QUESTS) {
  if (!isUnlocked(region.unlock, state, quests)) return 'locked';
  const playableQuests = region.quests.filter((id) => quests[id]?.playable);
  const studies = region.studies || [];
  if (playableQuests.length === 0 && studies.length === 0) return 'available';
  const questsComplete = playableQuests.every((id) => done(state, id));
  const studiesComplete = studies.every((id) => {
    const challengeId = CREATURES_BY_ID[id]?.challenges.beginner;
    return challengeId && state.progress.challengeRecords[challengeId]?.passed;
  });
  return questsComplete && studiesComplete ? 'completed' : 'available';
}

/** { done, total, percent, playable } for quests and regional field studies. */
export function regionProgress(region, state, quests = QUESTS) {
  const playableQuests = region.quests.filter((id) => quests[id]?.playable);
  const studies = region.studies || [];
  const completedQuests = playableQuests.filter((id) => done(state, id)).length;
  const completedStudies = studies.filter((id) => {
    const challengeId = CREATURES_BY_ID[id]?.challenges.beginner;
    return Boolean(challengeId && state.progress.challengeRecords[challengeId]?.passed);
  }).length;
  const total = playableQuests.length + studies.length;
  const completed = completedQuests + completedStudies;
  return { done: completed, total, percent: total ? Math.round((completed / total) * 100) : 0, playable: total > 0 };
}

export const getRegions = () => REGIONS;
