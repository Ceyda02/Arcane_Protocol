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
import { t } from '../i18n/index.js';
import { localizeBestiaryCreature } from '../i18n/bestiary.js';
import { REGIONS } from '../content/world.js';

function Creature({ c, status, selected, onPick, kind, language }) {
  const src = asset(c.art);
  const unlocked = Boolean(status);
  return (
    <li>
      <button type="button" className={`beast ${selected ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`} onClick={onPick} aria-pressed={selected}>
        <span className={`beast-art ${src ? '' : 'beast-ph'}`}>
          {src ? <img src={src} alt="" className={unlocked ? '' : 'silhouette'} /> : <span aria-hidden="true">{unlocked ? 'ᚱ' : '?'}</span>}
        </span>
        <span className="beast-name">{unlocked ? c.name : t(language, 'bestiary.unknownCreature')}</span>
        <span className="muted beast-sub">{unlocked ? `${t(language, `bestiary.status.${status}`)}${kind === 'malware' ? ` · ${c.malwareType}` : ''}` : `🔒 ${c.tease}`}</span>
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
  const language = game.settings.language;
  const list = tab === 'malware' ? MALWARE_CREATURES : REALM_CREATURES;
  const localizedList = list.map((creature) => localizeBestiaryCreature(creature, language));
  const sel = localizedList.find((c) => c.id === selId) ?? null;
  const total = MALWARE_CREATURES.length;
  const found = MALWARE_CREATURES.filter((c) => best[c.id]).length;

  const malwareNeeds = (c) => {
    const quest = c.questId ? QUESTS[c.questId] : null;
    if (quest) return unmetRequirements({ quests: quest.requires, anyQuests: quest.requiresAny }, game);
    const region = REGIONS.find((entry) => entry.id === c.studyRegionId);
    return region ? unmetRequirements(region.unlock, game) : [t(language, 'map.genericRequirement')];
  };

  const detail = () => {
    if (!sel) return <Panel><p className="muted">{t(language, 'bestiary.chooseCreature')}</p></Panel>;
    const status = best[sel.id];
    if (tab === 'realm') {
      return (
        <Panel className="beast-detail">
          <h2>{status ? sel.name : t(language, 'bestiary.unknownCreature')}</h2>
          {status ? (
            <>
              <p className="lore">{sel.lore}</p>
              <p><strong>{t(language, 'bestiary.detail.metaphor')}:</strong> {sel.metaphor}</p>
              <p><strong>{t(language, 'bestiary.detail.concepts')}:</strong> {sel.concepts.join(', ')}.</p>
              <p><strong>{t(language, 'bestiary.detail.clue')}:</strong> {sel.clue}</p>
              <p className="muted">{sel.lesson}</p>
              {sel.grimoire && <p>{t(language, 'bestiary.detail.grimoire')}: {GRIMOIRE_BY_ID[sel.grimoire]?.title}</p>}
            </>
          ) : <p>{sel.tease} {sel.unlockedBy ? t(language, 'bestiary.detail.meetCreature') : t(language, 'bestiary.detail.futureCreature')}</p>}
        </Panel>
      );
    }
    const needs = malwareNeeds(sel);
    const quest = sel.questId ? QUESTS[sel.questId] : null;
    const qs = quest ? questStatus(quest, game) : null;
    return (
      <div className="beast-detail-wrap">
        <Panel className="beast-detail">
          <h2>{status ? `${sel.name}: ${sel.title}` : t(language, 'bestiary.unknownCreature')}</h2>
          <p className="muted">{t(language, `bestiary.category.${sel.category}`)} · {t(language, sel.availability === 'playable' ? 'bestiary.detail.fullEncounter' : 'bestiary.detail.fieldStudy')}</p>
          {status ? <><p className="lore">{sel.lore}</p><p><strong>{t(language, 'bestiary.detail.scenario')}:</strong> {sel.scenario}</p><p className="muted">{t(language, 'bestiary.detail.reward')} {sel.rewards.xp} {t(language, 'bestiary.detail.xpAndPage')}</p></> : <p>{sel.tease}</p>}
          {needs.length > 0 && <p className="notice">{t(language, 'bestiary.detail.meetRequirement')} {needs.join('; ')}.</p>}
          <div className="create-actions">
            {needs.length === 0 && quest && (qs === 'available' || qs === 'completed') && <Button onClick={() => nav(questPath(quest))}>{t(language, qs === 'completed' ? 'bestiary.detail.reviewEncounter' : status ? 'bestiary.detail.continueEncounter' : 'bestiary.detail.beginEncounter')}</Button>}
            {needs.length === 0 && !quest && <Button onClick={() => { dispatch({ type: 'DISCOVER_CREATURE', id: sel.id, status: 'seen' }); nav(studyPath(sel.id)); }}>{t(language, status ? 'bestiary.detail.continueStudy' : 'bestiary.detail.beginStudy')}</Button>}
          </div>
        </Panel>
        {status && <RealWorldPanel creature={sel} defaultOpen={false} />}
      </div>
    );
  };

  return (
    <div className="bestiary">
      <h1>{t(language, 'bestiary.title')}</h1>
      <div className="tabs" role="tablist" aria-label={t(language, 'bestiary.tabs')}>
        <button role="tab" type="button" aria-selected={tab === 'malware'} className={tab === 'malware' ? 'is-active' : ''} onClick={() => { setTab('malware'); setSelId(null); }}>{t(language, 'bestiary.malwareTab')} ({found}/{total})</button>
        <button role="tab" type="button" aria-selected={tab === 'realm'} className={tab === 'realm' ? 'is-active' : ''} onClick={() => { setTab('realm'); setSelId(null); }}>{t(language, 'bestiary.realmTab')}</button>
      </div>
      <p className="muted">{t(language, tab === 'malware' ? 'bestiary.malwareIntro' : 'bestiary.realmIntro')}</p>
      <div className="bestiary-grid">
        <div>
          {tab === 'malware'
            ? THREAT_CATEGORIES.map((cat) => {
              const items = MALWARE_CREATURES.filter((c) => c.category === cat.id);
              return (
                <section key={cat.id} className="beast-group" aria-labelledby={`g-${cat.id}`}>
                  <h2 id={`g-${cat.id}`}>{t(language, `bestiary.category.${cat.id}`)}</h2><p className="muted">{t(language, `bestiary.blurb.${cat.id}`)}</p>
                  <ul className="beast-list">{items.map((creature) => {
                    const localized = localizeBestiaryCreature(creature, language);
                    return <Creature key={creature.id} c={localized} kind="malware" language={language} status={best[creature.id]} selected={selId === creature.id} onPick={() => setSelId(creature.id)} />;
                  })}</ul>
                </section>
              );
            })
            : <ul className="beast-list">{localizedList.map((c) => <Creature key={c.id} c={c} kind="realm" language={language} status={best[c.id]} selected={selId === c.id} onPick={() => setSelId(c.id)} />)}</ul>}
        </div>
        <div className="bestiary-detail" aria-live="polite">{detail()}</div>
      </div>
    </div>
  );
}
