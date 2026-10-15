import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { ARCHETYPES, PORTRAITS, COLORS, EQUIPMENT, ADDRESS_OPTIONS, DEFAULT_PLAYER } from '../content/archetypes.js';
import { Button, Panel, Portrait } from '../components/common/ui.jsx';

export default function CharacterCreationPage() {
  const { dispatch } = useGame();
  const nav = useNavigate();
  const [p, setP] = useState({ ...DEFAULT_PLAYER, name: '' });
  const [error, setError] = useState('');
  const set = (patch) => setP((x) => ({ ...x, ...patch }));
  const color = COLORS.find((c) => c.id === p.color);

  const begin = (player) => { dispatch({ type: 'CREATE_PLAYER', player }); nav('/assessment'); };
  const submit = (e) => {
    e.preventDefault();
    const name = p.name.trim();
    if (!name) { setError('Give your character a name to continue.'); return; }
    begin({ ...p, name });
  };

  return (
    <div className="create">
      <h1>Create your character</h1>
      <p className="lead">Your choices shape how the story addresses you. They never change what you can learn.</p>
      <form onSubmit={submit} className="create-grid">
        <Panel className="create-preview" tone="leather" aria-label="Preview">
          <Portrait portraitKey={p.portraitId} name={p.name || 'Your character'} size="xl" accent={color.hex} />
          <p className="preview-name">{p.address ? `${p.address} ` : ''}{p.name || 'Your name'}</p>
          <p className="muted">{ARCHETYPES.find((a) => a.id === p.archetypeId)?.name} · {EQUIPMENT.find((e) => e.id === p.equipmentId)?.name}</p>
        </Panel>
        <Panel className="create-fields">
          <div className="field">
            <label htmlFor="char-name">Name</label>
            <input id="char-name" type="text" value={p.name} maxLength={24} onChange={(e) => { set({ name: e.target.value }); setError(''); }} aria-invalid={Boolean(error)} aria-describedby={error ? 'name-err' : undefined} autoComplete="off" />
            {error && <span id="name-err" className="field-error" role="alert">{error}</span>}
          </div>
          <label className="field">
            <span>Form of address (optional)</span>
            <select value={p.address} onChange={(e) => set({ address: e.target.value })}>
              {ADDRESS_OPTIONS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Archetype</span>
            <select value={p.archetypeId} onChange={(e) => set({ archetypeId: e.target.value })}>
              {ARCHETYPES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <span className="muted">{ARCHETYPES.find((a) => a.id === p.archetypeId)?.blurb} Archetypes are story flavor only.</span>
          </label>
          <fieldset className="field">
            <legend>Portrait</legend>
            <div className="swatch-row">
              {PORTRAITS.map((pt) => (
                <label key={pt.id} className={`portrait-choice ${p.portraitId === pt.id ? 'is-selected' : ''}`}>
                  <input type="radio" name="portrait" checked={p.portraitId === pt.id} onChange={() => set({ portraitId: pt.id })} />
                  <Portrait portraitKey={pt.id} name={pt.name} size="sm" />
                  <span>{pt.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend>Clothing color</legend>
            <div className="swatch-row">
              {COLORS.map((c) => (
                <label key={c.id} className={`swatch ${p.color === c.id ? 'is-selected' : ''}`} style={{ '--sw': c.hex }}>
                  <input type="radio" name="color" checked={p.color === c.id} onChange={() => set({ color: c.id })} />
                  <span className="swatch-dot" aria-hidden="true">{p.color === c.id ? '✔' : ''}</span>
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Starting equipment</span>
            <select value={p.equipmentId} onChange={(e) => set({ equipmentId: e.target.value })}>
              {EQUIPMENT.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <span className="muted">{EQUIPMENT.find((e) => e.id === p.equipmentId)?.blurb}</span>
          </label>
          <div className="create-actions">
            <Button type="submit">Begin the adventure</Button>
            <Button variant="ghost" onClick={() => begin(DEFAULT_PLAYER)}>Start now as {DEFAULT_PLAYER.name}</Button>
          </div>
          <p className="muted">Your character is saved in this browser only.</p>
        </Panel>
      </form>
    </div>
  );
}
