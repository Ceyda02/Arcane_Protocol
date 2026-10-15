import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { ASSESSMENT_QUESTIONS, ASSESSMENT_DISCLAIMER, UNSURE_OPTION } from '../content/assessment.js';
import { scoreAssessment } from '../engine/assessmentEngine.js';
import { Button, Panel, ProgressBar } from '../components/common/ui.jsx';

const KIND = { choice: 'Question', log: 'Read the log', code: 'Read the code', scenario: 'Scenario', interest: 'About you' };

export default function AssessmentPage() {
  const { game, dispatch } = useGame();
  const nav = useNavigate();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const qs = ASSESSMENT_QUESTIONS;
  const q = qs[i];

  if (!started) {
    return (
      <Panel className="assess-intro">
        <h1>The Trial of Three Runes</h1>
        <p>A short set of questions about {qs.length} questions long, about 5 to 8 minutes. No cybersecurity experience is needed. Choose “I’m not sure yet” whenever you like.</p>
        <p className="notice">{ASSESSMENT_DISCLAIMER}</p>
        <div className="create-actions">
          <Button onClick={() => setStarted(true)}>Begin the Trial</Button>
          <Button variant="ghost" onClick={() => nav('/results')}>Skip and choose a path myself</Button>
        </div>
        {game.assessment.completed && <p className="muted">You have taken this before. Retaking replaces your earlier result but keeps your progress.</p>}
      </Panel>
    );
  }

  const options = q.skill ? [...q.options, UNSURE_OPTION] : q.options;
  const last = i === qs.length - 1;
  const finish = () => {
    const result = scoreAssessment(qs, answers);
    dispatch({ type: 'SUBMIT_ASSESSMENT', answers, result });
    nav('/results');
  };

  return (
    <Panel className="assess" aria-labelledby="q-title">
      <p className="muted">{KIND[q.kind]} · {i + 1} of {qs.length}</p>
      <ProgressBar value={i + 1} max={qs.length} label="Trial progress" />
      <h2 id="q-title" className="q-prompt">{q.prompt}</h2>
      <fieldset className="choices">
        <legend className="sr-only">Choose one answer</legend>
        {options.map((o) => (
          <label key={o.id} className={`choice ${answers[q.id] === o.id ? 'is-selected' : ''}`}>
            <input type="radio" name={q.id} checked={answers[q.id] === o.id} onChange={() => setAnswers({ ...answers, [q.id]: o.id })} />
            <span>{o.text}</span>
          </label>
        ))}
      </fieldset>
      <div className="create-actions">
        <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        {last
          ? <Button disabled={!answers[q.id]} onClick={finish}>See my path</Button>
          : <Button disabled={!answers[q.id]} onClick={() => setI(i + 1)}>Next</Button>}
      </div>
    </Panel>
  );
}
