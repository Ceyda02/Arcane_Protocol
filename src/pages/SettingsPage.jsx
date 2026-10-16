import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { Button, ConfirmDialog, Panel } from '../components/common/ui.jsx';
import { playSound } from '../components/common/sound.js';
import { t } from '../i18n/index.js';

export default function SettingsPage() {
  const { game, dispatch, resetGame, saveStatus } = useGame();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const s = game.settings;
  const language = s.language;
  const set = (patch) => dispatch({ type: 'UPDATE_SETTINGS', settings: patch });

  return (
    <div className="settings">
      <h1>{t(language, 'settings.title')}</h1>
      <Panel>
        <h2>{t(language, 'settings.reading')}</h2>
        <label className="field"><span>{t(language, 'settings.language')}</span>
          <select value={s.language} onChange={(e) => set({ language: e.target.value })}>
            <option value="tr">{t(language, 'language.turkish')}</option><option value="en">{t(language, 'language.english')}</option>
          </select>
        </label>
        <label className="field"><span>{t(language, 'settings.textSpeed')}</span>
          <select value={s.textSpeed} onChange={(e) => set({ textSpeed: e.target.value })}>
            <option value="slow">{t(language, 'settings.slow')}</option><option value="normal">{t(language, 'settings.normal')}</option><option value="fast">{t(language, 'settings.fast')}</option><option value="instant">{t(language, 'settings.instant')}</option>
          </select>
        </label>
        <label className="field"><span>{t(language, 'settings.textSize')}</span>
          <select value={s.textSize} onChange={(e) => set({ textSize: e.target.value })}>
            <option value="normal">{t(language, 'settings.normal')}</option><option value="large">{t(language, 'settings.large')}</option><option value="xlarge">{t(language, 'settings.xlarge')}</option>
          </select>
        </label>
        <label className="field"><span>{t(language, 'settings.motion')}</span>
          <select value={s.reducedMotion} onChange={(e) => set({ reducedMotion: e.target.value })}>
            <option value="system">{t(language, 'settings.system')}</option><option value="on">{t(language, 'settings.on')}</option><option value="off">{t(language, 'settings.off')}</option>
          </select>
        </label>
      </Panel>
      <Panel>
        <h2>{t(language, 'settings.sound')}</h2>
        <p className="muted">{t(language, 'settings.soundNote')}</p>
        <label className="check"><input type="checkbox" checked={s.muted} onChange={(e) => set({ muted: e.target.checked })} /> <span>{t(language, 'settings.mute')}</span></label>
        <label className="field"><span>{t(language, 'settings.volume')}: {Math.round(s.volume * 100)}%</span>
          <input type="range" min="0" max="1" step="0.05" value={s.volume} disabled={s.muted} onChange={(e) => set({ volume: Number(e.target.value) })} />
        </label>
        <Button variant="ghost" disabled={s.muted} onClick={() => playSound('correct', s)}>{t(language, 'settings.testSound')}</Button>
      </Panel>
      <Panel>
        <h2>{t(language, 'settings.save')}</h2>
        <p>{t(language, 'settings.saveNote')}</p>
        <p>{saveStatus.ok ? `✔ ${t(language, 'settings.saving')}` : `⚠ ${t(language, 'settings.saveError')} (${saveStatus.error}).`}</p>
        <Button variant="danger" onClick={() => setConfirm(true)}>{t(language, 'settings.reset')}</Button>
      </Panel>
      <ConfirmDialog open={confirm} title={t(language, 'settings.resetTitle')} danger confirmLabel={t(language, 'settings.erase')} cancelLabel={t(language, 'settings.cancel')} onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); resetGame(); nav('/'); }}>
        <p>{t(language, 'settings.resetWarning')}</p>
      </ConfirmDialog>
    </div>
  );
}
