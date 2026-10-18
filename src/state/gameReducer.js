import { createInitialState, defaultSettings } from '../storage/saveSchema.js';
import { CHALLENGES, QUESTS, MALWARE_CREATURES } from '../content/index.js';
import { applyChallengeResult, addXp, newAchievements, updateStreak, levelFromXp, ACHIEVEMENTS } from '../engine/progressionEngine.js';
import { meetsCompletion, questRewards } from '../engine/questEngine.js';
import { questStatus } from '../engine/unlockEngine.js';
import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';
import { evaluateInvestigation } from '../engine/investigationEngine.js';

/**
 * Store shape: { game, events, eventKey }
 * - game: the persisted state (see storage/saveSchema.js)
 * - events: transient notifications from the last action (xp, level, achievement, grimoire, bestiary)
 */
export const initStore = (game = createInitialState()) => ({ game, events: [], eventKey: 0 });

const unique = (arr, ...add) => [...new Set([...arr, ...add])];
const STATUS_RANK = { seen: 1, investigated: 2, defeated: 3 };
const todayStr = () => new Date().toISOString().slice(0, 10);

function bestiaryUp(bestiary, id, status, events) {
  const cur = bestiary[id];
  if (cur && STATUS_RANK[cur] >= STATUS_RANK[status]) return bestiary;
  events.push({ type: 'bestiary', id });
  return { ...bestiary, [id]: status };
}

function unlockPages(progress, ids, events) {
  let grimoire = progress.grimoire;
  for (const id of ids) {
    if (id && !grimoire.includes(id)) {
      grimoire = [...grimoire, id];
      events.push({ type: 'grimoire', id });
    }
  }
  return grimoire === progress.grimoire ? progress : { ...progress, grimoire };
}

function investigationDraft(board, answer = {}) {
  const evidenceIds = board.evidence.map((item) => item.id);
  const validList = (values, allowed) => Array.isArray(values)
    ? [...new Set(values.filter((id) => typeof id === 'string' && allowed.includes(id)))]
    : [];
  const evidenceStatuses = {};
  if (answer.evidenceStatuses && typeof answer.evidenceStatuses === 'object' && !Array.isArray(answer.evidenceStatuses)) {
    for (const [id, status] of Object.entries(answer.evidenceStatuses)) {
      if (evidenceIds.includes(id) && ['relevant', 'irrelevant', 'unresolved'].includes(status)) evidenceStatuses[id] = status;
    }
  }
  return {
    connections: validList(answer.connections, board.connectionIds),
    timelineOrder: validList(answer.timelineOrder, board.timeline.map((event) => event.id)),
    evidenceStatuses,
    boardEvidence: validList(answer.boardEvidence, evidenceIds),
    conclusionId: board.conclusionIds.includes(answer.conclusionId) ? answer.conclusionId : '',
    nextEvidenceId: board.nextEvidenceIds.includes(answer.nextEvidenceId) ? answer.nextEvidenceId : '',
  };
}

function finalize(game, events, levelBefore) {
  let g = game;
  const earned = newAchievements(g);
  if (earned.length) {
    g = { ...g, progress: { ...g.progress, achievements: unique(g.progress.achievements, ...earned) } };
    for (const id of earned) events.push({ type: 'achievement', id, name: ACHIEVEMENTS.find((a) => a.id === id)?.name });
  }
  const levelAfter = levelFromXp(g.progress.xp);
  if (levelAfter > levelBefore) events.push({ type: 'level', level: levelAfter });
  return g;
}

function reduceGame(game, action, events) {
  const levelBefore = levelFromXp(game.progress.xp);
  switch (action.type) {
    case 'CREATE_PLAYER':
      return { ...game, player: action.player };

    case 'SUBMIT_ASSESSMENT':
      return { ...game, assessment: { completed: true, answers: action.answers, result: action.result }, pathId: game.pathId ?? action.result.recommendedPath };

    case 'RETAKE_ASSESSMENT':
      return { ...game, assessment: { completed: false, answers: {}, result: null } };

    case 'SET_PATH':
      return { ...game, pathId: action.pathId };

    case 'SET_QUEST_STAGE': {
      const prev = game.progress.questState[action.questId] ?? { stage: 0, flags: {} };
      const stage = Math.max(0, action.stage);
      return { ...game, progress: { ...game.progress, questState: { ...game.progress.questState, [action.questId]: { ...prev, stage } } } };
    }

    case 'SET_FLAGS': {
      const prev = game.progress.questState[action.questId] ?? { stage: 0, flags: {} };
      return { ...game, progress: { ...game.progress, questState: { ...game.progress.questState, [action.questId]: { ...prev, flags: { ...prev.flags, ...action.flags } } } } };
    }

    case 'RECORD_CHALLENGE': {
      const challenge = CHALLENGES[action.challengeId];
      if (!challenge) return game;
      const { progress: p1, award } = applyChallengeResult(game.progress, challenge, action.result, action.hintsUsed ?? 0);
      let progress = p1;
      if (award) events.push({ type: 'xp', amount: award, skill: challenge.skill });
      let streak = game.streak;
      if (action.result.passed) streak = updateStreak(game.streak, action.today ?? todayStr());

      if (action.result.passed) {
        if (action.grimoire) progress = unlockPages(progress, [action.grimoire], events);
        const creature = MALWARE_CREATURES.find((c) => Object.values(c.challenges).includes(challenge.id));
        if (creature) {
          // Meeting the creature unlocks its entry; passing its beginner study investigates it.
          progress = { ...progress, bestiary: bestiaryUp(progress.bestiary, creature.id, 'investigated', events) };
          if (creature.availability === 'field-study' && challenge.id === creature.challenges.beginner) {
            progress = unlockPages(progress, [`beast-${creature.id}`], events);
          }
          if (challenge.id === creature.challenges.boss) {
            progress = { ...progress, bestiary: bestiaryUp(progress.bestiary, creature.id, 'defeated', events) };
          }
        }
      }
      return finalize({ ...game, progress, streak }, events, levelBefore);
    }

    case 'SUBMIT_INVESTIGATION': {
      const board = INVESTIGATION_BOARDS[action.boardId];
      if (!board) return game;
      const answer = investigationDraft(board, action.answer);
      const result = evaluateInvestigation(action.boardId, answer, game.progress.challengeRecords);
      if (!result.unlocked) return game;

      const previous = game.progress.investigationRecords[board.id];
      const earnedXp = Math.floor(result.score * board.xp);
      const award = Math.max(0, earnedXp - (previous?.rewardedXp ?? 0));
      const record = {
        passed: Boolean(previous?.passed || result.passed),
        bestScore: Math.max(previous?.bestScore ?? 0, result.score),
        attempts: (previous?.attempts ?? 0) + 1,
        rewardedXp: Math.max(previous?.rewardedXp ?? 0, earnedXp),
      };
      let progress = {
        ...game.progress,
        investigationRecords: { ...game.progress.investigationRecords, [board.id]: record },
        investigationDrafts: { ...game.progress.investigationDrafts, [board.id]: answer },
      };
      if (award) {
        progress = addXp(progress, award, board.skill);
        events.push({ type: 'xp', amount: award, skill: board.skill, label: result.passed ? 'Investigation complete' : 'Investigation progress' });
      }
      if (result.passed) {
        progress = unlockPages(progress, board.grimoire ?? [], events);
        for (const id of board.bestiary ?? []) progress = { ...progress, bestiary: bestiaryUp(progress.bestiary, id, 'investigated', events) };
      }
      return finalize({ ...game, progress }, events, levelBefore);
    }

    case 'SAVE_INVESTIGATION_DRAFT': {
      const board = INVESTIGATION_BOARDS[action.boardId];
      if (!board || !evaluateInvestigation(action.boardId, {}, game.progress.challengeRecords).unlocked) return game;
      const draft = investigationDraft(board, action.answer);
      if (JSON.stringify(game.progress.investigationDrafts[board.id]) === JSON.stringify(draft)) return game;
      return { ...game, progress: { ...game.progress, investigationDrafts: { ...game.progress.investigationDrafts, [board.id]: draft } } };
    }

    case 'MARK_CHRONICLE_ENTRY': {
      const entryId = typeof action.entryId === 'string' ? action.entryId.slice(0, 120) : '';
      if (!entryId) return game;
      const current = game.progress.chronicle ?? { readEntryIds: [], pinnedObjectiveId: null, trackerHidden: false };
      const readEntryIds = action.read
        ? [...new Set([...current.readEntryIds, entryId])].slice(-500)
        : current.readEntryIds.filter((id) => id !== entryId);
      if (readEntryIds.length === current.readEntryIds.length && readEntryIds.every((id, index) => id === current.readEntryIds[index])) return game;
      return { ...game, progress: { ...game.progress, chronicle: { ...current, readEntryIds } } };
    }

    case 'PIN_CHRONICLE_OBJECTIVE': {
      const objectiveId = typeof action.objectiveId === 'string' ? action.objectiveId : '';
      if (objectiveId) {
        const separator = objectiveId.indexOf(':');
        const questId = separator > 0 ? objectiveId.slice(0, separator) : '';
        const challengeId = separator > 0 ? objectiveId.slice(separator + 1) : '';
        const quest = QUESTS[questId];
        if (!quest?.playable || !CHALLENGES[challengeId] || !quest.requiredChallenges.includes(challengeId) || game.progress.challengeRecords[challengeId]?.passed) return game;
      }
      const current = game.progress.chronicle ?? { readEntryIds: [], pinnedObjectiveId: null, trackerHidden: false };
      const pinnedObjectiveId = objectiveId || null;
      if (current.pinnedObjectiveId === pinnedObjectiveId) return game;
      return { ...game, progress: { ...game.progress, chronicle: { ...current, pinnedObjectiveId } } };
    }

    case 'SET_CHRONICLE_TRACKER_HIDDEN': {
      const current = game.progress.chronicle ?? { readEntryIds: [], pinnedObjectiveId: null, trackerHidden: false };
      const trackerHidden = Boolean(action.hidden);
      if (current.trackerHidden === trackerHidden) return game;
      return { ...game, progress: { ...game.progress, chronicle: { ...current, trackerHidden } } };
    }

    case 'COMPLETE_QUEST': {
      const quest = QUESTS[action.questId];
      if (!quest || !quest.playable || game.progress.completedQuests.includes(quest.id)) return game;
      if (questStatus(quest, game) !== 'available') return game; // dependencies are enforced by logic, not just by the UI
      if (!meetsCompletion(quest, game.progress)) return game;
      const rewards = questRewards(quest);
      let progress = { ...game.progress, completedQuests: [...game.progress.completedQuests, quest.id] };
      if (rewards.xp) {
        progress = addXp(progress, rewards.xp, rewards.skill);
        events.push({ type: 'xp', amount: rewards.xp, skill: rewards.skill, label: 'Quest complete' });
      }
      const creature = quest.creatureId && MALWARE_CREATURES.find((c) => c.id === quest.creatureId);
      const pages = [...rewards.grimoire, ...(creature?.rewards?.lorePage ? [creature.rewards.lorePage, `beast-${creature.id}`] : [])];
      progress = unlockPages(progress, pages, events);
      for (const b of rewards.bestiary) progress = { ...progress, bestiary: bestiaryUp(progress.bestiary, b, 'seen', events) };
      if (creature) progress = { ...progress, bestiary: bestiaryUp(progress.bestiary, creature.id, 'defeated', events) };
      const orderForQuest = quest.path ?? game.pathId;
      if (orderForQuest) progress = { ...progress, pathsPlayed: unique(progress.pathsPlayed, orderForQuest) };
      // An encounter is studied through the player's chosen order's perspective.
      if (quest.kind === 'encounter' && game.pathId) progress = { ...progress, pathsPlayed: unique(progress.pathsPlayed, game.pathId) };
      events.push({ type: 'quest', id: quest.id, title: quest.title });
      return finalize({ ...game, progress }, events, levelBefore);
    }

    case 'DISCOVER_CREATURE': {
      const progress = { ...game.progress, bestiary: bestiaryUp(game.progress.bestiary, action.id, action.status ?? 'seen', events) };
      return finalize({ ...game, progress }, events, levelBefore);
    }

    case 'TOGGLE_BOOKMARK': {
      const has = game.library.bookmarks.includes(action.id);
      return { ...game, library: { ...game.library, bookmarks: has ? game.library.bookmarks.filter((x) => x !== action.id) : [...game.library.bookmarks, action.id] } };
    }
    case 'TOGGLE_REVIEW_LATER': {
      const has = game.library.reviewLater.includes(action.id);
      return { ...game, library: { ...game.library, reviewLater: has ? game.library.reviewLater.filter((x) => x !== action.id) : [...game.library.reviewLater, action.id] } };
    }

    case 'UPDATE_SETTINGS':
      return { ...game, settings: { ...game.settings, ...action.settings } };

    default:
      return game;
  }
}

export function gameReducer(store, action) {
  switch (action.type) {
    case 'LOAD':
      return initStore(action.game);
    case 'NEW_GAME': {
      const fresh = createInitialState();
      fresh.settings = { ...defaultSettings(), ...(action.keepSettings ? store.game.settings : {}) };
      return initStore(fresh);
    }
    case 'CLEAR_EVENTS':
      return store.events.length ? { ...store, events: [] } : store;
    default: {
      const events = [];
      const game = reduceGame(store.game, action, events);
      if (game === store.game) return store;
      return { game, events, eventKey: events.length ? store.eventKey + 1 : store.eventKey };
    }
  }
}
