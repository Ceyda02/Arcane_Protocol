import { QUESTS } from '../content/quests/index.js';
import { REGIONS } from '../content/world.js';
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
  const playable = region.quests.filter((id) => quests[id]?.playable);
  if (playable.length === 0) return 'available';
  return playable.every((id) => done(state, id)) ? 'completed' : 'available';
}

/** { done, total, percent, playable } */
export function regionProgress(region, state, quests = QUESTS) {
  const playable = region.quests.filter((id) => quests[id]?.playable);
  const d = playable.filter((id) => done(state, id)).length;
  return { done: d, total: playable.length, percent: playable.length ? Math.round((d / playable.length) * 100) : 0, playable: playable.length > 0 };
}

export const getRegions = () => REGIONS;
