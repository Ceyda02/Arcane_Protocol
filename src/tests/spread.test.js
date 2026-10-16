import { describe, it, expect } from 'vitest';
import { runSimulation, scoreSimulation, exposedNodes, createSimulation } from '../engine/spreadEngine.js';
import { validateChallenge } from '../engine/challengeEngine.js';
import { WORM_GRAPH } from '../content/challenges/malware.js';
import { CHALLENGES } from '../content/index.js';

const run = (actions) => { const s = runSimulation(WORM_GRAPH, actions); return { s, score: scoreSimulation(WORM_GRAPH, s) }; };

describe('worm spread simulation', () => {
  it('starts with only patient zero infected and shows who is exposed', () => {
    const s = createSimulation(WORM_GRAPH);
    expect(s.infected).toEqual(['gatehouse']);
    expect(exposedNodes(WORM_GRAPH, s).sort()).toEqual(['barracks', 'market']);
  });
  it('doing nothing lets the worm reach the archive; patched nodes stay safe', () => {
    const { s, score } = run([]);
    expect(s.infected).toContain('archive');
    expect(s.infected).not.toContain('stables');
    expect(s.infected).not.toContain('kitchen');
    expect(score.protectedArchive).toBe(false);
  });
  it('isolating patient zero early contains it completely', () => {
    const { s, score } = run([{ type: 'isolate', node: 'gatehouse' }]);
    expect(s.infected).toEqual(['gatehouse']);
    expect(score.score).toBe(1);
  });
  it('patching the archive protects it but five nodes are still infected', () => {
    const { s, score } = run([{ type: 'patch', node: 'archive' }]);
    expect(s.infected).not.toContain('archive');
    expect(s.infected).toHaveLength(5);
    expect(score.score).toBe(0.7);
  });
  it('patching an infected node does not cure it', () => {
    const s = runSimulation(WORM_GRAPH, [{ type: 'patch', node: 'gatehouse' }]);
    expect(s.infected).toContain('archive');
    expect(s.log.join(' ')).toMatch(/does not remove the infection/);
  });
  it('isolating the archive saves it but is penalized for taking the key service offline', () => {
    const { score } = run([{ type: 'isolate', node: 'archive' }]);
    expect(score.protectedArchive).toBe(true);
    expect(score.score).toBeLessThan(0.7);
  });
  it('cutting both paths with two isolations also works', () => {
    const { s, score } = run([{ type: 'isolate', node: 'barracks' }, { type: 'isolate', node: 'market' }]);
    expect(s.infected).not.toContain('archive');
    expect(score.protectedArchive).toBe(true);
  });
  it('is deterministic', () => {
    expect(run([{ type: 'wait' }, { type: 'isolate', node: 'relay' }])).toEqual(run([{ type: 'wait' }, { type: 'isolate', node: 'relay' }]));
  });
  it('boss challenge requires the correct patient zero', () => {
    const c = CHALLENGES['worm-boss'];
    const ok = validateChallenge(c, { patientZero: 'gatehouse', wrongGuesses: 0, actions: [{ type: 'isolate', node: 'gatehouse' }], done: true });
    const noZero = validateChallenge(c, { patientZero: 'market', wrongGuesses: 1, actions: [{ type: 'isolate', node: 'gatehouse' }], done: true });
    const fail = validateChallenge(c, { patientZero: 'gatehouse', wrongGuesses: 0, actions: [], done: true });
    expect(ok.passed).toBe(true);
    expect(noZero.passed).toBe(false);
    expect(fail.passed).toBe(false);
  });
});
