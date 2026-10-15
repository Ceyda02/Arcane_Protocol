/**
 * Fictional network-spread simulation (used by the Worm encounter).
 * Pure functions: given a graph and a list of player actions, the outcome is fully deterministic.
 * This is an explanatory model only. It performs no real scanning, networking, or propagation.
 *
 * graph = { nodes: [{id, vulnerable, ...}], edges: [[a,b],...], source, protectedNode, maxTurns }
 */
export function createSimulation(graph) {
  return { turn: 0, infected: [graph.source], isolated: [], patched: [], log: [`Turn 0: ${graph.source} is already infected.`], finished: false };
}

const nodeById = (graph, id) => graph.nodes.find((n) => n.id === id);

export function neighbors(graph, id) {
  const out = [];
  for (const [a, b] of graph.edges) {
    if (a === id) out.push(b);
    else if (b === id) out.push(a);
  }
  return out;
}

/** Which uninfected nodes would catch the worm on the next spread step? */
export function exposedNodes(graph, state) {
  const infected = new Set(state.infected);
  const isolated = new Set(state.isolated);
  const patched = new Set(state.patched);
  const exposed = new Set();
  for (const id of state.infected) {
    if (isolated.has(id)) continue; // an isolated host can't reach its neighbours
    for (const n of neighbors(graph, id)) {
      const node = nodeById(graph, n);
      if (!node || infected.has(n) || isolated.has(n) || patched.has(n)) continue;
      if (node.vulnerable) exposed.add(n);
    }
  }
  return [...exposed];
}

/**
 * Apply one player action, then let the worm spread one hop.
 * action: { type: 'isolate' | 'patch' | 'wait', node?: string }
 */
export function playTurn(graph, state, action) {
  if (state.finished) return state;
  const next = { ...state, infected: [...state.infected], isolated: [...state.isolated], patched: [...state.patched], log: [...state.log] };
  next.turn = state.turn + 1;
  const prefix = `Turn ${next.turn}:`;

  if (action?.type === 'isolate' && nodeById(graph, action.node) && !next.isolated.includes(action.node)) {
    next.isolated.push(action.node);
    next.log.push(`${prefix} you isolated ${nodeById(graph, action.node).label}.`);
  } else if (action?.type === 'patch' && nodeById(graph, action.node)) {
    const n = nodeById(graph, action.node);
    if (next.infected.includes(action.node)) {
      next.log.push(`${prefix} ${n.label} was already infected. Patching closes the hole but does not remove the infection; it needs isolation and cleaning.`);
    } else if (!n.vulnerable) {
      next.log.push(`${prefix} ${n.label} was not vulnerable, so the patch changed nothing.`);
    } else if (!next.patched.includes(action.node)) {
      next.patched.push(action.node);
      next.log.push(`${prefix} you patched ${n.label}; the worm can no longer use that weakness there.`);
    }
  } else {
    next.log.push(`${prefix} you waited.`);
  }

  const newly = exposedNodes(graph, next);
  next.infected.push(...newly);
  if (newly.length) next.log.push(`${prefix} the worm spread to ${newly.map((id) => nodeById(graph, id).label).join(', ')}.`);
  else next.log.push(`${prefix} no new infections.`);

  const stillExposed = exposedNodes(graph, next).length > 0;
  if (!stillExposed || next.turn >= graph.maxTurns) next.finished = true;
  return next;
}

/** Replay a list of actions from the start. */
export function runSimulation(graph, actions) {
  let state = createSimulation(graph);
  for (const a of actions) {
    if (state.finished) break;
    state = playTurn(graph, state, a);
  }
  // Allow remaining spread if the player stops acting early.
  while (!state.finished) state = playTurn(graph, state, { type: 'wait' });
  return state;
}

/** Score a finished simulation 0..1 and explain it. */
export function scoreSimulation(graph, state) {
  const archiveInfected = state.infected.includes(graph.protectedNode);
  const archiveIsolated = state.isolated.includes(graph.protectedNode);
  const infectedCount = state.infected.length;
  const healthyIsolated = state.isolated.filter((id) => !state.infected.includes(id)).length;
  const notes = [];
  if (archiveInfected) {
    notes.push('The worm reached the central archive.');
    return { score: 0.2, protectedArchive: false, infectedCount, notes };
  }
  let score = 1;
  notes.push('The central archive stayed clean.');
  const extraInfected = Math.max(0, infectedCount - 2);
  if (extraInfected) {
    score -= 0.1 * extraInfected;
    notes.push(`${infectedCount} nodes were infected. Earlier containment would have saved more.`);
  }
  if (healthyIsolated) {
    score -= 0.1 * healthyIsolated;
    notes.push(`${healthyIsolated} healthy node(s) were cut off, which disrupts the kingdom's services.`);
  }
  if (archiveIsolated) {
    score -= 0.2;
    notes.push('Isolating the archive protects it but takes your most important service offline.');
  }
  return { score: Math.max(0, Math.round(score * 100) / 100), protectedArchive: true, infectedCount, notes };
}
