import { SKILL_IDS } from '../storage/saveSchema.js';

export const HINT_PENALTY = 0.15;
export const MAX_HINT_PENALTY = 0.45;

export const levelFromXp = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / 60)) + 1;
export const xpForLevel = (level) => 60 * (level - 1) ** 2;
export function levelProgress(xp) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, into: xp - floor, needed: ceil - floor, fraction: (xp - floor) / (ceil - floor) };
}

/**
 * XP is awarded only the first time a challenge is passed. Replays are for review and never farm XP.
 * Score scales the reward; each hint costs 15% (capped at 45%).
 */
export function computeXpAward(challenge, result, hintsUsed, record) {
  if (!result.passed) return 0;
  if (record?.passed) return 0;
  const hintFactor = 1 - Math.min(MAX_HINT_PENALTY, hintsUsed * HINT_PENALTY);
  const scoreFactor = 0.5 + 0.5 * result.score; // a pass is always worth at least half
  return Math.max(1, Math.round(challenge.xp * scoreFactor * hintFactor));
}

/** Pure step: record an attempt and award XP. Returns { progress, award }. */
export function applyChallengeResult(progress, challenge, result, hintsUsed) {
  const prev = progress.challengeRecords[challenge.id];
  const award = computeXpAward(challenge, result, hintsUsed, prev);
  const record = {
    passed: Boolean(prev?.passed) || result.passed,
    bestScore: Math.max(prev?.bestScore ?? 0, result.score),
    attempts: (prev?.attempts ?? 0) + 1,
    hintsUsed: Math.max(prev?.hintsUsed ?? 0, hintsUsed),
    xpAwarded: (prev?.xpAwarded ?? 0) + award,
  };
  const skill = SKILL_IDS.includes(challenge.skill) ? challenge.skill : null;
  let reviewQueue = progress.reviewQueue.filter((id) => id !== challenge.id);
  // A failed attempt on something never passed goes to the review queue; a pass clears it.
  if (!result.passed && !prev?.passed) reviewQueue = [...reviewQueue, challenge.id];
  return {
    award,
    progress: {
      ...progress,
      xp: progress.xp + award,
      skillXp: skill ? { ...progress.skillXp, [skill]: progress.skillXp[skill] + award } : progress.skillXp,
      challengeRecords: { ...progress.challengeRecords, [challenge.id]: record },
      reviewQueue,
    },
  };
}

/** Award bonus XP (e.g. quest completion) to a skill. */
export function addXp(progress, amount, skill) {
  return {
    ...progress,
    xp: progress.xp + amount,
    skillXp: SKILL_IDS.includes(skill) ? { ...progress.skillXp, [skill]: progress.skillXp[skill] + amount } : progress.skillXp,
  };
}

/* ---------------- Achievements (computed from real state) ---------------- */
const passed = (s, id) => Boolean(s.progress.challengeRecords[id]?.passed);

export const ACHIEVEMENTS = [
  { id: 'first_rune', name: 'First Rune', desc: 'Pass your first challenge.', test: (s) => Object.values(s.progress.challengeRecords).some((r) => r.passed) },
  { id: 'keeper_of_secrets', name: 'Keeper of Secrets', desc: 'Unlock five Grimoire pages.', test: (s) => s.progress.grimoire.length >= 5 },
  { id: 'watchtower_detective', name: 'Watchtower Detective', desc: 'Correctly order an incident timeline.', test: (s) => passed(s, 'c1-timeline') },
  { id: 'careful_investigator', name: 'The Careful Investigator', desc: 'Separate evidence from assumptions in the Shapeshifter trial.', test: (s) => passed(s, 'c1-shapeshifter') },
  { id: 'master_of_two_orders', name: 'Master of Two Orders', desc: 'Complete quests under two different orders.', test: (s) => s.progress.pathsPlayed.length >= 2 },
  { id: 'blight_stopper', name: 'Blight Stopper', desc: 'Contain the Spreading Blight before it reaches the archive.', test: (s) => passed(s, 'worm-boss') },
  { id: 'unmasked', name: 'Unmasked', desc: 'See through the False Ally.', test: (s) => passed(s, 'trojan-boss') },
  { id: 'unbowed', name: 'Unbowed', desc: 'Recover the archive without paying the Iron Usurper.', test: (s) => passed(s, 'ransomware-boss') },
  { id: 'bestiary_scholar', name: 'Bestiary Scholar', desc: 'Study five creatures in the Bestiary.', test: (s) => Object.keys(s.progress.bestiary).length >= 5 },
  {
    id: 'clear_sight',
    name: 'Clear Sight',
    desc: 'Pass a boss encounter without using a hint.',
    test: (s) => ['worm-boss', 'trojan-boss', 'ransomware-boss'].some((id) => {
      const r = s.progress.challengeRecords[id];
      return r?.passed && r.hintsUsed === 0;
    }),
  },
];

/** Returns ids of achievements newly earned by `state`. */
export function newAchievements(state) {
  return ACHIEVEMENTS.filter((a) => !state.progress.achievements.includes(a.id) && a.test(state)).map((a) => a.id);
}

/** Optional streak: consecutive calendar days with a passed challenge. */
export function updateStreak(streak, todayStr) {
  if (streak.lastDay === todayStr) return streak;
  const prev = streak.lastDay ? new Date(`${streak.lastDay}T00:00:00Z`) : null;
  const today = new Date(`${todayStr}T00:00:00Z`);
  const consecutive = prev && Math.round((today - prev) / 86400000) === 1;
  return { count: consecutive ? streak.count + 1 : 1, lastDay: todayStr };
}
