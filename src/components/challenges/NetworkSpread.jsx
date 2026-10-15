import { useEffect, useMemo, useState } from 'react';
import { createSimulation, playTurn, exposedNodes } from '../../engine/spreadEngine.js';
import { EvidenceTable } from './ChallengeParts.jsx';
import { Button } from '../common/ui.jsx';

const STATUS = {
  infected: { glyph: '✖', text: 'Infected' },
  isolated: { glyph: '⛔', text: 'Isolated' },
  patched: { glyph: '🛡', text: 'Patched' },
  atrisk: { glyph: '⚠', text: 'At risk next turn' },
  healthy: { glyph: '○', text: 'Healthy' },
};

function nodeStatus(node, sim, exposed) {
  if (sim.infected.includes(node.id)) return sim.isolated.includes(node.id) ? 'isolated' : 'infected';
  if (sim.isolated.includes(node.id)) return 'isolated';
  if (sim.patched.includes(node.id)) return 'patched';
  if (exposed.includes(node.id)) return 'atrisk';
  return 'healthy';
}

export default function NetworkSpread({ challenge, setAnswer, result, locked }) {
  const { graph, evidence } = challenge.data;
  const [phase, setPhase] = useState('zero');
  const [wrong, setWrong] = useState(0);
  const [zeroMsg, setZeroMsg] = useState('');
  const [sim, setSim] = useState(() => createSimulation(graph));
  const [actions, setActions] = useState([]);
  const [selected, setSelected] = useState(null);

  const exposed = useMemo(() => exposedNodes(graph, sim), [graph, sim]);
  const byId = (id) => graph.nodes.find((n) => n.id === id);
  const frozen = locked || sim.finished;

  useEffect(() => {
    if (sim.finished) setAnswer({ patientZero: graph.source, wrongGuesses: wrong, actions, done: true });
  }, [sim.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const guess = (id) => {
    if (id === graph.source) { setPhase('sim'); setZeroMsg(''); return; }
    setWrong((w) => w + 1);
    const n = byId(id);
    const received = evidence.rows.some((r) => r[2] === n.label);
    setZeroMsg(received
      ? `${n.label} received malformed requests. It is a victim, not the source. Look for the record before any request was sent.`
      : `${n.label} shows no abnormal activity in these records. Look for the earliest abnormal record.`);
  };

  const act = (type) => {
    const action = type === 'wait' ? { type } : { type, node: selected };
    if (type !== 'wait' && !selected) return;
    setActions((a) => [...a, action]);
    setSim((s) => playTurn(graph, s, action));
  };

  if (phase === 'zero') {
    return (
      <div className="spread">
        <h4>Step 1: find where it started</h4>
        <EvidenceTable columns={evidence.columns} rows={evidence.rows} caption="Earliest records" />
        <fieldset className="zero-pick">
          <legend>Which hall was infected first?</legend>
          <div className="zero-grid">
            {graph.nodes.map((n) => <Button key={n.id} variant="ghost" onClick={() => guess(n.id)}>{n.label}</Button>)}
          </div>
        </fieldset>
        {zeroMsg && <p className="mark mark-bad" role="status">✖ {zeroMsg}</p>}
      </div>
    );
  }

  const sel = selected ? byId(selected) : null;
  return (
    <div className="spread">
      <h4>Step 2: contain it. One action per turn.</h4>
      <p className="spread-turn" aria-live="polite">Turn {sim.turn} of {graph.maxTurns}. {sim.finished ? 'The spread has stopped.' : 'Choose a hall, then an action.'}</p>
      <div className="spread-layout">
        <svg viewBox="-8 -2 116 108" className="graph" role="img" aria-label="Network map of castle halls. A detailed list of halls and their status follows.">
          {graph.edges.map(([a, b]) => {
            const A = byId(a); const B = byId(b);
            return <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="edge" />;
          })}
          {graph.nodes.map((n) => {
            const st = nodeStatus(n, sim, exposed);
            return (
              <g key={n.id} className={`node node-${st} ${selected === n.id ? 'is-selected' : ''}`} transform={`translate(${n.x} ${n.y})`}
                 role="button" tabIndex={frozen ? -1 : 0} aria-label={`${n.label}: ${STATUS[st].text}`} aria-pressed={selected === n.id}
                 onClick={() => !frozen && setSelected(n.id)}
                 onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !frozen) { e.preventDefault(); setSelected(n.id); } }}>
                <circle r={n.critical ? 6.2 : 5} />
                <text className="node-glyph" textAnchor="middle" dy="1.6">{STATUS[st].glyph}</text>
                <text className="node-label" textAnchor="middle" dy="10">{n.label}</text>
              </g>
            );
          })}
        </svg>
        <div className="spread-side">
          <p className="spread-selected">{sel ? <><strong>{sel.label}</strong><br />{sel.service}</> : 'No hall selected.'}</p>
          <div className="spread-actions">
            <Button variant="danger" disabled={frozen || !selected} onClick={() => act('isolate')}>Isolate</Button>
            <Button variant="primary" disabled={frozen || !selected} onClick={() => act('patch')}>Patch</Button>
            <Button variant="ghost" disabled={frozen} onClick={() => act('wait')}>Wait</Button>
          </div>
          <p className="legend">
            {Object.entries(STATUS).map(([k, v]) => <span key={k}><span aria-hidden="true">{v.glyph}</span> {v.text}</span>)}
          </p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="ledger">
          <caption className="sr-only">Halls and their status</caption>
          <thead><tr><th scope="col">Hall</th><th scope="col">Service</th><th scope="col">Status</th><th scope="col">Select</th></tr></thead>
          <tbody>
            {graph.nodes.map((n) => {
              const st = nodeStatus(n, sim, exposed);
              return (
                <tr key={n.id} className={selected === n.id ? 'is-selected' : ''}>
                  <td>{n.label}{n.critical ? ' (critical)' : ''}</td><td>{n.service}</td>
                  <td>{STATUS[st].glyph} {STATUS[st].text}</td>
                  <td><button type="button" className="link-btn" disabled={frozen} onClick={() => setSelected(n.id)} aria-pressed={selected === n.id}>{selected === n.id ? 'Selected' : 'Select'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ol className="sim-log" aria-live="polite">{sim.log.map((l, i) => <li key={i}>{l}</li>)}</ol>
      {result && <p className="ledger-note">Final: {result.details.sim.infectedCount} node(s) infected. {result.details.sim.notes.join(' ')}</p>}
    </div>
  );
}
