import { PATHS, PATH_ORDER } from '../content/paths.js';
import { ASSESSED_SKILLS } from '../content/skills.js';

/**
 * Deterministic scoring for "The Trial of Three Runes".
 * Each option has { score: 0..2 } toward its question's skill, and optional { interest: {pathId: points} }.
 * No randomness. Ties are broken by the fixed order in PATH_ORDER.
 */
export function scoreAssessment(questions, answers) {
  const earned = Object.fromEntries(ASSESSED_SKILLS.map((s) => [s, 0]));
  const possible = Object.fromEntries(ASSESSED_SKILLS.map((s) => [s, 0]));
  const interest = Object.fromEntries(PATH_ORDER.map((p) => [p, 0]));

  for (const q of questions) {
    const opts = q.options;
    if (q.skill) {
      const weight = q.weight ?? 1;
      possible[q.skill] += Math.max(...opts.map((o) => o.score ?? 0)) * weight;
      const chosen = opts.find((o) => o.id === answers[q.id]);
      if (chosen) earned[q.skill] += (chosen.score ?? 0) * weight;
    }
    const chosen = opts.find((o) => o.id === answers[q.id]);
    if (chosen?.interest) for (const [p, pts] of Object.entries(chosen.interest)) interest[p] += pts;
  }

  const categoryPercent = {};
  for (const s of ASSESSED_SKILLS) categoryPercent[s] = possible[s] ? Math.round((earned[s] / possible[s]) * 100) : 0;

  // Path score = skill-affinity (0..100 scale) + interest points (each worth 5)
  const pathScores = {};
  for (const p of PATH_ORDER) {
    const aff = PATHS[p].affinity;
    const skillPart = ASSESSED_SKILLS.reduce((sum, s) => sum + (aff[s] ?? 0) * categoryPercent[s], 0);
    pathScores[p] = Math.round((skillPart + interest[p] * 5) * 10) / 10;
  }

  const ranked = [...PATH_ORDER].sort((a, b) => pathScores[b] - pathScores[a] || PATH_ORDER.indexOf(a) - PATH_ORDER.indexOf(b));
  const bySkill = [...ASSESSED_SKILLS].sort((a, b) => categoryPercent[b] - categoryPercent[a] || ASSESSED_SKILLS.indexOf(a) - ASSESSED_SKILLS.indexOf(b));
  const strengths = bySkill.filter((s) => categoryPercent[s] >= 60).slice(0, 3);
  const toStrengthen = [...bySkill].reverse().filter((s) => categoryPercent[s] < 60).slice(0, 2);

  return {
    categoryScores: earned,
    categoryPercent,
    pathScores,
    recommendedPath: ranked[0],
    secondaryPaths: ranked.slice(1, 3),
    strengths,
    toStrengthen: toStrengthen.length ? toStrengthen : [bySkill[bySkill.length - 1]],
  };
}

/** Plain-language reason for the recommendation. */
export function explainRecommendation(result, skills) {
  const path = PATHS[result.recommendedPath];
  const aff = path.affinity;
  const topSkills = Object.entries(aff).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([s]) => s);
  const parts = topSkills.map((s) => `${skills[s].name} (${result.categoryPercent[s]}%)`);
  return `${path.name} weighs ${parts.join(' and ')} most heavily, and those were among the answers that shaped your score. This is a starting suggestion from a short quiz, not a measure of ability or a career verdict. You can walk any path at any time.`;
}
