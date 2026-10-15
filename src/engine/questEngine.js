import { QUESTS, QUEST_LIST } from '../content/quests/index.js';
import { questStatus } from './unlockEngine.js';

/** A quest is complete when every required challenge has been passed (thresholds live in each challenge). */
export function meetsCompletion(quest, progress) {
  if (!quest.requiredChallenges?.length) return false;
  return quest.requiredChallenges.every((id) => progress.challengeRecords[id]?.passed);
}

export function questProgressFraction(quest, progress) {
  const req = quest.requiredChallenges || [];
  if (!req.length) return 0;
  return req.filter((id) => progress.challengeRecords[id]?.passed).length / req.length;
}

/** Which quest should "Continue Adventure" resume? */
export function nextQuest(state, quests = QUESTS, list = QUEST_LIST) {
  const playable = list.filter((q) => q.playable);
  // 1) a quest that was started but not finished
  const started = playable.find((q) => questStatus(q, state, quests) === 'available' && (state.progress.questState[q.id]?.stage ?? 0) > 0);
  if (started) return started;
  // 2) first available quest not yet completed
  return playable.find((q) => questStatus(q, state, quests) === 'available') ?? null;
}

/** Apply a quest's rewards; returns list of new grimoire ids and bestiary ids to unlock. */
export function questRewards(quest) {
  return { grimoire: quest.reward?.grimoire ?? [], bestiary: quest.reward?.bestiary ?? [], xp: quest.reward?.xp ?? 0, skill: quest.reward?.skill };
}
