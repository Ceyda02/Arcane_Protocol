import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Map, BookOpen, Skull, User, Settings, ScrollText } from 'lucide-react';
import { useGame } from '../../state/GameContext.jsx';
import { levelProgress } from '../../engine/progressionEngine.js';
import { PATHS } from '../../content/paths.js';
import PlayerPortrait from '../character/PlayerPortrait.jsx';
import { ProgressBar } from '../common/ui.jsx';
import Toasts from './Toasts.jsx';
import { MusicToggle } from '../common/AudioController.jsx';
import { t } from '../../i18n/index.js';

const ChronicleTracker = lazy(() => import('./ChronicleTracker.jsx'));
const DEVELOPER_PASSWORD_HASH = '9952ba4abce50980d9f2a35bd73f46c67d396f63cc7d6121fe824b12068b7946';
const DEVELOPER_PASSWORD_SALT = 'arcane-protocol-dev:';

const NAV = [
  { to: '/map', key: 'nav.world', icon: Map },
  { to: '/grimoire', key: 'nav.grimoire', icon: BookOpen },
  { to: '/journal', key: 'nav.journal', icon: ScrollText },
  { to: '/bestiary', key: 'nav.bestiary', icon: Skull },
  { to: '/profile', key: 'nav.profile', icon: User },
  { to: '/settings', key: 'nav.settings', icon: Settings },
];

export default function GameShell() {
  const { game, saveStatus, dispatch } = useGame();
  const { pathname } = useLocation();
  const [developerDialog, setDeveloperDialog] = useState(false);
  const [developerPassword, setDeveloperPassword] = useState('');
  const [developerError, setDeveloperError] = useState('');
  const profileTaps = useRef([]);
  const passwordInput = useRef(null);
  const lp = levelProgress(game.progress.xp);
  const language = game.settings.language;
  const order = game.pathId ? PATHS[game.pathId] : null;
  const closeDeveloperDialog = () => {
    setDeveloperDialog(false);
    setDeveloperPassword('');
    setDeveloperError('');
  };
  const onProfileTap = (event) => {
    const now = Date.now();
    profileTaps.current = [...profileTaps.current.filter((time) => now - time < 1800), now];
    if (profileTaps.current.length >= 5) {
      event.preventDefault();
      profileTaps.current = [];
      setDeveloperPassword('');
      setDeveloperError('');
      setDeveloperDialog(true);
    }
  };
  const unlockDeveloperMode = async (event) => {
    event.preventDefault();
    try {
      const digest = await window.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(`${DEVELOPER_PASSWORD_SALT}${developerPassword}`),
      );
      const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      if (hash !== DEVELOPER_PASSWORD_HASH) {
        setDeveloperError(language === 'tr' ? 'Parola yanlış. Tekrar deneyin.' : 'Incorrect password. Try again.');
        setDeveloperPassword('');
        passwordInput.current?.focus();
        return;
      }
      dispatch({ type: 'SET_DEVELOPER_MODE', enabled: true });
      closeDeveloperDialog();
    } catch (error) {
      console.error('Unable to verify the developer-mode password.', error);
      setDeveloperError(language === 'tr' ? 'Bu tarayıcı parolayı doğrulayamadı.' : 'This browser could not verify the password.');
    }
  };

  useEffect(() => {
    if (!developerDialog) return undefined;
    passwordInput.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeDeveloperDialog();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [developerDialog]);

  return (
    <div className="shell" data-order={order?.colorKey}>
      <a href="#main" className="skip-link">{t(language, 'nav.skip')}</a>
      <header className="hud">
        <NavLink to="/profile" className="hud-player" aria-label={t(language, 'nav.openProfile')} onClick={onProfileTap}>
          <PlayerPortrait size="sm" />
          <span className="hud-name">{game.player.address ? `${game.player.address} ` : ''}{game.player.name}</span>
        </NavLink>
        <div className="hud-level">
          <span>{language === 'tr' ? `Seviye ${lp.level}` : `Level ${lp.level}`}</span>
          <ProgressBar value={lp.into} max={lp.needed} label={`Experience toward level ${lp.level + 1}`} />
          <span className="hud-xp">{game.progress.xp} XP</span>
        </div>
        {order && <span className="hud-order" title={order.title}>{order.name}</span>}
        <nav className="hud-nav" aria-label={t(language, 'nav.main')}>
          {NAV.map(({ to, key, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} aria-hidden="true" /><span>{t(language, key)}</span>
            </NavLink>
          ))}
          <MusicToggle inline />
        </nav>
      </header>
      {game.developerMode && (
        <div className="dev-mode-banner" role="status">
          <span>{language === 'tr' ? 'Geliştirici modu açık — ilerleme kilitleri kaldırıldı.' : 'Developer mode active — progression locks are bypassed.'}</span>
          <button type="button" onClick={() => dispatch({ type: 'SET_DEVELOPER_MODE', enabled: false })}>
            {language === 'tr' ? 'Kapat' : 'Exit developer mode'}
          </button>
        </div>
      )}
      {!saveStatus.ok && (
        <div className="banner banner-warn" role="alert">
          {saveStatus.error === 'quota' ? 'Browser storage is full, so progress is not being saved.' : 'Progress cannot be saved in this browser right now. You can keep playing, but it will be lost when you close the tab.'}
        </div>
      )}
      {game.progress.chronicle?.pinnedObjectiveId && (
        <Suspense fallback={null}><ChronicleTracker /></Suspense>
      )}
      <main id="main" className="main" key={pathname.split('/')[1]} tabIndex={-1}>
        <Outlet />
      </main>
      <Toasts />
      {developerDialog && (
        <div className="modal-backdrop">
          <form className="modal panel panel-parchment dev-mode-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dev-mode-title" onSubmit={unlockDeveloperMode}>
            <h2 id="dev-mode-title">{language === 'tr' ? 'Geliştirici moduna giriş' : 'Developer mode access'}</h2>
            <p>{language === 'tr'
              ? 'İlerleme gereksinimleri kaldırılır; bu mod yalnızca oyun içi bir erişim kapısıdır.'
              : 'Progression requirements will be bypassed. This is only an in-game access gate, not security.'}</p>
            <label className="field" htmlFor="developer-password">{language === 'tr' ? 'Parola' : 'Password'}
              <input
                ref={passwordInput}
                id="developer-password"
                type="password"
                value={developerPassword}
                autoComplete="off"
                onChange={(event) => { setDeveloperPassword(event.target.value); setDeveloperError(''); }}
                aria-invalid={Boolean(developerError)}
                aria-describedby={developerError ? 'developer-password-error' : undefined}
              />
            </label>
            {developerError && <p id="developer-password-error" className="field-error" role="alert">{developerError}</p>}
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={closeDeveloperDialog}>{language === 'tr' ? 'İptal' : 'Cancel'}</button>
              <button className="btn btn-primary" type="submit">{language === 'tr' ? 'Kilidi aç' : 'Unlock'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
