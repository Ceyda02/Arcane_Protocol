import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Map, BookOpen, Skull, User, Settings } from 'lucide-react';
import { useGame } from '../../state/GameContext.jsx';
import { levelProgress } from '../../engine/progressionEngine.js';
import { PATHS } from '../../content/paths.js';
import PlayerPortrait from '../character/PlayerPortrait.jsx';
import { ProgressBar } from '../common/ui.jsx';
import Toasts from './Toasts.jsx';

const NAV = [
  { to: '/map', label: 'World', icon: Map },
  { to: '/grimoire', label: 'Grimoire', icon: BookOpen },
  { to: '/bestiary', label: 'Bestiary', icon: Skull },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function GameShell() {
  const { game, saveStatus } = useGame();
  const { pathname } = useLocation();
  const lp = levelProgress(game.progress.xp);
  const order = game.pathId ? PATHS[game.pathId] : null;
  return (
    <div className="shell" data-order={order?.colorKey}>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="hud">
        <NavLink to="/profile" className="hud-player" aria-label="Open your profile">
          <PlayerPortrait size="sm" />
          <span className="hud-name">{game.player.address ? `${game.player.address} ` : ''}{game.player.name}</span>
        </NavLink>
        <div className="hud-level">
          <span>Level {lp.level}</span>
          <ProgressBar value={lp.into} max={lp.needed} label={`Experience toward level ${lp.level + 1}`} />
          <span className="hud-xp">{game.progress.xp} XP</span>
        </div>
        {order && <span className="hud-order" title={order.title}>{order.name}</span>}
        <nav className="hud-nav" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      {!saveStatus.ok && (
        <div className="banner banner-warn" role="alert">
          {saveStatus.error === 'quota' ? 'Browser storage is full, so progress is not being saved.' : 'Progress cannot be saved in this browser right now. You can keep playing, but it will be lost when you close the tab.'}
        </div>
      )}
      <main id="main" className="main" key={pathname.split('/')[1]} tabIndex={-1}>
        <Outlet />
      </main>
      <Toasts />
    </div>
  );
}
