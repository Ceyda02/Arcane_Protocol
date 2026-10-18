import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { ASSESSMENT_QUESTIONS, UNSURE_OPTION } from '../content/assessment.js';
import { scoreAssessment } from '../engine/assessmentEngine.js';
import { Button, Panel, ProgressBar } from '../components/common/ui.jsx';
import { localizeAssessmentQuestion, localizeUnsureOption } from '../i18n/assessment.js';
import { t } from '../i18n/index.js';

const KIND_KEYS = {
  choice: 'assessment.kind.choice',
  log: 'assessment.kind.log',
  code: 'assessment.kind.code',
  scenario: 'assessment.kind.scenario',
  interest: 'assessment.kind.interest',
};

export default function AssessmentPage() {
  const { game, dispatch } = useGame();
  const nav = useNavigate();
  const language = game.settings.language;
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const qs = ASSESSMENT_QUESTIONS;
  const q = localizeAssessmentQuestion(qs[i], language);

  if (!started) {
    return (
      <Panel className="assess-intro">
        <h1>{t(language, 'assessment.title')}</h1>
        <p>{t(language, 'assessment.intro').replace('{count}', String(qs.length))}</p>
        <p className="notice">{t(language, 'assessment.disclaimer')}</p>
        <div className="create-actions">
          <Button onClick={() => setStarted(true)}>{t(language, 'assessment.begin')}</Button>
          <Button variant="ghost" onClick={() => nav('/results')}>{t(language, 'assessment.skip')}</Button>
        </div>
        {game.assessment.completed && <p className="muted">{t(language, 'assessment.retaking')}</p>}
      </Panel>
    );
  }

  const unsureOption = localizeUnsureOption(UNSURE_OPTION, language);
  const options = q.skill ? [...q.options, unsureOption] : q.options;
  const last = i === qs.length - 1;
  const finish = () => {
    const result = scoreAssessment(qs, answers);
    dispatch({ type: 'SUBMIT_ASSESSMENT', answers, result });
    nav('/results');
  };

  return (
    <Panel className="assess" aria-labelledby="q-title">
      <p className="muted">{t(language, KIND_KEYS[q.kind])} · {i + 1} {t(language, 'assessment.of')} {qs.length}</p>
      <ProgressBar value={i + 1} max={qs.length} label={t(language, 'assessment.progress')} />
      <h2 id="q-title" className="q-prompt">{q.prompt}</h2>
      <fieldset className="choices">
        <legend className="sr-only">{t(language, 'assessment.choose')}</legend>
        {options.map((o) => (
          <label key={o.id} className={`choice ${answers[q.id] === o.id ? 'is-selected' : ''}`}>
            <input type="radio" name={q.id} checked={answers[q.id] === o.id} onChange={() => setAnswers({ ...answers, [q.id]: o.id })} />
            <span>{o.text}</span>
          </label>
        ))}
      </fieldset>
      <div className="create-actions">
        <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>{t(language, 'assessment.back')}</Button>
        {last
          ? <Button disabled={!answers[q.id]} onClick={finish}>{t(language, 'assessment.results')}</Button>
          : <Button disabled={!answers[q.id]} onClick={() => setI(i + 1)}>{t(language, 'assessment.next')}</Button>}
      </div>
    </Panel>
  );
}
