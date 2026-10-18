import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Panel } from '../components/common/ui.jsx';
import { asset } from '../components/common/assets.js';
import { useGame } from '../state/GameContext.jsx';
import { t } from '../i18n/index.js';

const COURT_PORTRAITS = ['elder', 'princess', 'heir', 'noble'];
const THREAT_PORTRAITS = ['shapeshifter', 'worm', 'rootkit', 'ransomware'];
const INTRO_SCENES = ['portrait', 'awakening', 'threat', 'summons'];

function PortraitGallery({ portraits, label, animated = false }) {
  return (
    <div className={`intro-gallery${animated ? ' intro-gallery-awakening' : ''}`} role="img" aria-label={label}>
      {portraits.map((portrait, index) => (
        <div className="intro-gallery-frame" key={portrait} style={{ '--portrait-order': index }}>
          <img src={asset(portrait)} alt="" />
        </div>
      ))}
    </div>
  );
}

export default function IntroPage() {
  const { game, dispatch } = useGame();
  const navigate = useNavigate();
  const language = game.settings.language;
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = INTRO_SCENES[sceneIndex];
  const finish = () => {
    dispatch({ type: 'COMPLETE_INTRO' });
    navigate('/create');
  };

  useEffect(() => {
    if (game.introCompleted) navigate('/create', { replace: true });
  }, [game.introCompleted, navigate]);

  const art = scene === 'threat'
    ? <PortraitGallery portraits={THREAT_PORTRAITS} label={t(language, 'intro.threatArt')} />
    : <PortraitGallery portraits={COURT_PORTRAITS} label={t(language, 'intro.courtArt')} animated={scene === 'awakening'} />;

  return (
    <main className="intro-screen">
      <Panel className={`intro-panel intro-scene-${scene}`} tone="leather" aria-live="polite" aria-labelledby="intro-title">
        <div className="intro-scene-content" key={scene}>
          <p className="intro-kicker">{t(language, 'intro.chapter')} · {sceneIndex + 1} / {INTRO_SCENES.length}</p>
          <h1 id="intro-title">{t(language, `intro.${scene}.title`)}</h1>
          {art}
          <div className="intro-dialogue">
            {t(language, `intro.${scene}.body`).split('\n').map((line) => <p key={line}>{line}</p>)}
          </div>
        </div>
        <div className="intro-actions">
          <Button variant="ghost" onClick={finish}>{t(language, 'intro.skip')}</Button>
          {sceneIndex < INTRO_SCENES.length - 1
            ? <Button onClick={() => setSceneIndex((index) => index + 1)}>{t(language, 'intro.next')}</Button>
            : <Button onClick={finish}>{t(language, 'intro.createHero')}</Button>}
        </div>
      </Panel>
    </main>
  );
}
