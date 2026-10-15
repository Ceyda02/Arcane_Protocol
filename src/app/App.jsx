import { Navigate, Route, Routes } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
