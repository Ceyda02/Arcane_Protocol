import { describe, it, expect } from 'vitest';
import { ASSESSMENT_QUESTIONS } from '../content/assessment.js';
import { scoreAssessment, explainRecommendation } from '../engine/assessmentEngine.js';
import { SKILLS } from '../content/skills.js';

const best = Object.fromEntries(ASSESSMENT_QUESTIONS.filter((q) => q.skill).map((q) => [q.id, q.options.reduce((b, o) => (o.score > b.score ? o : b)).id]));

describe('assessment scoring', () => {
  it('is deterministic for identical answers', () => {
    expect(scoreAssessment(ASSESSMENT_QUESTIONS, best)).toEqual(scoreAssessment(ASSESSMENT_QUESTIONS, best));
  });
  it('gives 100% in every skill for all best answers', () => {
    const r = scoreAssessment(ASSESSMENT_QUESTIONS, best);
    for (const v of Object.values(r.categoryPercent)) expect(v).toBe(100);
  });
  it('gives 0% when every answer is "not sure"', () => {
    const answers = Object.fromEntries(ASSESSMENT_QUESTIONS.map((q) => [q.id, 'unsure']));
    const r = scoreAssessment(ASSESSMENT_QUESTIONS, answers);
    for (const v of Object.values(r.categoryPercent)) expect(v).toBe(0);
  });
  it('breaks ties by the fixed path order (blue first)', () => {
    const r = scoreAssessment(ASSESSMENT_QUESTIONS, {});
    expect(r.recommendedPath).toBe('blue');
    expect(r.secondaryPaths).toEqual(['red', 'purple']);
  });
  it('recommends Echoes when forensics is strong and interest points that way', () => {
    const answers = { ...Object.fromEntries(ASSESSMENT_QUESTIONS.filter((q) => q.skill).map((q) => [q.id, 'unsure'])), 'for-preserve': 'a', 'for-time': 'a', 'int-task': 'd', 'int-trouble': 'd' };
    expect(scoreAssessment(ASSESSMENT_QUESTIONS, answers).recommendedPath).toBe('echoes');
  });
  it('recommends Red when vulnerability and web skills are strong', () => {
    const answers = { 'vuln-idor': 'a', 'vuln-ethics': 'a', 'web-authn': 'a', 'web-input': 'a', 'int-task': 'b', 'int-trouble': 'b' };
    expect(scoreAssessment(ASSESSMENT_QUESTIONS, answers).recommendedPath).toBe('red');
  });
  it('recommends Blue for strong log analysis with matching interest', () => {
    const answers = { 'log-pattern': 'a', 'log-fp': 'a', 'int-task': 'a', 'int-trouble': 'a' };
    expect(scoreAssessment(ASSESSMENT_QUESTIONS, answers).recommendedPath).toBe('blue');
  });
  it('lists areas to strengthen and explains the recommendation without overclaiming', () => {
    const r = scoreAssessment(ASSESSMENT_QUESTIONS, { 'log-pattern': 'a' });
    expect(r.toStrengthen.length).toBeGreaterThan(0);
    expect(explainRecommendation(r, SKILLS)).toMatch(/not a measure of ability/);
  });
  it('every question is answerable beginners can skip, and options have ids', () => {
    for (const q of ASSESSMENT_QUESTIONS) expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
  });
});
