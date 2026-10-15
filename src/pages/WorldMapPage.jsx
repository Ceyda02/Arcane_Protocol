import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, Diamond } from 'lucide-react';
import { useGame } from '../state/GameContext.jsx';
import { REGIONS } from '../content/world.js';
import { QUESTS } from '../content/index.js';
import { SKILLS } from '../content/skills.js';
import { regionStatus, regionProgress, unmetRequirements, questStatus } from '../engine/unlockEngine.js';
import { buildTerrain } from '../components/map/terrain.js';
import { Button, Panel, ProgressBar, StatusChip } from '../components/common/ui.jsx';
import { questPath } from '../app/paths.js';
import { continuePath } from './TitlePage.jsx';

const ICON = { locked: Lock, available: Diamond, completed: Check };

export default function WorldMapPage() {
  const { game } = useGame();
  const nav = useNavigate();
  const [sel, setSel] = useState('crownlands');
  const terrain = useMemo(() => buildTerrain(REGIONS), []);
  const region = REGIONS.find((r) => r.id === sel);
  const status = regionStatus(region, game);
  const prog = regionProgress(region, game);
  const unmet = unmetRequirements(region.unlock, game);

  return (
    <div className="map-page">
      <h1 className="sr-only">World map of Hexaria</h1>
      <div className="map-wrap">
        <svg className="map-art" viewBox={`0 0 ${terrain.w} ${terrain.h}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
          {Object.entries(terrain.paths).map(([c, d]) => <path key={c} d={d} fill={c} />)}
        </svg>
        <div className="map-vignette" aria-hidden="true" />
        {REGIONS.map((r) => {
          const st = regionStatus(r, game);
          const Icon = ICON[st] ?? Diamond;
          return (
            <button key={r.id} type="button" className={`marker marker-${st} ${sel === r.id ? 'is-selected' : ''}`} style={{ left: `${r.x}%`, top: `${r.y}%` }}
              onClick={() => setSel(r.id)} aria-pressed={sel === r.id} aria-label={`${r.name}, ${st === 'locked' ? 'locked' : st === 'completed' ? 'completed' : 'available'}`}>
              <Icon size={16} aria-hidden="true" />
              <span className="marker-label">{r.name}</span>
            </button>
          );
        })}
      </div>

      <Panel className="region-panel" aria-live="polite">
        <header className="region-head"><h2>{region.name}</h2><StatusChip status={status} /></header>
        <p>{region.lore}</p>
        <p className="muted">Skills: {region.skills.map((s) => SKILLS[s].name).join(', ')}</p>
        {prog.playable ? (
          <div className="region-progress"><ProgressBar value={prog.percent} max={100} label={`${region.name} progress`} /><span>{prog.percent}% ({prog.done} of {prog.total} quests)</span></div>
        ) : <p className="muted">No playable quests in this release.</p>}

        {status === 'locked' ? (
          <div className="requirements">
            <h3>To enter</h3>
            <ul>{unmet.map((u) => <li key={u}>{u}</li>)}</ul>
          </div>
        ) : (
          <div className="quest-list">
            <h3>Quests</h3>
            {[...region.quests, ...region.comingSoon].map((qid) => {
              const q = QUESTS[qid];
              const qs = questStatus(q, game);
              const needs = qs === 'locked' ? unmetRequirements({ quests: q.requires, anyQuests: q.requiresAny }, game) : [];
              return (
                <div key={qid} className="quest-row">
                  <div>
                    <strong>{q.title}</strong>{q.kind === 'encounter' && <span className="chip chip-diff"> Bestiary encounter</span>}
                    <p className="muted">{q.summary}</p>
                    {needs.length > 0 && <p className="muted">Requires: {needs.join('; ')}</p>}
                  </div>
                  <div className="quest-side">
                    <StatusChip status={qs} />
                    {qs === 'available' && <Button onClick={() => nav(questPath(q))}>{(game.progress.questState[qid]?.stage ?? 0) > 0 ? 'Resume' : 'Begin'}</Button>}
                    {qs === 'completed' && <Button variant="ghost" onClick={() => nav(questPath(q))}>Review</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      <div className="create-actions"><Button onClick={() => nav(continuePath(game))}>Continue Adventure</Button></div>
    </div>
  );
}
