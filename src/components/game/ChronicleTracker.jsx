import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../common/ui.jsx';
import { questPath } from '../../app/paths.js';
import { findChronicleQuestObjective } from '../../engine/chronicleEngine.js';
import { localizeChapter1 } from '../../i18n/chapter1.js';
import { t } from '../../i18n/index.js';
import { useGame } from '../../state/GameContext.jsx';

export default function ChronicleTracker() {
  const { game, dispatch } = useGame();
  const language = game.settings.language;
  const chronicle = game.progress.chronicle;
  if (!chronicle?.pinnedObjectiveId) return null;
  const objective = findChronicleQuestObjective(game, chronicle.pinnedObjectiveId);
  if (!objective) return null;
  const challenge = objective.challenge.id.startsWith('c1-')
    ? localizeChapter1(objective.challenge, language)
    : objective.challenge;
  const completed = Boolean(game.progress.challengeRecords[objective.challenge.id]?.passed);

  if (chronicle.trackerHidden) {
    return (
      <div className="chronicle-tracker-control">
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_CHRONICLE_TRACKER_HIDDEN', hidden: false })}>
          <Eye size={16} aria-hidden="true" /> {t(language, 'chronicle.showTracker')}
        </Button>
      </div>
    );
  }

  return (
    <aside className="chronicle-tracker" aria-label={t(language, 'chronicle.pinned')}>
      <div>
        <strong>{t(language, 'chronicle.pinned')}</strong>
        <span>{challenge.title}{completed ? ` · ${t(language, 'chronicle.status.completed')}` : ''}</span>
      </div>
      <Link className="btn btn-ghost" to={questPath(objective.quest)}>{t(language, 'chronicle.resume')}</Link>
      <Button variant="ghost" aria-label={t(language, 'chronicle.hideTracker')} onClick={() => dispatch({ type: 'SET_CHRONICLE_TRACKER_HIDDEN', hidden: true })}>
        <EyeOff size={16} aria-hidden="true" />
      </Button>
    </aside>
  );
}
