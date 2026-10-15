import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { asset } from '../components/common/assets.js';
import { Button, ConfirmDialog } from '../components/common/ui.jsx';
import { nextQuest } from '../engine/questEngine.js';
import { questPath } from '../app/paths.js';

export function continuePath(game) {
  if (!game.assessment.completed && !game.pathId) return '/assessment';
  const q = nextQuest(game);
  return q ? questPath(q) : '/map';
}

export default function TitlePage() {
  const { game, dispatch, saveStatus } = useGame();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const hasGame = Boolean(game.player);

  const startNew = () => { dispatch({ type: 'NEW_GAME', keepSettings: true }); nav('/create'); };

  return (
    <div className="title-screen" style={{ '--scene': `url(${asset('village')})` }}>
      <div className="title-sky" aria-hidden="true" />
      <div className="title-inner">
        <h1 className="title-logo">The Arcane Protocol</h1>
        <p className="title-tag">Every mystery leaves a trace. Every secret has a weakness.</p>
        <nav className="title-menu" aria-label="Main menu">
          {hasGame ? (
            <>
              <Button onClick={() => nav(continuePath(game))} autoFocus>Continue Adventure</Button>
              <div className="title-quick">
                <Button variant="ghost" onClick={() => nav('/map')}>Explore the World</Button>
                <Button variant="ghost" onClick={() => nav('/grimoire')}>Open Grimoire</Button>
                <Button variant="ghost" onClick={() => nav('/profile')}>Review Skills</Button>
                <Button variant="ghost" onClick={() => nav('/bestiary')}>View Bestiary</Button>
              </div>
              <Button variant="ghost" onClick={() => setConfirm(true)}>New Game</Button>
            </>
          ) : (
            <Button onClick={startNew} autoFocus>New Game</Button>
          )}
        </nav>
        {saveStatus.error && <p className="banner banner-warn" role="alert">{saveStatus.error}</p>}
        <p className="title-note">Progress is saved only in this browser. No account, no tracking.</p>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Start a new game?"
        danger
        confirmLabel="Erase and start over"
        cancelLabel="Keep my adventure"
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); startNew(); }}
      >
        <p>Your current character and all progress in this browser will be erased. This cannot be undone.</p>
      </ConfirmDialog>
    </div>
  );
}
