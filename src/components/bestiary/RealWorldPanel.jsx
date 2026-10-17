import { useGame } from '../../state/GameContext.jsx';
import { PATHS, PATH_LIST } from '../../content/paths.js';
import { Panel } from '../common/ui.jsx';
import { t } from '../../i18n/index.js';

/**
 * "Real-World Knowledge": the accurate technical content for a creature.
 * The fantasy lore is metaphor; this panel is the real definition, indicators, and defenses.
 */
export default function RealWorldPanel({ creature, defaultOpen = true }) {
  const { game } = useGame();
  const mine = game.pathId;
  const language = game.settings.language;
  const List = ({ items }) => <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>;
  return (
    <Panel as="aside" className="rwk" aria-label={`${t(language, 'realWorld.title')}: ${creature.malwareType}`}>
      <h3 className="rwk-title">{t(language, 'realWorld.title')}</h3>
      <p className="rwk-type"><strong>{creature.malwareType}</strong> · {t(language, `bestiary.category.${creature.category}`)}</p>
      <details open={defaultOpen}>
        <summary>{t(language, 'realWorld.whatItIs')}</summary>
        <p>{creature.definition}</p>
        <p><strong>{t(language, 'realWorld.howBehaves')}</strong> {creature.behavior}</p>
        <p className="notice"><strong>{t(language, 'realWorld.differs')}</strong> {creature.distinguish}</p>
      </details>
      <details>
        <summary>{t(language, 'realWorld.signs')}</summary>
        <List items={creature.symptoms} />
        <p className="muted">{t(language, 'realWorld.synthetic')}</p>
        <pre className="evidence" tabIndex={0} aria-label={t(language, 'realWorld.syntheticLabel')}>{creature.evidence.join('\n')}</pre>
      </details>
      <details>
        <summary>{t(language, 'realWorld.defendersRespond')}</summary>
        <p>{creature.defense}</p>
        <h4>{t(language, 'realWorld.prevention')}</h4><List items={creature.prevention} />
        <h4>{t(language, 'realWorld.containment')}</h4><List items={creature.containment} />
        <h4>{t(language, 'realWorld.recovery')}</h4><List items={creature.recovery} />
      </details>
      <details open={Boolean(mine)}>
        <summary>{t(language, 'realWorld.perspectives')}</summary>
        {PATH_LIST.map((p) => (
          <p key={p.id} className={p.id === mine ? 'perspective is-mine' : 'perspective'}>
            <strong>{t(language, `realWorld.order.${p.id}`)}{p.id === mine ? ` (${t(language, 'realWorld.yours')})` : ''}:</strong> {creature.perspectives[p.id]}
          </p>
        ))}
        <p className="muted">{t(language, 'realWorld.safeLearning')}</p>
      </details>
      <details>
        <summary>{t(language, 'realWorld.trustedSources')}</summary>
        <ul>{creature.references.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a></li>)}</ul>
      </details>
    </Panel>
  );
}
