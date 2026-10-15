import { useState } from 'react';
import { useGame } from '../state/GameContext.jsx';
import { CHALLENGES } from '../content/index.js';
import ChallengeRunner from '../components/challenges/ChallengeRunner.jsx';
import { Button, EmptyState, Panel } from '../components/common/ui.jsx';

export default function ReviewPage() {
  const { game } = useGame();
  const [id, setId] = useState(null);
  const records = game.progress.challengeRecords;
  const queue = game.progress.reviewQueue.filter((x) => CHALLENGES[x]);
  const done = Object.keys(records).filter((x) => records[x].passed && CHALLENGES[x] && !queue.includes(x));

  if (id && CHALLENGES[id]) {
    return (
      <div className="review">
        <Button variant="ghost" onClick={() => setId(null)}>← Back to review</Button>
        <ChallengeRunner key={id} challenge={CHALLENGES[id]} reviewMode onContinue={() => setId(null)} continueLabel="Done" />
      </div>
    );
  }
  if (queue.length === 0 && done.length === 0) {
    return <EmptyState title="Nothing to review yet">Challenges you miss or complete will appear here so you can practice them again.</EmptyState>;
  }
  const row = (cid, tag) => (
    <li key={cid}>
      <Button variant="ghost" onClick={() => setId(cid)}>{CHALLENGES[cid].title}</Button>
      <span className="muted"> {tag} · {CHALLENGES[cid].objective}</span>
    </li>
  );
  return (
    <div className="review">
      <h1>Review</h1>
      <p className="muted">Practice never costs anything. XP is only awarded the first time you pass a challenge.</p>
      <Panel><h2>Needs another look ({queue.length})</h2>{queue.length ? <ul className="review-list">{queue.map((c) => row(c, 'Missed'))}</ul> : <p className="muted">Nothing is waiting. Well done.</p>}</Panel>
      <Panel><h2>Practice again ({done.length})</h2>{done.length ? <ul className="review-list">{done.map((c) => row(c, 'Passed'))}</ul> : <p className="muted">Passed challenges will appear here.</p>}</Panel>
    </div>
  );
}
