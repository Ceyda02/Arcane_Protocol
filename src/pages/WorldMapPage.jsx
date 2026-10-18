import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, Diamond, MapPin } from 'lucide-react';
import { useGame } from '../state/GameContext.jsx';
import { REGIONS } from '../content/world.js';
import { QUESTS } from '../content/index.js';
import { CREATURES_BY_ID } from '../content/malware/creatures.js';
import { regionStatus, regionProgress, unmetRequirements, questStatus } from '../engine/unlockEngine.js';
import { Button, Panel, ProgressBar, StatusChip } from '../components/common/ui.jsx';
import { questPath, studyPath } from '../app/paths.js';
import { continuePath } from './TitlePage.jsx';
import { t } from '../i18n/index.js';
import { localizeBestiaryCreature } from '../i18n/bestiary.js';

const ICON = { locked: Lock, available: Diamond, completed: Check };
const MAP_IMAGE_POSITION = {
  rune_gates: [28, 28],
  shattered_web: [65, 29],
  nightwatch_citadel: [86, 42],
  crownlands: [56, 63],
  crimson_depths: [76, 84],
  veil_of_twilight: [47, 83],
  memory_crypt: [21, 69],
  blighted_reach: [19, 40],
  forgotten_observatory: [54, 16],
};
const QUEST_TRANSLATIONS = {
  'bells-of-the-silent-watch': 'quest.bells',
  'encounter-worm': 'quest.worm',
  'encounter-trojan': 'quest.trojan',
  'encounter-ransomware': 'quest.ransomware',
  'night-watch-2': 'quest.watch',
};

function questTitle(id, language) {
  const quest = QUESTS[id];
  if (!quest) return id;
  const key = QUEST_TRANSLATIONS[id];
  return key ? t(language, `${key}.title`) : quest.title;
}

function localizeRequirements(items, language) {
  if (language !== 'tr') return items;
  return items.map((item) => {
    const level = item.match(/Reach level (\d+)/);
    if (level) return `${t(language, 'map.reachLevel')} ${level[1]}`;
    const titles = [...item.matchAll(/“([^”]+)”/g)].map((match) => {
      const quest = Object.values(QUESTS).find((entry) => entry.title === match[1]);
      return quest ? questTitle(quest.id, language) : match[1];
    });
    if (item.startsWith('Complete one of:')) return `${t(language, 'map.completeOneOf')}: ${titles.join(' veya ')}`;
    if (item.startsWith('Complete “')) return `${t(language, 'map.completeQuest')}: ${titles[0] ?? ''}`;
    return t(language, 'map.genericRequirement');
  });
}

export default function WorldMapPage() {
  const { game } = useGame();
  const nav = useNavigate();
  const [sel, setSel] = useState('crownlands');
  const language = game.settings.language;
  const region = REGIONS.find((r) => r.id === sel);
  const status = regionStatus(region, game);
  const prog = regionProgress(region, game);
  const unmet = unmetRequirements(region.unlock, game);
  const regionName = (r) => t(language, `region.${r.id}`);
  const regionLore = t(language, `region.${region.id}.lore`);
  const localizedUnmet = localizeRequirements(unmet, language);

  return (
    <div className="map-page">
      <h1 className="sr-only">{t(language, 'map.title')}</h1>
      <div className="map-wrap">
        <img className="map-photo" src="/hexaria-world-map.png" alt={t(language, 'map.imageAlt')} />
        {false && <svg className="map-features" viewBox="0 0 64 40" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
          <g className="map-rivers" fill="none" strokeLinecap="square">
            <path d="M7 18 L15 20 L20 18 L26 21 L31 20 L37 24 L43 23 L48 27 L56 28" stroke="#183959" strokeWidth="2.2" />
            <path d="M7 18 L15 20 L20 18 L26 21 L31 20 L37 24 L43 23 L48 27 L56 28" stroke="#67b8c0" strokeWidth="1.15" />
            <path d="M30 2 L29 8 L32 12 L31 20 L28 26 L30 32 L27 38" stroke="#183959" strokeWidth="2.2" />
            <path d="M30 2 L29 8 L32 12 L31 20 L28 26 L30 32 L27 38" stroke="#67b8c0" strokeWidth="1.15" />
          </g>
          <g className="map-roads" fill="none" strokeLinecap="square">
            <path d="M31 21 L24 18 L20 13 L17 9 M31 21 L38 18 L43 14 L48 10 M31 21 L40 23 L47 25 L53 26 M31 21 L38 28 L42 33 L43 36 M31 21 L25 26 L20 30 L15 32 M31 21 L25 20 L19 22 L12 24" stroke="#59452f" strokeWidth="1.4" />
            <path d="M31 21 L24 18 L20 13 L17 9 M31 21 L38 18 L43 14 L48 10 M31 21 L40 23 L47 25 L53 26 M31 21 L38 28 L42 33 L43 36 M31 21 L25 26 L20 30 L15 32 M31 21 L25 20 L19 22 L12 24" stroke="#d7bd82" strokeWidth=".75" />
          </g>
          <g className="map-bridges" fill="#a88a59" stroke="#3e342a" strokeWidth=".35">
            <path d="M25 19h3v1h-3z M38 23h3v1h-3z M29 11h2v2h-2z M28 26h2v2h-2z" />
          </g>
          <g className="map-mountains" stroke="#27364c" strokeWidth=".45">
            <path d="M7 12 11 5 14 12z" fill="#8496a8" /><path d="m10 7 1-2 2 4h-2z" fill="#e1d9c5" />
            <path d="m12 13 5-9 5 9z" fill="#718499" /><path d="m16 7 1-3 3 5h-3z" fill="#e7e4d9" />
            <path d="m40 12 4-8 5 8z" fill="#76879a" /><path d="m43 7 1-3 3 5h-3z" fill="#eee8d6" />
            <path d="m49 18 4-8 5 8z" fill="#73859a" /><path d="m52 13 1-3 3 5h-3z" fill="#eee8d6" />
            <path d="m5 30 4-7 4 7z" fill="#718399" /><path d="m8 26 1-3 2 4H9z" fill="#e8e2d4" />
          </g>
          <g className="map-forest" shapeRendering="crispEdges">
            {[[12, 15], [15, 15], [18, 17], [20, 16], [22, 18], [45, 12], [48, 13], [51, 12], [53, 14], [12, 27], [16, 28], [18, 27], [22, 29], [34, 31], [37, 32], [39, 30], [50, 32], [53, 33], [56, 31]].map(([x, y], i) => (
              <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                <path d="M1 0h2v1h1v2H0V1h1z" fill={i % 3 === 0 ? '#28513a' : '#356342'} />
                <path d="M1 3h1v1H1z" fill="#59452f" />
                <path d="M1 1h1v1H1z" fill={i % 2 ? '#66824c' : '#527447'} />
              </g>
            ))}
          </g>
          <g className="map-landmarks" shapeRendering="crispEdges" stroke="#2b241d" strokeWidth=".4">
            <g transform="translate(29 17)">
              <path d="M0 3h6v4H0z" fill="#b48d4e" /><path d="M1 1h2v6H1zM4 0h2v7H4z" fill="#657a91" />
              <path d="M1 1h2v1H1zM4 0h2v1H4z" fill="#d8c797" /><path d="M2 5h1v2H2zM5 4h1v2H5z" fill="#3c3025" />
              <path d="M-1 3 3 1l4 2z" fill="#8f493b" />
            </g>
            <g transform="translate(36 20)">
              <path d="M0 2h4v3H0z" fill="#b58b57" /><path d="M0 1h4v1H0z" fill="#784536" /><path d="M2 3h1v2H2z" fill="#403027" />
            </g>
            <g transform="translate(49 22)">
              <path d="M0 2h5v4H0zM1 0h1v6H1zM3 0h1v6H3z" fill="#687b8c" />
              <path d="M0 1h5v1H0zM1 0h1v1H1zM3 0h1v1H3z" fill="#d4c597" />
            </g>
            <g transform="translate(43 10)">
              <path d="M0 2h4v3H0zM1 0h2v5H1z" fill="#77776b" /><path d="M0 1h4v1H0z" fill="#534b46" />
            </g>
            <g transform="translate(18 29)">
              <path d="M0 2h4v3H0zM1 0h1v5H1z" fill="#697a7a" /><path d="M0 1h4v1H0z" fill="#c1ae7e" />
            </g>
          </g>
          <g className="map-runes" fill="#a88df3">
            <path d="M24 14h1v2h1v1h-2zM41 27h1v2h1v1h-2zM56 19h1v2h1v1h-2z" />
          </g>
        </svg>}
        {REGIONS.map((r) => {
          const st = regionStatus(r, game);
          const Icon = ICON[st] ?? Diamond;
          const [left, top] = MAP_IMAGE_POSITION[r.id] ?? [r.x, r.y];
          return (
            <button key={r.id} type="button" className={`marker marker-${st} ${sel === r.id ? 'is-selected' : ''}`} style={{ left: `${left}%`, top: `${top}%` }}
              onClick={() => setSel(r.id)} aria-pressed={sel === r.id} aria-label={`${regionName(r)}, ${t(language, `map.${st}`)}`}>
              <Icon size={16} aria-hidden="true" />
              {r.id === 'crownlands' && <span className="marker-you"><MapPin size={11} aria-hidden="true" />{t(language, 'map.playerLocation')}</span>}
              {st !== 'locked' && (r.quests.some((id) => !game.progress.completedQuests.includes(id)) || (r.studies || []).some((id) => !game.progress.challengeRecords[CREATURES_BY_ID[id]?.challenges.beginner]?.passed)) && <span className="marker-quest" aria-label={t(language, 'map.mainQuest')}>!</span>}
            </button>
          );
        })}
      </div>
      <div className="map-legend" aria-label={t(language, 'map.legend')}>
        <span><i className="legend-rune" aria-hidden="true">◆</i>{t(language, 'map.mainQuest')}</span>
        <span><i className="legend-road" aria-hidden="true" />{t(language, 'map.routes')}</span>
        <span><MapPin size={14} aria-hidden="true" />{t(language, 'map.playerLocation')}</span>
        <StatusChip status="locked" language={language} />
        <StatusChip status="completed" language={language} />
      </div>

      <Panel className="region-panel" aria-live="polite">
        <header className="region-head"><h2>{regionName(region)}</h2><StatusChip status={status} language={language} /></header>
        <p>{regionLore}</p>
        <p className="muted">{t(language, 'map.skills')}: {region.skills.map((s) => t(language, `skill.${s}`)).join(', ')}</p>
        {prog.playable ? (
          <div className="region-progress"><ProgressBar value={prog.percent} max={100} label={`${regionName(region)} ${t(language, 'map.progress')}`} /><span>{prog.percent}% ({prog.done}/{prog.total})</span></div>
        ) : <p className="muted">{t(language, 'map.noPlayable')}</p>}

        {status === 'locked' ? (
          <div className="requirements">
            <h3>{t(language, 'map.toEnter')}</h3>
            <ul>{localizedUnmet.map((u, i) => <li key={`${u}-${i}`}>{u}</li>)}</ul>
          </div>
        ) : (
          <div className="quest-list">
            {region.studies?.length > 0 && (
              <>
                <h3>{t(language, 'map.studies')}</h3>
                {region.studies.map((creatureId) => {
                  const creature = localizeBestiaryCreature(CREATURES_BY_ID[creatureId], language);
                  const passed = Boolean(game.progress.challengeRecords[creature.challenges.beginner]?.passed);
                  return (
                    <div key={creatureId} className="quest-row">
                      <div className="quest-info">
                        <strong>{creature.name}: {creature.title}</strong>
                        <p className="muted">{creature.tease}</p>
                      </div>
                      <div className="quest-side">
                        <StatusChip status={passed ? 'completed' : 'available'} language={language} />
                        <Button variant={passed ? 'ghost' : 'primary'} onClick={() => nav(studyPath(creatureId))}>
                          {passed ? t(language, 'map.studyComplete') : t(language, 'map.studyProgress')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {region.quests.length > 0 && <h3>{t(language, 'map.quests')}</h3>}
            {[...region.quests, ...region.comingSoon].map((qid) => {
              const q = QUESTS[qid];
              if (!q) return null;
              const translationKey = QUEST_TRANSLATIONS[qid];
              const qs = questStatus(q, game);
              const needs = qs === 'locked' ? unmetRequirements({ quests: q.requires, anyQuests: q.requiresAny }, game) : [];
              const localizedNeeds = localizeRequirements(needs, language);
              return (
                <div key={qid} className="quest-row">
                  <div className="quest-info">
                    <div className="quest-title-line">
                      <strong>{translationKey ? t(language, `${translationKey}.title`) : q.title}</strong>
                      {q.kind === 'encounter' && <span className="chip chip-diff">{t(language, 'quest.bestiary')}</span>}
                    </div>
                    <p className="muted">{translationKey ? t(language, `${translationKey}.summary`) : q.summary}</p>
                    {localizedNeeds.length > 0 && <p className="muted">{localizedNeeds.join('; ')}</p>}
                  </div>
                  <div className="quest-side">
                    <StatusChip status={qs} language={language} />
                    {qs === 'available' && <Button onClick={() => nav(questPath(q))}>{(game.progress.questState[qid]?.stage ?? 0) > 0 ? t(language, 'map.resume') : t(language, 'map.begin')}</Button>}
                    {qs === 'completed' && <Button variant="ghost" onClick={() => nav(questPath(q))}>{t(language, 'map.review')}</Button>}
                  </div>
                </div>
              );
            })}
            {region.quests.length === 0 && !region.studies?.length && region.comingSoon.length === 0 && <p className="muted">{t(language, 'quest.noContent')}</p>}
          </div>
        )}
      </Panel>
      <div className="create-actions">
        <Button onClick={() => nav(continuePath(game))}>{t(language, 'map.continue')}</Button>
        <Button variant="ghost" onClick={() => nav('/journal')}>{t(language, 'journal.title')}</Button>
      </div>
    </div>
  );
}
