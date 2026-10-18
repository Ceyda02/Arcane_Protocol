import { describe, expect, it } from 'vitest';
import { DISCIPLINES, localizeDiscipline } from '../content/disciplines.js';
import { disciplineNodeStates, disciplineMasterySummary, recommendedDisciplineId, validateDisciplines } from '../engine/disciplineEngine.js';
import { sanitizeState, SAVE_VERSION } from '../storage/saveSchema.js';

describe('Arcane Disciplines', () => {
  it('validates all data-defined prerequisites and challenge references', () => {
    expect(validateDisciplines()).toEqual([]);
    for (const discipline of DISCIPLINES) {
      expect(localizeDiscipline(discipline.title, 'tr')).not.toBe('');
      for (const node of discipline.nodes) expect(localizeDiscipline(node.technical, 'tr')).not.toBe('');
    }
  });

  it('rejects unknown prerequisites and cyclic prerequisite graphs', () => {
    const invalid = [
      { id: 'one', nodes: [{ id: 'a', prerequisites: ['missing'], challengeIds: [] }] },
      { id: 'two', nodes: [
        { id: 'b', prerequisites: ['c'], challengeIds: [] },
        { id: 'c', prerequisites: ['b'], challengeIds: [] },
      ] },
    ];
    expect(validateDisciplines(invalid)).toEqual(expect.arrayContaining([
      'Unknown prerequisite missing on a',
      'Prerequisite cycle at b',
    ]));
  });

  it('unlocks a node only after its prerequisite is mastered', () => {
    const discipline = DISCIPLINES.find((item) => item.id === 'watcher');
    const empty = disciplineNodeStates(discipline);
    expect(empty['watcher-networking']).toBe('available');
    expect(empty['watcher-logs']).toBe('discovered');
    expect(empty['watcher-hunting']).toBe('unknown');

    const afterFoundation = disciplineNodeStates(discipline, {
      'c1-events': { passed: true },
      'c1-ledger': { passed: true },
    });
    expect(afterFoundation['watcher-networking']).toBe('mastered');
    expect(afterFoundation['watcher-logs']).toBe('available');
    expect(afterFoundation['watcher-hunting']).toBe('unknown');
  });

  it('derives mastery from saved challenge evidence across multiple disciplines', () => {
    const records = {
      'c1-timeline': { passed: true },
      'c1-timezones': { passed: true },
      'c1-events': { passed: true },
      'c1-shapeshifter': { passed: true },
    };
    const summaries = disciplineMasterySummary(DISCIPLINES, records);
    expect(summaries['memory-keeper'].mastered).toBe(1);
    expect(summaries.veilkeeper.mastered).toBe(2);
    expect(summaries['rune-architect'].mastered).toBe(0);
  });

  it('recommends a starting discipline from the assessment without locking other branches', () => {
    expect(recommendedDisciplineId({ result: { recommendedPath: 'echoes', pathScores: { echoes: 4 }, categoryScores: {} } }))
      .toBe('memory-keeper');
    expect(recommendedDisciplineId({ result: { recommendedPath: 'blue', pathScores: { blue: 1 }, categoryScores: { coding: 3 } } }))
      .toBe('rune-architect');
    expect(recommendedDisciplineId(null)).toBe('watcher');
  });

  it('restores mastery evidence from existing saved challenge progress', () => {
    const result = sanitizeState({
      version: SAVE_VERSION,
      progress: {
        challengeRecords: {
          'c1-timeline': { passed: true, bestScore: 1, attempts: 1 },
          'c1-timezones': { passed: true, bestScore: 1, attempts: 1 },
        },
      },
    });
    expect(result.ok).toBe(true);
    const memory = DISCIPLINES.find((discipline) => discipline.id === 'memory-keeper');
    expect(disciplineNodeStates(memory, result.state.progress.challengeRecords)['memory-timeline']).toBe('mastered');
  });
});
