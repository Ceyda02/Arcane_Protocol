import { CHALLENGES, QUESTS, MALWARE_CREATURES } from '../content/index.js';
import { CHRONICLE_MYSTERIES, CHRONICLE_PEOPLE, CHALLENGE_FINDING_KEYS, QUEST_TRANSLATION_KEYS } from '../content/chronicle.js';
import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';
import { GRIMOIRE_BY_ID } from '../content/lessons/grimoire.js';
import { REGIONS } from '../content/world.js';
import { REALM_CREATURES } from '../content/bestiary.js';
import { localizeBestiaryCreature } from '../i18n/bestiary.js';
import { localizeChapter1 } from '../i18n/chapter1.js';
import { localizeMalwareChallenge } from '../i18n/malware.js';
import { questStatus, regionStatus } from './unlockEngine.js';
import { ACHIEVEMENTS } from './progressionEngine.js';

function localizedChallenge(challenge, language) {
  if (challenge.id.startsWith('c1-')) return localizeChapter1(challenge, language);
  return localizeMalwareChallenge(challenge, language);
}

function questEntry(quest, game, language) {
  const progress = game.progress.questState[quest.id] ?? { stage: 0, flags: {} };
  const record = game.progress.challengeRecords;
  const passed = quest.requiredChallenges.filter((id) => record[id]?.passed).length;
  const nextChallenge = quest.requiredChallenges.map((id) => CHALLENGES[id]).find((item) => item && !record[item.id]?.passed);
  const localized = nextChallenge ? localizedChallenge(nextChallenge, language) : null;
  const objectives = quest.requiredChallenges.map((id) => {
    const challenge = CHALLENGES[id];
    if (!challenge) return null;
    const item = localizedChallenge(challenge, language);
    return {
      id: `${quest.id}:${id}`,
      challengeId: id,
      title: item.title,
      description: item.objective,
      passed: Boolean(record[id]?.passed),
    };
  }).filter(Boolean);
  const key = QUEST_TRANSLATION_KEYS[quest.id] ?? 'bells';
  const completed = game.progress.completedQuests.includes(quest.id);
  const started = progress.stage > 0 || Object.keys(progress.flags).length > 0;
  return {
    id: `quest:${quest.id}`,
    questId: quest.id,
    type: 'quest',
    questKind: quest.kind,
    regionId: quest.regionId,
    titleKey: `quest.${key}.title`,
    descriptionKey: `quest.${key}.summary`,
    status: completed ? 'completed' : started ? 'active' : 'available',
    passed,
    total: quest.requiredChallenges.length,
    objectives,
    prerequisiteIds: [...(quest.requires ?? []), ...(quest.requiresAny ?? [])],
    rewardXp: quest.reward?.xp ?? 0,
    rewardPageCount: quest.reward?.grimoire?.length ?? 0,
    currentObjective: localized?.objective ?? '',
    currentObjectiveId: nextChallenge ? `${quest.id}:${nextChallenge.id}` : '',
    route: quest.kind === 'encounter' ? `/encounter/${quest.id}` : `/quest/${quest.id}`,
  };
}

function challengeClues(game, language) {
  const questId = 'bells-of-the-silent-watch';
  const chapterProgress = game.progress.questState[questId];
  const report = chapterProgress?.stage > 0 || game.progress.completedQuests.includes(questId)
    ? [{
      id: 'clue:original-report',
      type: 'report',
      titleKey: 'chronicle.originalReport.title',
      descriptionKey: 'chronicle.originalReport.body',
      status: 'confirmed',
      sourceKey: 'quest.bells.title',
    }]
    : [];
  return [...report, ...Object.entries(game.progress.challengeRecords)
    .filter(([id, record]) => record.passed && CHALLENGES[id])
    .map(([id, record]) => {
      const challenge = localizedChallenge(CHALLENGES[id], language);
      const findingKey = CHALLENGE_FINDING_KEYS[id] ?? 'generic';
      const sourceQuest = Object.values(QUESTS).find((quest) => quest.requiredChallenges.includes(id));
      return {
        id: `clue:challenge:${id}`,
        type: 'challenge',
        title: challenge.title,
        descriptionKey: `journal.finding.${findingKey}`,
        status: 'confirmed',
        sourceKey: `quest.${QUEST_TRANSLATION_KEYS[sourceQuest?.id] ?? 'bells'}.title`,
        attempts: record.attempts,
      };
    })];
}

function investigationClues(game) {
  const board = game.progress.investigationDrafts.watchtower;
  const record = game.progress.investigationRecords.watchtower;
  if (!board && !record) return [];
  const ids = new Set(board ? INVESTIGATION_BOARDS.watchtower.clueIds : []);
  if (record?.passed) for (const id of ['login-pattern', 'ledger-export', 'gate-opening', 'historical-login', 'owner-statement', 'alert-context', 'scheduled-delivery']) ids.add(id);
  const clues = [...ids].map((id) => {
    const status = board?.evidenceStatuses?.[id] ?? 'unresolved';
    return {
      id: `clue:watchtower:${id}`,
      type: 'investigation',
      titleKey: `investigation.clue.${id}.title`,
      descriptionKey: `investigation.clue.${id}.body`,
      sourceKey: 'investigation.caseTitle',
      status,
      statusKey: `investigation.status.${status}`,
    };
  });
  if (board?.conclusionId) {
    const cautious = board.conclusionId === 'supported-correlation';
    clues.push({
      id: 'hypothesis:watchtower',
      type: 'hypothesis',
      titleKey: 'chronicle.hypothesis.title',
      descriptionKey: cautious ? 'chronicle.hypothesis.correlation' : `chronicle.hypothesis.${board.conclusionId}`,
      status: cautious ? 'hypothesis' : 'unsupported',
    });
  }
  return clues;
}

function mysteryEntries(game) {
  if (!game.progress.investigationDrafts.watchtower && !game.progress.investigationRecords.watchtower) return [];
  return CHRONICLE_MYSTERIES.map((mystery) => ({
    id: `mystery:${mystery.id}`,
    type: 'mystery',
    titleKey: mystery.titleKey,
    descriptionKey: mystery.summaryKey,
    status: 'unresolved',
  }));
}

function lessonEntries(game, language) {
  const unlocked = game.progress.grimoire
    .map((id) => GRIMOIRE_BY_ID[id])
    .filter(Boolean)
    .map((page) => {
      const localized = localizeChapter1(page, language);
      return {
        id: `lesson:${page.id}`,
        type: 'lesson',
        title: localized.title,
        description: localized.plain ?? localized.concept,
        technical: localized.technical,
        status: 'learned',
        route: '/grimoire',
      };
    });
  const review = game.progress.reviewQueue
    .map((id) => CHALLENGES[id])
    .filter(Boolean)
    .map((challenge) => {
      const localized = localizedChallenge(challenge, language);
      return {
        id: `review:${challenge.id}`,
        type: 'review',
        title: localized.title,
        descriptionKey: `journal.finding.${CHALLENGE_FINDING_KEYS[challenge.id] ?? 'generic'}`,
        status: 'review',
        route: '/review',
      };
    });
  return [...unlocked, ...review];
}

function peopleEntries(game) {
  const questId = 'bells-of-the-silent-watch';
  const progress = game.progress.questState[questId];
  const complete = game.progress.completedQuests.includes(questId);
  if (!progress && !complete) return [];
  const stage = complete ? Number.POSITIVE_INFINITY : progress.stage;
  return CHRONICLE_PEOPLE
    .filter((person) => stage >= person.minimumStage)
    .map((person) => ({ id: `person:${person.id}`, type: 'person', ...person }));
}

function journeyEntries(game, language) {
  const completedQuests = game.progress.completedQuests
    .map((id) => QUESTS[id])
    .filter(Boolean)
    .map((quest) => {
      const key = QUEST_TRANSLATION_KEYS[quest.id] ?? 'bells';
      return {
        id: `journey:quest:${quest.id}`,
        type: 'milestone',
        titleKey: `quest.${key}.title`,
        descriptionKey: `quest.${key}.summary`,
        status: 'completed',
      };
    });
  const regions = REGIONS
    .filter((region) => regionStatus(region, game) !== 'locked')
    .map((region) => ({
      id: `journey:region:${region.id}`,
      type: 'region',
      titleKey: `region.${region.id}`,
      descriptionKey: `region.${region.id}.lore`,
      status: 'discovered',
    }));
  const creatures = Object.keys(game.progress.bestiary)
    .map((id) => [...REALM_CREATURES, ...MALWARE_CREATURES].find((item) => item.id === id))
    .filter(Boolean)
    .map((creature) => {
      const localized = localizeBestiaryCreature(creature, language);
      return {
        id: `journey:creature:${creature.id}`,
        type: 'creature',
        title: localized.name,
        description: localized.blurb ?? localized.tease ?? localized.lore ?? '',
        status: 'discovered',
        route: '/bestiary',
      };
    });
  const achievements = game.progress.achievements
    .map((id) => ACHIEVEMENTS.find((achievement) => achievement.id === id))
    .filter(Boolean)
    .map((achievement) => ({
      id: `journey:achievement:${achievement.id}`,
      type: 'achievement',
      titleKey: `chronicle.achievement.${achievement.id}.title`,
      descriptionKey: `chronicle.achievement.${achievement.id}.description`,
      status: 'earned',
    }));
  const progress = game.progress.questState['bells-of-the-silent-watch'];
  const flags = progress?.flags ?? {};
  const decisions = [];
  if (['ash', 'elowen'].includes(flags.askedFirst)) decisions.push({
    id: 'journey:decision:first-question',
    type: 'decision',
    titleKey: 'chronicle.decision.first.title',
    descriptionKey: `chronicle.decision.first.${flags.askedFirst}`,
    status: 'discovered',
  });
  if (Object.prototype.hasOwnProperty.call(flags, 'askedBram')) decisions.push({
    id: 'journey:decision:verify-owner',
    type: 'decision',
    titleKey: 'chronicle.decision.owner.title',
    descriptionKey: `chronicle.decision.owner.${flags.askedBram ? 'ask' : 'record'}`,
    status: 'discovered',
  });
  const investigation = game.progress.investigationRecords.watchtower;
  const investigations = investigation ? [{
    id: 'journey:investigation:watchtower',
    type: 'milestone',
    titleKey: 'chronicle.investigationRecord.title',
    descriptionKey: 'chronicle.investigationRecord.summary',
    score: Math.round(investigation.bestScore * 100),
    status: investigation.passed ? 'completed' : 'active',
  }] : [];
  return [...completedQuests, ...regions, ...creatures, ...achievements, ...decisions, ...investigations];
}

function fieldStudyEntries(game, language) {
  return REGIONS
    .filter((region) => regionStatus(region, game) !== 'locked')
    .flatMap((region) => (region.studies || []).map((creatureId) => {
      const creature = MALWARE_CREATURES.find((item) => item.id === creatureId);
      const challenge = creature && CHALLENGES[creature.challenges.beginner];
      if (!creature || !challenge) return null;
      const localizedCreature = localizeBestiaryCreature(creature, language);
      const localizedChallengeDefinition = localizedChallenge(challenge, language);
      const passed = Boolean(game.progress.challengeRecords[challenge.id]?.passed);
      return {
        id: `study:${creature.id}`,
        type: 'study',
        questKind: 'encounter',
        regionId: region.id,
        title: `${localizedCreature.name}: ${localizedCreature.title}`,
        description: localizedCreature.tease,
        status: passed ? 'completed' : 'available',
        passed: Number(passed),
        total: 1,
        objective: localizedChallengeDefinition.objective,
        route: `/study/${creature.id}`,
        objectives: [],
      };
    }))
    .filter(Boolean);
}

export function getChronicleData(game, language = game.settings.language) {
  const quests = Object.values(QUESTS)
    .filter((quest) => quest.playable && questStatus(quest, game) !== 'locked')
    .map((quest) => questEntry(quest, game, language))
    .concat(fieldStudyEntries(game, language));
  return {
    quests,
    clues: [...challengeClues(game, language), ...investigationClues(game)],
    mysteries: mysteryEntries(game),
    lessons: lessonEntries(game, language),
    people: peopleEntries(game),
    journey: journeyEntries(game, language),
  };
}

export function findChronicleQuestObjective(game, objectiveId) {
  if (typeof objectiveId !== 'string') return null;
  const [questId, challengeId] = objectiveId.split(':');
  const quest = QUESTS[questId];
  const challenge = CHALLENGES[challengeId];
  if (!quest?.playable || !challenge || !quest.requiredChallenges.includes(challengeId)) return null;
  return { quest, challenge };
}

export function getNewChronicleCount(data, readEntryIds) {
  const read = new Set(readEntryIds);
  return Object.values(data).flat().filter((entry) => !read.has(entry.id)).length;
}
