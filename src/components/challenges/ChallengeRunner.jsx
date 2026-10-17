import { useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { validateChallenge, isAnswerComplete, getHint } from '../../engine/challengeEngine.js';
import { computeXpAward } from '../../engine/progressionEngine.js';
import { useGame } from '../../state/GameContext.jsx';
import { useSound } from '../../hooks/useSound.js';
import { Button, Panel } from '../common/ui.jsx';
import { MultipleChoice, MultiSelect, MatchPairs, SortOrder, DecisionTree, PermissionReview, FillIn } from './ChallengeParts.jsx';
import NetworkSpread from './NetworkSpread.jsx';
import { localizeChapter1 } from '../../i18n/chapter1.js';
import { t } from '../../i18n/index.js';

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

/**
 * Renders any challenge from its data definition, validates with the pure engine, records the result
 * (XP is awarded only on the first pass), and offers hints and retries so players are never stuck.
 */
export default function ChallengeRunner({ challenge, grimoire, onContinue, onResult, continueLabel = 'Continue', reviewMode = false }) {
  const { game, dispatch } = useGame();
  const play = useSound();
  const Renderer = RENDERERS[challenge.type];
  const localizedChallenge = localizeChapter1(challenge, game.settings.language);
  const localizedContinueLabel = localizeChapter1(continueLabel, game.settings.language);
  const [answer, setAnswer] = useState(challenge.type === 'sort_order' ? challenge.data.items.map((i) => i.id) : undefined);
  const [hintsShown, setHintsShown] = useState(0);
  const [result, setResult] = useState(null);
  const [award, setAward] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const feedbackRef = useRef(null);

  const record = game.progress.challengeRecords[challenge.id];
  const [wasPassed] = useState(Boolean(record?.passed)); // fixed at mount so feedback does not flip after a fresh pass
  const complete = isAnswerComplete(challenge, answer);
  const hints = localizedChallenge.hints ?? [];

  const submit = () => {
    const res = validateChallenge(challenge, answer);
    const xp = computeXpAward(challenge, res, hintsShown, record);
    setResult(localizeChapter1(res, game.settings.language));
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
        <h3 id={`ch-${challenge.id}`}>{localizedChallenge.title}</h3>
        <span className={`chip chip-diff chip-${challenge.difficulty}`}>{t(game.settings.language, `challenge.difficulty.${challenge.difficulty}`)}</span>
      </header>
      <p className="objective"><strong>{t(game.settings.language, 'challenge.goal')}:</strong> {localizedChallenge.objective}</p>
      <p className="instructions">{localizedChallenge.instructions}</p>
      {reviewMode && wasPassed && <p className="ledger-note">{t(game.settings.language, 'challenge.reviewMode')}</p>}

      <div className="challenge-body">
        <Renderer key={attempt} challenge={localizedChallenge} answer={answer} setAnswer={setAnswer} result={result} locked={Boolean(result?.passed)} language={game.settings.language} />
      </div>

      {hints.length > 0 && !result?.passed && (
        <div className="hints">
          {hints.slice(0, hintsShown).map((h, i) => <p key={i} className="hint">          <Lightbulb size={14} aria-hidden="true" /> <span className="sr-only">{t(game.settings.language, 'challenge.hint')} {i + 1}: </span>{h}</p>)}
          {getHint(challenge, hintsShown) !== null && (
            <Button variant="ghost" onClick={() => setHintsShown((n) => n + 1)}>
              {t(game.settings.language, 'challenge.showHint')} ({hints.length - hintsShown} {t(game.settings.language, 'challenge.left')}{hintsShown === 0 && !wasPassed ? `, ${t(game.settings.language, 'challenge.smallXpCost')}` : ''})
            </Button>
          )}
        </div>
      )}

      {!result && (
        <div className="challenge-actions">
          <Button onClick={submit} disabled={!complete}>{t(game.settings.language, 'challenge.check')}</Button>
          {!complete && <span className="muted">{t(game.settings.language, 'challenge.completeFirst')}</span>}
        </div>
      )}

      {result && (
        <div className={`feedback ${result.passed ? 'feedback-good' : 'feedback-bad'}`} role="status" tabIndex={-1} ref={feedbackRef}>
          <strong>{result.passed ? `✔ ${t(game.settings.language, 'challenge.wellDone')}` : `✖ ${t(game.settings.language, 'challenge.notYet')}`}</strong>
          <p>{result.feedback}</p>
          {result.passed && award > 0 && <p className="xp-note">+{award} XP</p>}
          {result.passed && award === 0 && wasPassed && <p className="xp-note">{t(game.settings.language, 'challenge.alreadyPassed')}</p>}
          {result.passed ? (
            <Button onClick={onContinue}>{localizedContinueLabel}</Button>
          ) : (
            <>
              <p className="muted">{t(game.settings.language, 'challenge.retryHelp')}</p>
              <Button onClick={retry}>{t(game.settings.language, 'challenge.tryAgain')}</Button>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}
