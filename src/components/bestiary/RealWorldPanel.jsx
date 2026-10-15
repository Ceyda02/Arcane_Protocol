import { useGame } from '../../state/GameContext.jsx';
import { PATHS, PATH_LIST } from '../../content/paths.js';
import { Panel } from '../common/ui.jsx';

/**
 * "Real-World Knowledge": the accurate technical content for a creature.
 * The fantasy lore is metaphor; this panel is the real definition, indicators, and defenses.
 */
export default function RealWorldPanel({ creature, defaultOpen = true }) {
  const { game } = useGame();
  const mine = game.pathId;
  const List = ({ items }) => <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>;
  return (
    <Panel as="aside" className="rwk" aria-label={`Real-World Knowledge: ${creature.malwareType}`}>
      <h3 className="rwk-title">Real-World Knowledge</h3>
      <p className="rwk-type"><strong>{creature.malwareType}</strong> · {creature.category}</p>
      <details open={defaultOpen}>
        <summary>What it is</summary>
        <p>{creature.definition}</p>
        <p><strong>How it behaves:</strong> {creature.behavior}</p>
        <p className="notice"><strong>How it differs from other malware:</strong> {creature.distinguish}</p>
      </details>
      <details>
        <summary>Signs to look for</summary>
        <List items={creature.symptoms} />
        <p className="muted">Synthetic example evidence (fictional hosts, documentation IP ranges):</p>
        <pre className="evidence" tabIndex={0} aria-label="Synthetic evidence">{creature.evidence.join('\n')}</pre>
      </details>
      <details>
        <summary>How defenders respond</summary>
        <p>{creature.defense}</p>
        <h4>Prevention</h4><List items={creature.prevention} />
        <h4>Containment</h4><List items={creature.containment} />
        <h4>Recovery</h4><List items={creature.recovery} />
      </details>
      <details open={Boolean(mine)}>
        <summary>Through the eyes of each order</summary>
        {PATH_LIST.map((p) => (
          <p key={p.id} className={p.id === mine ? 'perspective is-mine' : 'perspective'}>
            <strong>{p.name}{p.id === mine ? ' (yours)' : ''}:</strong> {creature.perspectives[p.id]}
          </p>
        ))}
        <p className="muted">Understanding malware never requires writing it. Everything here is defensive and simulated.</p>
      </details>
      <details>
        <summary>Learn more from trusted sources</summary>
        <ul>{creature.references.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a></li>)}</ul>
      </details>
    </Panel>
  );
}
