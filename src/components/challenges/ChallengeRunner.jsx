import { useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { validateChallenge, isAnswerComplete, getHint } from '../../engine/challengeEngine.js';
import { computeXpAward } from '../../engine/progressionEngine.js';
import { useGame } from '../../state/GameContext.jsx';
import { useSound } from '../../hooks/useSound.js';
import { Button, Panel } from '../common/ui.jsx';
import { MultipleChoice, MultiSelect, MatchPairs, SortOrder, DecisionTree, PermissionReview, FillIn } from './ChallengeParts.jsx';
import NetworkSpread from './NetworkSpread.jsx';

const RENDERERS = {
  multiple_choice: MultipleChoice,
  multi_select: MultiSelect,
  match_pairs: MatchPairs,
  sort_order: SortOrder,
  decision_tree: DecisionTree,
  permission_review: PermissionReview,
  fill_in: FillIn,
  network_spread: NetworkSpread,
};

const DIFFICULTY = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', boss: 'Boss encounter' };

/**
 * Renders any challenge from its data definition, validates with the pure engine, records the result
 * (XP is awarded only on the first pass), and offers hints and retries so players are never stuck.
 */
export default function ChallengeRunner({ challenge, grimoire, onContinue, onResult, continueLabel = 'Continue', reviewMode = false }) {
  const { game, dispatch } = useGame();
  const play = useSound();
  const Renderer = RENDERERS[challenge.type];
  const [answer, setAnswer] = useState(challenge.type === 'sort_order' ? challenge.data.items.map((i) => i.id) : undefined);
  const [hintsShown, setHintsShown] = useState(0);
  const [result, setResult] = useState(null);
  const [award, setAward] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const feedbackRef = useRef(null);

  const record = game.progress.challengeRecords[challenge.id];
  const [wasPassed] = useState(Boolean(record?.passed)); // fixed at mount so feedback does not flip after a fresh pass
  const complete = isAnswerComplete(challenge, answer);
  const hints = challenge.hints ?? [];

  const submit = () => {
    const res = validateChallenge(challenge, answer);
    const xp = computeXpAward(challenge, res, hintsShown, record);
    setResult(res);
    setAward(xp);
    play(res.passed ? 'correct' : 'wrong');
    dispatch({ type: 'RECORD_CHALLENGE', challengeId: challenge.id, result: res, hintsUsed: hintsShown, grimoire });
    onResult?.(res);
    setTimeout(() => feedbackRef.current?.focus(), 0);
  };

  const retry = () => {
    setResult(null);
    if (challenge.type === 'network_spread') { setAnswer(undefined); setAttempt((a) => a + 1); }
  };

  return (
    <Panel className="challenge" aria-labelledby={`ch-${challenge.id}`}>
      <header className="challenge-head">
        <h3 id={`ch-${challenge.id}`}>{challenge.title}</h3>
        <span className={`chip chip-diff chip-${challenge.difficulty}`}>{DIFFICULTY[challenge.difficulty]}</span>
      </header>
      <p className="objective"><strong>Goal:</strong> {challenge.objective}</p>
      <p className="instructions">{challenge.instructions}</p>
      {reviewMode && wasPassed && <p className="ledger-note">Review mode: you have already passed this. Replays do not award XP.</p>}

      <div className="challenge-body">
        <Renderer key={attempt} challenge={challenge} answer={answer} setAnswer={setAnswer} result={result} locked={Boolean(result?.passed)} />
      </div>

      {hints.length > 0 && !result?.passed && (
        <div className="hints">
          {hints.slice(0, hintsShown).map((h, i) => <p key={i} className="hint"><Lightbulb size={14} aria-hidden="true" /> <span className="sr-only">Hint {i + 1}: </span>{h}</p>)}
          {getHint(challenge, hintsShown) !== null && (
            <Button variant="ghost" onClick={() => setHintsShown((n) => n + 1)}>
              Show a hint ({hints.length - hintsShown} left{hintsShown === 0 && !wasPassed ? ', small XP cost' : ''})
            </Button>
          )}
        </div>
      )}

      {!result && (
        <div className="challenge-actions">
          <Button onClick={submit} disabled={!complete}>Check my answer</Button>
          {!complete && <span className="muted">Complete every part first.</span>}
        </div>
      )}

      {result && (
        <div className={`feedback ${result.passed ? 'feedback-good' : 'feedback-bad'}`} role="status" tabIndex={-1} ref={feedbackRef}>
          <strong>{result.passed ? '✔ Well done.' : '✖ Not yet.'}</strong>
          <p>{result.feedback}</p>
          {result.passed && award > 0 && <p className="xp-note">+{award} XP</p>}
          {result.passed && award === 0 && wasPassed && <p className="xp-note">Reviewed. XP is only awarded the first time.</p>}
          {result.passed ? (
            <Button onClick={onContinue}>{continueLabel}</Button>
          ) : (
            <>
              <p className="muted">Re-read the lesson or take a hint, then try again. Nothing is lost.</p>
              <Button onClick={retry}>Try again</Button>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}
