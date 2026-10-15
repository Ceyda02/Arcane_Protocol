/**
 * Versioned save schema.
 * - createInitialState(): a brand new game.
 * - migrateSave(raw): upgrades older save versions step by step.
 * - sanitizeState(raw): rebuilds a state object from untrusted data using only known fields/types.
 *
 * Nothing here touches secrets or credentials. Saves live in localStorage and are NOT authentication.
 */
export const SAVE_VERSION = 1;
export const SKILL_IDS = ['networking', 'webapp', 'logs_ir', 'coding', 'vuln', 'forensics', 'malware'];
export const PATH_IDS = ['blue', 'red', 'purple', 'echoes'];

const MAX_STR = 80;
const MAX_LIST = 500;

export const defaultSettings = () => ({
  textSpeed: 'normal', // 'slow' | 'normal' | 'fast' | 'instant'
  textSize: 'normal', // 'normal' | 'large' | 'xlarge'
  reducedMotion: 'system', // 'system' | 'on' | 'off'
  muted: true,
  volume: 0.5,
});

export function createInitialState() {
  return {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    player: null,
    assessment: { completed: false, answers: {}, result: null },
    pathId: null,
    progress: {
      xp: 0,
      skillXp: Object.fromEntries(SKILL_IDS.map((s) => [s, 0])),
      completedQuests: [],
      questState: {},
      challengeRecords: {},
      grimoire: [],
      bestiary: {},
      achievements: [],
      reviewQueue: [],
      pathsPlayed: [],
    },
    library: { bookmarks: [], reviewLater: [] },
    settings: defaultSettings(),
    streak: { count: 0, lastDay: null },
  };
}

/* ---------- helpers ---------- */
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v, fallback = '', max = MAX_STR) => (typeof v === 'string' ? v.slice(0, max) : fallback);
const num = (v, fallback = 0, min = 0, max = 1e9) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const strList = (v) =>
  Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string').map((x) => x.slice(0, MAX_STR)))].slice(0, MAX_LIST) : [];
const oneOf = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);

/* ---------- migrations ---------- */
const migrations = {
  // v0 was an early prototype: { version:0, name, xp, completed:[questIds] }
  0: (old) => {
    const fresh = createInitialState();
    if (typeof old.name === 'string' && old.name.trim()) {
      fresh.player = {
        name: old.name.slice(0, 24),
        address: '',
        archetypeId: 'investigator',
        portraitId: 'mage',
        color: 'violet',
        equipmentId: 'lantern',
      };
    }
    fresh.progress.xp = num(old.xp, 0);
    fresh.progress.completedQuests = strList(old.completed);
    return fresh;
  },
};

export function migrateSave(raw) {
  if (!isObj(raw)) return { ok: false, error: 'invalid' };
  let current = raw;
  let version = typeof raw.version === 'number' ? raw.version : 0;
  if (version > SAVE_VERSION) return { ok: false, error: 'newer-version' };
  while (version < SAVE_VERSION) {
    const step = migrations[version];
    if (!step) return { ok: false, error: 'no-migration' };
    current = step(current);
    version = current.version;
  }
  return { ok: true, data: current };
}

/* ---------- sanitisation ---------- */
function sanitizePlayer(p) {
  if (!isObj(p)) return null;
  const name = str(p.name, '', 24).trim();
  if (!name) return null;
  return {
    name,
    address: str(p.address, '', 16),
    archetypeId: str(p.archetypeId, 'investigator', 32),
    portraitId: str(p.portraitId, 'mage', 32),
    color: str(p.color, 'violet', 16),
    equipmentId: str(p.equipmentId, 'lantern', 32),
  };
}

function sanitizeAssessment(a) {
  if (!isObj(a)) return { completed: false, answers: {}, result: null };
  const answers = {};
  if (isObj(a.answers)) {
    for (const [k, v] of Object.entries(a.answers).slice(0, 100)) {
      if (typeof v === 'string' || (Array.isArray(v) && v.every((x) => typeof x === 'string'))) {
        answers[str(k, '', 40)] = v;
      }
    }
  }
  let result = null;
  if (isObj(a.result) && isObj(a.result.categoryScores) && isObj(a.result.pathScores)) {
    result = {
      categoryScores: Object.fromEntries(
        Object.entries(a.result.categoryScores).map(([k, v]) => [str(k, '', 24), num(v, 0, 0, 1000)]),
      ),
      categoryPercent: isObj(a.result.categoryPercent)
        ? Object.fromEntries(Object.entries(a.result.categoryPercent).map(([k, v]) => [str(k, '', 24), num(v, 0, 0, 100)]))
        : {},
      pathScores: Object.fromEntries(
        Object.entries(a.result.pathScores).map(([k, v]) => [str(k, '', 24), num(v, 0, 0, 1000)]),
      ),
      recommendedPath: oneOf(a.result.recommendedPath, PATH_IDS, 'blue'),
      secondaryPaths: strList(a.result.secondaryPaths).filter((p) => PATH_IDS.includes(p)).slice(0, 2),
      strengths: strList(a.result.strengths),
      toStrengthen: strList(a.result.toStrengthen),
    };
  }
  return { completed: Boolean(a.completed) && result !== null, answers, result };
}

function sanitizeProgress(p) {
  const base = createInitialState().progress;
  if (!isObj(p)) return base;
  const skillXp = { ...base.skillXp };
  if (isObj(p.skillXp)) for (const id of SKILL_IDS) skillXp[id] = num(p.skillXp[id], 0, 0, 1e7);

  const questState = {};
  if (isObj(p.questState)) {
    for (const [qid, q] of Object.entries(p.questState).slice(0, 100)) {
      if (!isObj(q)) continue;
      const flags = {};
      if (isObj(q.flags)) {
        for (const [fk, fv] of Object.entries(q.flags).slice(0, 60)) {
          if (['string', 'boolean', 'number'].includes(typeof fv)) flags[str(fk, '', 40)] = typeof fv === 'string' ? str(fv) : fv;
        }
      }
      questState[str(qid, '', 48)] = { stage: Math.floor(num(q.stage, 0, 0, 200)), flags };
    }
  }

  const challengeRecords = {};
  if (isObj(p.challengeRecords)) {
    for (const [cid, r] of Object.entries(p.challengeRecords).slice(0, 400)) {
      if (!isObj(r)) continue;
      challengeRecords[str(cid, '', 60)] = {
        passed: Boolean(r.passed),
        bestScore: num(r.bestScore, 0, 0, 1),
        attempts: Math.floor(num(r.attempts, 0, 0, 10000)),
        hintsUsed: Math.floor(num(r.hintsUsed, 0, 0, 100)),
        xpAwarded: num(r.xpAwarded, 0, 0, 100000),
      };
    }
  }

  const bestiary = {};
  if (isObj(p.bestiary)) {
    for (const [cid, st] of Object.entries(p.bestiary).slice(0, 100)) {
      bestiary[str(cid, '', 48)] = oneOf(st, ['seen', 'investigated', 'defeated'], 'seen');
    }
  }

  return {
    xp: num(p.xp, 0, 0, 1e8),
    skillXp,
    completedQuests: strList(p.completedQuests),
    questState,
    challengeRecords,
    grimoire: strList(p.grimoire),
    bestiary,
    achievements: strList(p.achievements),
    reviewQueue: strList(p.reviewQueue),
    pathsPlayed: strList(p.pathsPlayed).filter((x) => PATH_IDS.includes(x)),
  };
}

function sanitizeSettings(s) {
  const d = defaultSettings();
  if (!isObj(s)) return d;
  return {
    textSpeed: oneOf(s.textSpeed, ['slow', 'normal', 'fast', 'instant'], d.textSpeed),
    textSize: oneOf(s.textSize, ['normal', 'large', 'xlarge'], d.textSize),
    reducedMotion: oneOf(s.reducedMotion, ['system', 'on', 'off'], d.reducedMotion),
    muted: typeof s.muted === 'boolean' ? s.muted : d.muted,
    volume: num(s.volume, d.volume, 0, 1),
  };
}

export function sanitizeState(raw) {
  const migrated = migrateSave(raw);
  if (!migrated.ok) return migrated;
  const d = migrated.data;
  const state = {
    version: SAVE_VERSION,
    createdAt: num(d.createdAt, Date.now(), 0, 4e12),
    updatedAt: num(d.updatedAt, Date.now(), 0, 4e12),
    player: sanitizePlayer(d.player),
    assessment: sanitizeAssessment(d.assessment),
    pathId: oneOf(d.pathId, PATH_IDS, null),
    progress: sanitizeProgress(d.progress),
    library: {
      bookmarks: strList(d.library?.bookmarks),
      reviewLater: strList(d.library?.reviewLater),
    },
    settings: sanitizeSettings(d.settings),
    streak: {
      count: Math.floor(num(d.streak?.count, 0, 0, 100000)),
      lastDay: typeof d.streak?.lastDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.streak.lastDay) ? d.streak.lastDay : null,
    },
  };
  return { ok: true, state };
}
