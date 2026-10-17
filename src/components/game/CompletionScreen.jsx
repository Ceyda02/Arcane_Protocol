import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/GameContext.jsx';
import { QUESTS } from '../../content/index.js';
import { GRIMOIRE_BY_ID } from '../../content/lessons/grimoire.js';
import { CREATURES_BY_ID } from '../../content/malware/creatures.js';
import { REALM_CREATURES } from '../../content/bestiary.js';
import { questRewards } from '../../engine/questEngine.js';
import { Button, Panel } from '../common/ui.jsx';
import PlayerPortrait from '../character/PlayerPortrait.jsx';
import { localizeChapter1 } from '../../i18n/chapter1.js';
import { t } from '../../i18n/index.js';

/** Chapter / encounter completion: shows what was actually earned (read from game state, not invented). */
export default function CompletionScreen({ quest, summary }) {
  const { game } = useGame();
  const language = game.settings.language;
  const localizedQuest = localizeChapter1(quest, language);
  const nav = useNavigate();
  const rewards = questRewards(quest);
  const creature = quest.creatureId ? CREATURES_BY_ID[quest.creatureId] : null;
  const earnedXp = quest.requiredChallenges.reduce((s, id) => s + (game.progress.challengeRecords[id]?.xpAwarded ?? 0), 0) + rewards.xp;
  const pages = [...rewards.grimoire, ...(creature?.rewards?.lorePage ? [creature.rewards.lorePage, `beast-${creature.id}`] : [])];
  const beasts = [...rewards.bestiary.map((id) => REALM_CREATURES.find((c) => c.id === id)?.name), creature?.name].filter(Boolean);
  const nextQuests = Object.values(QUESTS).filter((q) => q.playable && !game.progress.completedQuests.includes(q.id) && (q.requires ?? []).every((r) => game.progress.completedQuests.includes(r)));

  return (
    <Panel className="completion" aria-labelledby="done-title">
      <PlayerPortrait size="lg" />
      <h2 id="done-title">{t(language, quest.kind === 'encounter' ? 'completion.threatUnderstood' : 'completion.chapterComplete')}: {localizedQuest.title}</h2>
      <p className="xp-note">+{earnedXp} {t(language, 'completion.xpEarned')}</p>
      {summary && (
        <div className="summary-grid">
          <div><h3>{t(language, 'chapter.whatKnown')}</h3><ul>{summary.known.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>{t(language, 'chapter.whatUncertain')}</h3><ul>{summary.uncertain.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>{t(language, 'chapter.whatNeeded')}</h3><ul>{summary.needed.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
      )}
      <h3>{t(language, 'completion.unlocked')}</h3>
      <ul>
        {pages.map((id) => <li key={id}>{t(language, 'completion.grimoirePage')}: {localizeChapter1(GRIMOIRE_BY_ID[id]?.title, language)}</li>)}
        {beasts.map((n) => <li key={n}>{t(language, 'completion.bestiaryEntry')}: {n}</li>)}
        {nextQuests.length > 0 && <li>{t(language, 'completion.newQuests')}: {nextQuests.map((q) => localizeChapter1(q.title, language)).join(', ')}</li>}
      </ul>
      <div className="create-actions">
        <Button onClick={() => nav('/map')}>{t(language, 'completion.returnToMap')}</Button>
        <Button variant="ghost" onClick={() => nav('/grimoire')}>{t(language, 'completion.openGrimoire')}</Button>
        <Button variant="ghost" onClick={() => nav('/bestiary')}>{t(language, 'completion.viewBestiary')}</Button>
      </div>
    </Panel>
  );
}
