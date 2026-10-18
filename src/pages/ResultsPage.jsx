import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { PATHS, PATH_LIST } from '../content/paths.js';
import { SKILLS, ASSESSED_SKILLS } from '../content/skills.js';
import { explainRecommendation } from '../engine/assessmentEngine.js';
import { Button, Panel, ProgressBar } from '../components/common/ui.jsx';
import { t } from '../i18n/index.js';

function PathCard({ path, selected, onChoose, tag }) {
  return (
    <article className={`path-card ${selected ? 'is-selected' : ''}`} data-order={path.colorKey}>
      <h3>{path.name}: {path.title}</h3>
      {tag && <p className="muted">{tag}</p>}
      <p>{path.blurb}</p>
      <p className="muted">Focus: {path.focus.join(', ')}.</p>
      <p className="muted">Starter quest: “{path.starterQuest}”{path.id !== 'blue' ? ' (sealed in this release)' : ''}</p>
      <Button variant={selected ? 'primary' : 'ghost'} onClick={onChoose} aria-pressed={selected}>{selected ? '✔ Your current order' : `Walk the ${path.name}`}</Button>
    </article>
  );
}

export default function ResultsPage() {
  const { game, dispatch } = useGame();
  const nav = useNavigate();
  const language = game.settings.language;
  const result = game.assessment.result;
  const choose = (id) => dispatch({ type: 'SET_PATH', pathId: id });
  const retake = () => { dispatch({ type: 'RETAKE_ASSESSMENT' }); nav('/assessment'); };

  return (
    <div className="results">
      <h1>{result ? 'Your starting path' : 'Choose your order'}</h1>
      <p className="notice">{t(language, 'assessment.disclaimer')}</p>

      {result && (
        <>
          <Panel>
            <h2>Recommended: {PATHS[result.recommendedPath].name}</h2>
            <p>{explainRecommendation(result, SKILLS)}</p>
            <h3>Also worth exploring</h3>
            <p>{result.secondaryPaths.map((p) => PATHS[p].name).join(' and ')}.</p>
            <div className="two-col">
              <div>
                <h3>What you showed</h3>
                <ul>{result.strengths.length ? result.strengths.map((s) => <li key={s}>{SKILLS[s].name}</li>) : <li>You are at the start of the road, and that is a fine place to be.</li>}</ul>
              </div>
              <div>
                <h3>Areas to strengthen</h3>
                <ul>{result.toStrengthen.map((s) => <li key={s}>{SKILLS[s].name}</li>)}</ul>
              </div>
            </div>
            <h3>Skill snapshot</h3>
            <div className="skill-bars">
              {ASSESSED_SKILLS.map((s) => (
                <div key={s} className="skill-row">
                  <span>{SKILLS[s].name}</span>
                  <ProgressBar value={result.categoryPercent[s]} max={100} label={`${SKILLS[s].name} result`} />
                  <span>{result.categoryPercent[s]}%</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      <h2>All four orders</h2>
      <div className="path-grid">
        {PATH_LIST.map((p) => (
          <PathCard key={p.id} path={p} selected={game.pathId === p.id} onChoose={() => choose(p.id)}
            tag={result?.recommendedPath === p.id ? 'Recommended for you' : result?.secondaryPaths.includes(p.id) ? 'Also suggested' : null} />
        ))}
      </div>
      <p className="muted">Every order shares the same foundations. You can switch orders or retake the trial at any time from your profile.</p>
      <div className="create-actions">
        <Button disabled={!game.pathId} onClick={() => nav('/map')}>Enter Hexaria</Button>
        <Button variant="ghost" onClick={retake}>{result ? 'Retake the Trial' : 'Take the Trial'}</Button>
      </div>
    </div>
  );
}
