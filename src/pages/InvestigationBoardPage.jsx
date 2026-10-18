import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ScrollText, Waypoints } from 'lucide-react';
import { Button, Panel } from '../components/common/ui.jsx';
import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';
import { evaluateInvestigation } from '../engine/investigationEngine.js';
import { useGame } from '../state/GameContext.jsx';
import { t } from '../i18n/index.js';

const BOARD = INVESTIGATION_BOARDS.watchtower;
const initialTimeline = BOARD.timeline.map((event) => event.id).reverse();

function defaultDraft(draft) {
  const evidenceIds = BOARD.evidence.map((item) => item.id);
  const timelineIds = BOARD.timeline.map((item) => item.id);
  const uniqueAllowed = (values, allowed) => Array.isArray(values)
    ? [...new Set(values.filter((id) => typeof id === 'string' && allowed.includes(id)))]
    : [];
  const savedTimeline = uniqueAllowed(draft?.timelineOrder, timelineIds);
  const evidenceStatuses = {};
  if (draft?.evidenceStatuses && typeof draft.evidenceStatuses === 'object') {
    for (const [id, status] of Object.entries(draft.evidenceStatuses)) {
      if (evidenceIds.includes(id) && ['relevant', 'irrelevant', 'unresolved'].includes(status)) evidenceStatuses[id] = status;
    }
  }
  return {
    connections: uniqueAllowed(draft?.connections, BOARD.connectionIds),
    timelineOrder: savedTimeline.length === timelineIds.length ? savedTimeline : initialTimeline,
    evidenceStatuses,
    boardEvidence: uniqueAllowed(draft?.boardEvidence, evidenceIds),
    conclusionId: BOARD.conclusionIds.includes(draft?.conclusionId) ? draft.conclusionId : '',
    nextEvidenceId: BOARD.nextEvidenceIds.includes(draft?.nextEvidenceId) ? draft.nextEvidenceId : '',
  };
}

export default function InvestigationBoardPage() {
  const { game, dispatch } = useGame();
  const language = game.settings.language;
  const [result, setResult] = useState(null);
  const draft = defaultDraft(game.progress.investigationDrafts?.[BOARD.id]);
  const missingChallenges = BOARD.requiredChallenges.filter((id) => !game.progress.challengeRecords[id]?.passed);
  const previous = game.progress.investigationRecords[BOARD.id];

  const updateDraft = (patch) => {
    const answer = { ...draft, ...patch };
    dispatch({ type: 'SAVE_INVESTIGATION_DRAFT', boardId: BOARD.id, answer });
    setResult(null);
  };

  const submit = (event) => {
    event.preventDefault();
    const evaluation = evaluateInvestigation(BOARD.id, draft, game.progress.challengeRecords);
    setResult(evaluation);
    if (evaluation.unlocked) dispatch({ type: 'SUBMIT_INVESTIGATION', boardId: BOARD.id, answer: draft });
  };

  const moveTimeline = (eventId, direction) => {
    const index = draft.timelineOrder.indexOf(eventId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= draft.timelineOrder.length) return;
    const timelineOrder = [...draft.timelineOrder];
    [timelineOrder[index], timelineOrder[nextIndex]] = [timelineOrder[nextIndex], timelineOrder[index]];
    updateDraft({ timelineOrder });
  };

  const evidenceById = Object.fromEntries(BOARD.evidence.map((item) => [item.id, item]));

  return (
    <div className="investigation-page">
      <h1><Waypoints size={28} aria-hidden="true" /> {t(language, 'investigation.title')}</h1>
      <p className="lead">{t(language, 'investigation.subtitle')}</p>

      {missingChallenges.length > 0 ? (
        <Panel>
          <h2>{t(language, 'investigation.sealed')}</h2>
          <p>{t(language, 'investigation.prerequisiteHelp')}</p>
          <ul>
            {missingChallenges.map((id) => (
              <li key={id}>{t(language, `investigation.prerequisite.${id}`)}</li>
            ))}
          </ul>
          <Link className="btn btn-primary" to="/quest/bells-of-the-silent-watch">
            <ScrollText size={18} aria-hidden="true" /> {t(language, 'investigation.returnToChapter')}
          </Link>
        </Panel>
      ) : (
        <>
          <Panel className="investigation-case">
            <p className="investigation-case-kicker">{t(language, 'investigation.caseTitle')}</p>
            <h2>{t(language, BOARD.titleKey)}</h2>
            <p>{t(language, BOARD.introductionKey)}</p>
            <h3>{t(language, 'investigation.caseObjectives')}</h3>
            <ul>{BOARD.objectiveKeys.map((key) => <li key={key}>{t(language, key)}</li>)}</ul>
            <p className="muted investigation-save-note">{t(language, 'investigation.progressSaved')}</p>
          </Panel>

          <section className="investigation-desk" aria-label={t(language, 'investigation.boardEvidence')}>
            <div className="investigation-desk-heading">
              <h2>{t(language, 'investigation.evidenceTitle')}</h2>
              <p className="muted">{t(language, 'investigation.evidenceHelp')}</p>
            </div>
            <div className="investigation-evidence-grid">
              {BOARD.clueIds.map((id) => {
                const item = evidenceById[id];
                const status = draft.evidenceStatuses[id] ?? '';
                return (
                  <details key={id} className={`investigation-evidence ${status ? `evidence-${status}` : ''}`}>
                    <summary>
                      <span className="evidence-rune" aria-hidden="true">{item.type === 'alert' ? '!' : item.type === 'document' ? '✦' : 'ᚱ'}</span>
                      <span className="evidence-summary">
                        <strong>{t(language, `investigation.clue.${id}.title`)}</strong>
                        <span className="muted">{t(language, item.sourceKey)}</span>
                      </span>
                      <time className="evidence-time" dateTime={item.time ?? undefined} aria-label={`${t(language, 'investigation.evidenceTime')}: ${item.time ?? '—'}`}>{item.time ?? '—'}</time>
                    </summary>
                    <div className="investigation-evidence-content">
                      <p>{t(language, `investigation.clue.${id}.body`)}</p>
                      <p className="muted"><strong>{t(language, 'investigation.evidenceSource')}:</strong> {t(language, item.sourceKey)}</p>
                      <fieldset className="investigation-classification">
                        <legend>{t(language, 'investigation.classifyEvidence')}</legend>
                        {['relevant', 'irrelevant', 'unresolved'].map((value) => (
                          <label key={value}>
                            <input
                              type="radio"
                              name={`evidence-status-${id}`}
                              value={value}
                              checked={status === value}
                              onChange={() => updateDraft({ evidenceStatuses: { ...draft.evidenceStatuses, [id]: value } })}
                            />
                            {t(language, `investigation.status.${value}`)}
                          </label>
                        ))}
                      </fieldset>
                      <label className="evidence-board-toggle">
                        <input
                          type="checkbox"
                          checked={draft.boardEvidence.includes(id)}
                          onChange={(event) => updateDraft({
                            boardEvidence: event.target.checked
                              ? [...draft.boardEvidence, id]
                              : draft.boardEvidence.filter((value) => value !== id),
                          })}
                        />
                        {t(language, 'investigation.addToBoard')}
                      </label>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          <form className="investigation-review" onSubmit={submit}>
            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.boardEvidence')}</legend>
                <p className="muted">{t(language, 'investigation.boardEvidenceHelp')}</p>
                {draft.boardEvidence.length === 0 ? (
                  <p className="muted">{t(language, 'investigation.boardEvidenceEmpty')}</p>
                ) : (
                  <ul className="investigation-pinned-evidence">
                    {draft.boardEvidence.map((id) => <li key={id}>{t(language, `investigation.clue.${id}.title`)}</li>)}
                  </ul>
                )}
              </fieldset>
            </Panel>

            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.timelineTitle')}</legend>
                <p className="muted">{t(language, 'investigation.timelineHelp')}</p>
                <ol className="investigation-timeline">
                  {draft.timelineOrder.map((id, index) => {
                    const item = evidenceById[id];
                    if (!item) return null;
                    return (
                      <li key={id}>
                        <time dateTime={item.time}>{item.time}</time>
                        <span>{t(language, `investigation.clue.${id}.title`)}</span>
                        <div className="timeline-actions">
                          <button type="button" aria-label={`${t(language, 'investigation.moveEarlier')}: ${t(language, `investigation.clue.${id}.title`)}`} disabled={index === 0} onClick={() => moveTimeline(id, -1)}>
                            <ArrowUp size={16} aria-hidden="true" />
                          </button>
                          <button type="button" aria-label={`${t(language, 'investigation.moveLater')}: ${t(language, `investigation.clue.${id}.title`)}`} disabled={index === draft.timelineOrder.length - 1} onClick={() => moveTimeline(id, 1)}>
                            <ArrowDown size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </fieldset>
            </Panel>

            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.connectionsTitle')}</legend>
                <p className="muted">{t(language, 'investigation.connectionsHelp')}</p>
                <div className="board-options">
                  {BOARD.connectionIds.map((id) => (
                    <label key={id} className="board-option">
                      <input
                        type="checkbox"
                        checked={draft.connections.includes(id)}
                        onChange={(event) => updateDraft({
                          connections: event.target.checked
                            ? [...draft.connections, id]
                            : draft.connections.filter((value) => value !== id),
                        })}
                      />
                      <span>{t(language, `investigation.connection.${id}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Panel>

            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.conclusionTitle')}</legend>
                <div className="board-options">
                  {BOARD.conclusionIds.map((id) => (
                    <label key={id} className="board-option">
                      <input
                        type="radio"
                        name="investigation-conclusion"
                        value={id}
                        checked={draft.conclusionId === id}
                        onChange={() => updateDraft({ conclusionId: id })}
                      />
                      <span>{t(language, `investigation.conclusion.${id}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Panel>

            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.nextEvidenceTitle')}</legend>
                <div className="board-options">
                  {BOARD.nextEvidenceIds.map((id) => (
                    <label key={id} className="board-option">
                      <input
                        type="radio"
                        name="investigation-next-evidence"
                        value={id}
                        checked={draft.nextEvidenceId === id}
                        onChange={() => updateDraft({ nextEvidenceId: id })}
                      />
                      <span>{t(language, `investigation.nextEvidence.${id}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button type="submit">{t(language, 'investigation.submit')}</Button>
            </Panel>
          </form>

          {result?.unlocked && (
            <Panel className={result.passed ? 'board-result is-passed' : 'board-result'}>
              <h2>{t(language, result.passed ? 'investigation.passed' : 'investigation.retry')}</h2>
              <p>{t(language, 'investigation.score')}: {Math.round(result.score * 100)}%</p>
              {result.checks && (
                <ul>
                  <li>{t(language, result.checks.evidenceStatusesCorrect && result.checks.boardEvidenceCorrect ? 'investigation.feedback.evidenceReviewOk' : 'investigation.feedback.evidenceReviewTry')}</li>
                  <li>{t(language, result.checks.timelineCorrect && result.checks.connectionsCorrect ? 'investigation.feedback.connectionsOk' : 'investigation.feedback.connectionsTry')}</li>
                  <li>{t(language, result.checks.conclusionCorrect ? 'investigation.feedback.conclusionOk' : 'investigation.feedback.conclusionTry')}</li>
                  <li>{t(language, result.checks.nextEvidenceCorrect ? 'investigation.feedback.evidenceOk' : 'investigation.feedback.evidenceTry')}</li>
                </ul>
              )}
              <h3>{t(language, 'investigation.learningTitle')}</h3>
              <p>{t(language, 'investigation.learning.beginner')}</p>
              <p className="muted">{t(language, 'investigation.learning.technical')}</p>
              <p className="muted">{t(language, 'investigation.partialXp')}</p>
              {previous && <p className="muted">{t(language, 'investigation.attempts')}: {previous.attempts}</p>}
            </Panel>
          )}

          {previous && !result && (
            <Panel className={previous.passed ? 'board-result is-passed' : 'board-result'}>
              <h2>{t(language, previous.passed ? 'investigation.alreadyPassed' : 'investigation.caseInProgress')}</h2>
              <p>{t(language, 'investigation.bestScore')}: {Math.round(previous.bestScore * 100)}%</p>
              <p className="muted">{t(language, 'investigation.attempts')}: {previous.attempts}</p>
              <p>{t(language, 'investigation.learning.beginner')}</p>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
