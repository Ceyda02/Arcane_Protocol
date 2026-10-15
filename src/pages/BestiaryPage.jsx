import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { MALWARE_CREATURES, QUESTS } from '../content/index.js';
import { THREAT_CATEGORIES } from '../content/malware/creatures.js';
import { REALM_CREATURES } from '../content/bestiary.js';
import { GRIMOIRE_BY_ID } from '../content/lessons/grimoire.js';
import { unmetRequirements, questStatus } from '../engine/unlockEngine.js';
import { asset } from '../components/common/assets.js';
import RealWorldPanel from '../components/bestiary/RealWorldPanel.jsx';
import { Button, Panel } from '../components/common/ui.jsx';
import { questPath, studyPath } from '../app/paths.js';

const STATE_TEXT = { seen: 'Encountered', investigated: 'Investigated', defeated: 'Defeated' };

function Creature({ c, status, selected, onPick, kind }) {
  const src = asset(c.art);
  const unlocked = Boolean(status);
  return (
    <li>
      <button type="button" className={`beast ${selected ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`} onClick={onPick} aria-pressed={selected}>
        <span className={`beast-art ${src ? '' : 'beast-ph'}`}>
          {src ? <img src={src} alt="" className={unlocked ? '' : 'silhouette'} /> : <span aria-hidden="true">{unlocked ? 'ᚱ' : '?'}</span>}
        </span>
        <span className="beast-name">{unlocked ? c.name : 'Unknown creature'}</span>
        <span className="muted beast-sub">{unlocked ? (kind === 'malware' ? `${STATE_TEXT[status]} · ${c.malwareType}` : STATE_TEXT[status]) : `🔒 ${c.tease}`}</span>
      </button>
    </li>
  );
}

export default function BestiaryPage() {
  const { game, dispatch } = useGame();
  const nav = useNavigate();
  const [tab, setTab] = useState('malware');
  const [selId, setSelId] = useState(null);
  const best = game.progress.bestiary;
  const list = tab === 'malware' ? MALWARE_CREATURES : REALM_CREATURES;
  const sel = list.find((c) => c.id === selId) ?? null;
  const total = MALWARE_CREATURES.length;
  const found = MALWARE_CREATURES.filter((c) => best[c.id]).length;

  const malwareNeeds = (c) => {
    const quest = c.questId ? QUESTS[c.questId] : null;
    return quest ? unmetRequirements({ quests: quest.requires, anyQuests: quest.requiresAny }, game) : unmetRequirements({ quests: ['bells-of-the-silent-watch'] }, game);
  };

  const detail = () => {
    if (!sel) return <Panel><p className="muted">Choose a creature to read about it. Locked creatures appear as silhouettes until you meet them.</p></Panel>;
    const status = best[sel.id];
    if (tab === 'realm') {
      return (
        <Panel className="beast-detail">
          <h2>{status ? sel.name : 'Unknown creature'}</h2>
          {status ? (
            <>
              <p className="lore">{sel.lore}</p>
              <p><strong>Metaphor:</strong> {sel.metaphor}</p>
              <p><strong>Concepts:</strong> {sel.concepts.join(', ')}.</p>
              <p><strong>Clue:</strong> {sel.clue}</p>
              <p className="muted">{sel.lesson}</p>
              {sel.grimoire && <p>Grimoire page: {GRIMOIRE_BY_ID[sel.grimoire]?.title}</p>}
            </>
          ) : <p>{sel.tease} {sel.unlockedBy ? 'Finish “The Bells of the Silent Watch” to meet it.' : 'It appears in a future chapter.'}</p>}
        </Panel>
      );
    }
    const needs = malwareNeeds(sel);
    const quest = sel.questId ? QUESTS[sel.questId] : null;
    const qs = quest ? questStatus(quest, game) : null;
    return (
      <div className="beast-detail-wrap">
        <Panel className="beast-detail">
          <h2>{status ? `${sel.name}: ${sel.title}` : 'Unknown creature'}</h2>
          <p className="muted">{sel.category} · {sel.availability === 'playable' ? 'Full encounter (beginner, intermediate, boss)' : 'Field study (beginner). More planned.'}</p>
          {status ? <><p className="lore">{sel.lore}</p><p><strong>Scenario:</strong> {sel.scenario}</p><p className="muted">Reward: up to {sel.rewards.xp} XP and a Grimoire page.</p></> : <p>{sel.tease}</p>}
          {needs.length > 0 && <p className="notice">To meet this creature: {needs.join('; ')}.</p>}
          <div className="create-actions">
            {needs.length === 0 && quest && (qs === 'available' || qs === 'completed') && <Button onClick={() => nav(questPath(quest))}>{qs === 'completed' ? 'Review the encounter' : status ? 'Continue the encounter' : 'Begin the encounter'}</Button>}
            {needs.length === 0 && !quest && <Button onClick={() => { dispatch({ type: 'DISCOVER_CREATURE', id: sel.id, status: 'seen' }); nav(studyPath(sel.id)); }}>{status ? 'Continue the field study' : 'Begin the field study'}</Button>}
          </div>
        </Panel>
        {status && <RealWorldPanel creature={sel} defaultOpen={false} />}
      </div>
    );
  };

  return (
    <div className="bestiary">
      <h1>The Bestiary</h1>
      <div className="tabs" role="tablist" aria-label="Bestiary sections">
        <button role="tab" type="button" aria-selected={tab === 'malware'} className={tab === 'malware' ? 'is-active' : ''} onClick={() => { setTab('malware'); setSelId(null); }}>Malware Bestiary ({found}/{total})</button>
        <button role="tab" type="button" aria-selected={tab === 'realm'} className={tab === 'realm' ? 'is-active' : ''} onClick={() => { setTab('realm'); setSelId(null); }}>Realm Beasts</button>
      </div>
      <p className="muted">{tab === 'malware' ? 'Each creature is a fantasy face for a real kind of malware. The lore is metaphor; the Real-World Knowledge is accurate.' : 'Original creatures of Hexaria.'}</p>
      <div className="bestiary-grid">
        <div>
          {tab === 'malware'
            ? THREAT_CATEGORIES.map((cat) => {
              const items = MALWARE_CREATURES.filter((c) => c.category === cat.id);
              return (
                <section key={cat.id} className="beast-group" aria-labelledby={`g-${cat.id}`}>
                  <h2 id={`g-${cat.id}`}>{cat.id}</h2><p className="muted">{cat.blurb}</p>
                  <ul className="beast-list">{items.map((c) => <Creature key={c.id} c={c} kind="malware" status={best[c.id]} selected={selId === c.id} onPick={() => setSelId(c.id)} />)}</ul>
                </section>
              );
            })
            : <ul className="beast-list">{REALM_CREATURES.map((c) => <Creature key={c.id} c={c} kind="realm" status={best[c.id]} selected={selId === c.id} onPick={() => setSelId(c.id)} />)}</ul>}
        </div>
        <div className="bestiary-detail" aria-live="polite">{detail()}</div>
      </div>
    </div>
  );
}
