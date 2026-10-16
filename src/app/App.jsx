import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { t } from '../i18n/index.js';
import GameShell from '../components/game/GameShell.jsx';
import TitlePage from '../pages/TitlePage.jsx';
import CharacterCreationPage from '../pages/CharacterCreationPage.jsx';
import AssessmentPage from '../pages/AssessmentPage.jsx';
import ResultsPage from '../pages/ResultsPage.jsx';
import WorldMapPage from '../pages/WorldMapPage.jsx';
import QuestPage from '../pages/QuestPage.jsx';
import EncounterPage from '../pages/EncounterPage.jsx';
import GrimoirePage from '../pages/GrimoirePage.jsx';
import BestiaryPage from '../pages/BestiaryPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ReviewPage from '../pages/ReviewPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import JournalPage from '../pages/JournalPage.jsx';

const InvestigationBoardPage = lazy(() => import('../pages/InvestigationBoardPage.jsx'));
const SkillTreePage = lazy(() => import('../pages/SkillTreePage.jsx'));

function LazyPage({ Page }) {
  const { game } = useGame();
  return (
    <Suspense fallback={<p role="status">{t(game.settings.language, 'app.loading')}</p>}>
      <Page />
    </Suspense>
  );
}

function RequirePlayer({ children }) {
  const { game } = useGame();
  return game.player ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TitlePage />} />
      <Route path="/create" element={<CharacterCreationPage />} />
      <Route element={<RequirePlayer><GameShell /></RequirePlayer>}>
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/map" element={<WorldMapPage />} />
        <Route path="/quest/:questId" element={<QuestPage />} />
        <Route path="/encounter/:questId" element={<EncounterPage />} />
        <Route path="/study/:creatureId" element={<EncounterPage />} />
        <Route path="/grimoire" element={<GrimoirePage />} />
        <Route path="/bestiary" element={<BestiaryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/investigation-board" element={<LazyPage Page={InvestigationBoardPage} />} />
        <Route path="/skill-tree" element={<LazyPage Page={SkillTreePage} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
