import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Map, Skull, User, Settings, ScrollText, School } from 'lucide-react';
import { useGame } from '../../state/GameContext.jsx';
import { levelProgress } from '../../engine/progressionEngine.js';
import { PATHS } from '../../content/paths.js';
import PlayerPortrait from '../character/PlayerPortrait.jsx';
import { ProgressBar } from '../common/ui.jsx';
import Toasts from './Toasts.jsx';
import { MusicToggle } from '../common/AudioController.jsx';
import { t } from '../../i18n/index.js';
import guideMage from '../../assets/guide-mage.png';
import PixelBookIcon from '../common/PixelBookIcon.jsx';

const ChronicleTracker = lazy(() => import('./ChronicleTracker.jsx'));
const getDeveloperPassword = () => import.meta.env.VITE_DEVELOPER_PASSWORD;

const NAV = [
  { to: '/map', key: 'nav.world', icon: Map },
  { to: '/grimoire', key: 'nav.grimoire', icon: null },
  { to: '/journal', key: 'nav.journal', icon: ScrollText },
  { to: '/bestiary', key: 'nav.bestiary', icon: Skull },
  { to: '/academy', key: 'nav.academy', icon: School },
  { to: '/profile', key: 'nav.profile', icon: User },
  { to: '/settings', key: 'nav.settings', icon: Settings },
];

const GUIDE_STEPS = [
  { target: '.map-wrap', title: 'guide.welcomeTitle', body: 'guide.welcomeBody' },
  { target: '.map-wrap', title: 'guide.mapTitle', body: 'guide.mapBody' },
  { target: '.hud-nav', title: 'guide.journalTitle', body: 'guide.journalBody' },
  { target: '.hud-nav', title: 'guide.academyTitle', body: 'guide.academyBody' },
];

function GuideOverlay({ language, onFinish }) {
  const [step, setStep] = useState(0);
  const current = GUIDE_STEPS[step];
  useEffect(() => {
    const target = document.querySelector(current.target);
    target?.classList.add('guide-target');
    return () => target?.classList.remove('guide-target');
  }, [current.target]);

  return (
    <aside className="guide-card panel panel-parchment" role="region" aria-live="polite" aria-labelledby="guide-title">
      <img className="guide-mascot" src={guideMage} alt={t(language, 'guide.mageAlt')} />
      <div>
        <p className="guide-step">{t(language, 'guide.label')} · {step + 1}/{GUIDE_STEPS.length}</p>
        <h2 id="guide-title">{t(language, current.title)}</h2>
        <p>{t(language, current.body)}</p>
        <div className="guide-actions">
          <button type="button" className="btn btn-ghost" onClick={onFinish}>{t(language, 'guide.skip')}</button>
          <button type="button" className="btn btn-primary" onClick={() => step + 1 === GUIDE_STEPS.length ? onFinish() : setStep((value) => value + 1)}>
            {t(language, step + 1 === GUIDE_STEPS.length ? 'guide.finish' : 'guide.next')}
          </button>
        </div>
      </div>
    </aside>
  );
}

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
  const unlockDeveloperMode = (event) => {
    event.preventDefault();
    const expectedPassword = getDeveloperPassword();
    if (!expectedPassword) {
      setDeveloperError(language === 'tr' ? 'Bu yerel derlemede geliştirici parolası ayarlanmamış.' : 'Developer mode is not configured in this local build.');
      return;
    }
    if (developerPassword !== expectedPassword) {
      setDeveloperError(language === 'tr' ? 'Parola yanlış. Tekrar deneyin.' : 'Incorrect password. Try again.');
      setDeveloperPassword('');
      passwordInput.current?.focus();
      return;
    }
    dispatch({ type: 'SET_DEVELOPER_MODE', enabled: true });
    closeDeveloperDialog();
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
                  {Icon ? <Icon size={18} aria-hidden="true" /> : <PixelBookIcon />}<span>{t(language, key)}</span>
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
      {!game.tutorialCompleted && pathname === '/map' && (
        <GuideOverlay language={language} onFinish={() => dispatch({ type: 'SET_TUTORIAL_COMPLETE', completed: true })} />
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
