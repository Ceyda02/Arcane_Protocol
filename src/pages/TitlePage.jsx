import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { asset } from '../components/common/assets.js';
import { Button, ConfirmDialog } from '../components/common/ui.jsx';
import { nextQuest } from '../engine/questEngine.js';
import { questPath } from '../app/paths.js';
import { t } from '../i18n/index.js';

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
  const language = game.settings.language;

  const startNew = () => { dispatch({ type: 'NEW_GAME', keepSettings: true }); nav('/intro'); };

  return (
    <div className="title-screen" style={{ '--scene': `url(${asset('village')})` }}>
      <div className="title-sky" aria-hidden="true" />
      <div className="title-inner">
        <h1 className="title-logo">The Arcane Protocol</h1>
        <p className="title-tag">{t(language, 'app.tagline')}</p>
        <nav className="title-menu" aria-label={t(language, 'menu.main')}>
          <label className="language-picker">
            <span>{t(language, 'language.label')}</span>
            <select aria-label={t(language, 'language.label')} value={language} onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', settings: { language: e.target.value } })}>
              <option value="tr">{t(language, 'language.turkish')}</option>
              <option value="en">{t(language, 'language.english')}</option>
            </select>
          </label>
          {hasGame ? (
            <>
              <Button onClick={() => nav(continuePath(game))} autoFocus>{t(language, 'menu.continue')}</Button>
              <div className="title-quick">
                <Button variant="ghost" onClick={() => nav('/map')}>{t(language, 'menu.explore')}</Button>
                <Button variant="ghost" onClick={() => nav('/grimoire')}>{t(language, 'menu.grimoire')}</Button>
                <Button variant="ghost" onClick={() => nav('/profile')}>{t(language, 'menu.skills')}</Button>
                <Button variant="ghost" onClick={() => nav('/bestiary')}>{t(language, 'menu.bestiary')}</Button>
              </div>
              <Button variant="ghost" onClick={() => setConfirm(true)}>{t(language, 'menu.new')}</Button>
            </>
          ) : (
            <Button onClick={startNew} autoFocus>{t(language, 'menu.new')}</Button>
          )}
        </nav>
        {saveStatus.error && <p className="banner banner-warn" role="alert">{saveStatus.error}</p>}
        <p className="title-note">{t(language, 'menu.saveNote')}</p>
      </div>
      <ConfirmDialog
        open={confirm}
        title={t(language, 'menu.newTitle')}
        danger
        confirmLabel={t(language, 'menu.erase')}
        cancelLabel={t(language, 'menu.keep')}
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); startNew(); }}
      >
        <p>{t(language, 'menu.eraseWarning')}</p>
      </ConfirmDialog>
    </div>
  );
}
