import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { Button, ConfirmDialog, Panel } from '../components/common/ui.jsx';
import { playSound } from '../components/common/sound.js';

export default function SettingsPage() {
  const { game, dispatch, resetGame, saveStatus } = useGame();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const s = game.settings;
  const set = (patch) => dispatch({ type: 'UPDATE_SETTINGS', settings: patch });

  return (
    <div className="settings">
      <h1>Settings and accessibility</h1>
      <Panel>
        <h2>Reading</h2>
        <label className="field"><span>Text speed</span>
          <select value={s.textSpeed} onChange={(e) => set({ textSpeed: e.target.value })}>
            <option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option><option value="instant">Instant (no animation)</option>
          </select>
        </label>
        <label className="field"><span>Text size</span>
          <select value={s.textSize} onChange={(e) => set({ textSize: e.target.value })}>
            <option value="normal">Normal</option><option value="large">Large</option><option value="xlarge">Extra large</option>
          </select>
        </label>
        <label className="field"><span>Reduce motion</span>
          <select value={s.reducedMotion} onChange={(e) => set({ reducedMotion: e.target.value })}>
            <option value="system">Follow my device setting</option><option value="on">Always reduce</option><option value="off">Allow animation</option>
          </select>
        </label>
      </Panel>
      <Panel>
        <h2>Sound</h2>
        <p className="muted">Sound is optional and off by default. Nothing in the game depends on it.</p>
        <label className="check"><input type="checkbox" checked={s.muted} onChange={(e) => set({ muted: e.target.checked })} /> <span>Mute all sound</span></label>
        <label className="field"><span>Volume: {Math.round(s.volume * 100)}%</span>
          <input type="range" min="0" max="1" step="0.05" value={s.volume} disabled={s.muted} onChange={(e) => set({ volume: Number(e.target.value) })} />
        </label>
        <Button variant="ghost" disabled={s.muted} onClick={() => playSound('correct', s)}>Test sound</Button>
      </Panel>
      <Panel>
        <h2>Your save</h2>
        <p>Progress is saved only in this browser, on this device. There is no account, no server, and no tracking. Clearing your browser data erases it.</p>
        <p>{saveStatus.ok ? '✔ Saving is working.' : `⚠ Saving is not working (${saveStatus.error}).`}</p>
        <Button variant="danger" onClick={() => setConfirm(true)}>Reset all progress</Button>
      </Panel>
      <ConfirmDialog open={confirm} title="Reset all progress?" danger confirmLabel="Yes, erase everything" cancelLabel="Cancel" onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); resetGame(); nav('/'); }}>
        <p>This permanently erases your character, XP, Grimoire pages, and Bestiary discoveries from this browser. It cannot be undone.</p>
      </ConfirmDialog>
    </div>
  );
}
