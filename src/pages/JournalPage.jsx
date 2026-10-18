import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ScrollText, Search, Waypoints } from 'lucide-react';
import { Button, Panel, ProgressBar } from '../components/common/ui.jsx';
import { CHRONICLE_TABS } from '../content/chronicle.js';
import { QUEST_LIST } from '../content/quests/index.js';
import { getChronicleData, getNewChronicleCount } from '../engine/chronicleEngine.js';
import { questPath } from '../app/paths.js';
import { t } from '../i18n/index.js';
import { useGame } from '../state/GameContext.jsx';

function entryText(entry, language, field) {
  const key = entry[`${field}Key`];
  return key ? t(language, key) : entry[field] ?? '';
}

function EntryCard({ entry, language, isRead, onRead }) {
  const title = entryText(entry, language, 'title');
  const description = entryText(entry, language, 'description').replace('{score}', String(entry.score ?? ''));
  return (
    <li className={`chronicle-entry${isRead ? '' : ' is-new'}`}>
      <div className="chronicle-entry-heading">
        <h3>{title}</h3>
        <div className="chronicle-entry-badges">
          {!isRead && <span className="chronicle-new-badge">{t(language, 'chronicle.new')}</span>}
          {entry.status && <span className={`chronicle-status status-${entry.status}`}>{entry.statusKey ? t(language, entry.statusKey) : t(language, `chronicle.status.${entry.status}`)}</span>}
        </div>
      </div>
      {description && <p>{description}</p>}
      {entry.technical && <p><strong>{t(language, 'skillTree.technical')}:</strong> {entry.technical}</p>}
      {entry.sourceKey && <p className="muted"><strong>{t(language, 'chronicle.source')}:</strong> {t(language, entry.sourceKey)}</p>}
      {entry.roleKey && <p className="muted">{t(language, entry.roleKey)}</p>}
      {entry.route && <Link className="chronicle-entry-link" to={entry.route}>{entry.type === 'lesson' ? <BookOpen size={15} aria-hidden="true" /> : null}{t(language, entry.type === 'lesson' ? 'chronicle.openLesson' : entry.type === 'creature' ? 'bestiary.title' : 'journal.openReview')}</Link>}
      <Button
        variant="ghost"
        className="chronicle-read-toggle"
        onClick={() => onRead(entry.id, !isRead)}
      >
        {t(language, isRead ? 'chronicle.markUnread' : 'chronicle.markRead')}
      </Button>
    </li>
  );
}

function QuestCard({ entry, language, readIds, pinnedObjectiveId, onRead, onPin, navigate }) {
  const title = t(language, entry.titleKey);
  const summary = t(language, entry.descriptionKey);
  const regionName = t(language, `region.${entry.regionId}`);
  const isRead = readIds.includes(entry.id);
  return (
    <li className={`chronicle-entry chronicle-quest-entry${isRead ? '' : ' is-new'}`}>
      <div className="chronicle-entry-heading">
        <h3>{title}</h3>
        <div className="chronicle-entry-badges">
          {!isRead && <span className="chronicle-new-badge">{t(language, 'chronicle.new')}</span>}
          <span className={`chronicle-status status-${entry.status}`}>{t(language, `chronicle.status.${entry.status}`)}</span>
        </div>
      </div>
      <p>{summary}</p>
      <p className="muted">{regionName} · {t(language, `chronicle.type.${entry.questKind}`)}</p>
      {entry.prerequisiteIds.length > 0 && (
        <p className="muted">{t(language, 'skillTree.requirements')}: {entry.prerequisiteIds.map((id) => t(language, `quest.${id === 'bells-of-the-silent-watch' ? 'bells' : id.replace('encounter-', '')}.title`)).join(', ')}</p>
      )}
      <p className="muted">{t(language, 'chronicle.rewards')}: {entry.rewardXp} XP{entry.rewardPageCount > 0 ? ` · ${entry.rewardPageCount} ${t(language, 'chronicle.grimoirePages')}` : ''}</p>
      <p className="chronicle-progress-label">{t(language, 'chronicle.progress')}: {entry.passed} / {entry.total}</p>
      <ProgressBar value={entry.passed} max={entry.total} label={`${title}: ${entry.passed} / ${entry.total}`} />
      <h4>{t(language, 'chronicle.objectives')}</h4>
      <ul className="chronicle-objectives">
        {entry.objectives.map((objective) => (
          <li key={objective.id} className={objective.passed ? 'objective-complete' : ''}>
            <span>
              <span><span aria-hidden="true">{objective.passed ? '✓' : '◇'}</span> {objective.title}</span>
              {objective.description && <small>{objective.description}</small>}
            </span>
            {(!objective.passed || pinnedObjectiveId === objective.id) && (
              <Button
                variant="ghost"
                className="chronicle-pin-button"
                aria-pressed={pinnedObjectiveId === objective.id}
                onClick={() => onPin(pinnedObjectiveId === objective.id ? '' : objective.id)}
              >
                {t(language, pinnedObjectiveId === objective.id ? 'chronicle.unpin' : 'chronicle.pin')}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <div className="chronicle-entry-actions">
        <Button onClick={() => navigate(entry.route)}>{t(language, 'chronicle.resume')}</Button>
        <Button variant="ghost" className="chronicle-read-toggle" onClick={() => onRead(entry.id, !isRead)}>
          {t(language, isRead ? 'chronicle.markUnread' : 'chronicle.markRead')}
        </Button>
      </div>
    </li>
  );
}

export default function JournalPage() {
  const { game, dispatch } = useGame();
  const navigate = useNavigate();
  const language = game.settings.language;
  const chronicle = game.progress.chronicle ?? { readEntryIds: [], pinnedObjectiveId: null, trackerHidden: false };
  const [activeTab, setActiveTab] = useState('quests');
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [questType, setQuestType] = useState('all');
  const [questRegion, setQuestRegion] = useState('all');
  const [questStatus, setQuestStatus] = useState('all');
  const data = useMemo(() => getChronicleData(game, language), [game, language]);
  const readIds = chronicle.readEntryIds;
  const activeEntries = data[activeTab] ?? [];
  const normalizedSearch = search.trim().toLocaleLowerCase(language);
  const visibleEntries = activeEntries.filter((entry) => {
    const title = entryText(entry, language, 'title');
    const description = entryText(entry, language, 'description');
    const matchesSearch = !normalizedSearch || `${title} ${description} ${entry.technical ?? ''}`.toLocaleLowerCase(language).includes(normalizedSearch);
    const matchesUnread = !unreadOnly || !readIds.includes(entry.id);
    const matchesType = activeTab !== 'quests' || questType === 'all' || entry.questKind === questType;
    const matchesRegion = activeTab !== 'quests' || questRegion === 'all' || entry.regionId === questRegion;
    const matchesStatus = activeTab !== 'quests' || questStatus === 'all' || entry.status === questStatus;
    return matchesSearch && matchesUnread && matchesType && matchesRegion && matchesStatus;
  });
  const newCount = getNewChronicleCount(data, readIds);
  const pinnedTitle = data.quests.flatMap((entry) => entry.objectives).find((objective) => objective.id === chronicle.pinnedObjectiveId)?.title;

  function markRead(entryId, read) {
    dispatch({ type: 'MARK_CHRONICLE_ENTRY', entryId, read });
  }

  function pinObjective(objectiveId) {
    dispatch({ type: 'PIN_CHRONICLE_OBJECTIVE', objectiveId });
  }

  return (
    <div className="journal-page chronicle-page">
      <div className="chronicle-title">
        <div>
          <h1><ScrollText size={28} aria-hidden="true" /> {t(language, 'journal.title')}</h1>
          <p className="lead">{t(language, 'journal.subtitle')}</p>
        </div>
        {newCount > 0 && <span className="chronicle-new-count">{newCount} {t(language, 'chronicle.new')}</span>}
      </div>

      <Panel className="journal-board-link">
        <div>
          <h2>{t(language, 'investigation.title')}</h2>
          <p className="muted">{t(language, game.progress.investigationRecords.watchtower?.passed ? 'investigation.caseComplete' : game.progress.investigationDrafts.watchtower ? 'investigation.caseInProgress' : 'investigation.journalSummary')}</p>
        </div>
        <Link className="btn btn-primary" to="/investigation-board">
          <Waypoints size={18} aria-hidden="true" /> {t(language, 'investigation.open')}
        </Link>
      </Panel>

      <Panel className="chronicle-controls">
        <label className="chronicle-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{t(language, 'chronicle.search')}</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t(language, 'chronicle.searchHint')} />
        </label>
        <label className="chronicle-unread-filter">
          <input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} />
          {t(language, 'chronicle.recentOnly')}
        </label>
        {activeTab === 'quests' && (
          <div className="chronicle-filters">
            <label>{t(language, 'chronicle.typeFilter')}
              <select value={questType} onChange={(event) => setQuestType(event.target.value)}>
                <option value="all">{t(language, 'chronicle.allTypes')}</option>
                <option value="chapter">{t(language, 'chronicle.type.chapter')}</option>
                <option value="encounter">{t(language, 'chronicle.type.encounter')}</option>
              </select>
            </label>
            <label>{t(language, 'chronicle.regionFilter')}
              <select value={questRegion} onChange={(event) => setQuestRegion(event.target.value)}>
                <option value="all">{t(language, 'chronicle.allRegions')}</option>
                {[...new Set(data.quests.map((entry) => entry.regionId))].map((id) => <option key={id} value={id}>{t(language, `region.${id}`)}</option>)}
              </select>
            </label>
            <label>{t(language, 'chronicle.statusFilter')}
              <select value={questStatus} onChange={(event) => setQuestStatus(event.target.value)}>
                <option value="all">{t(language, 'chronicle.allStatuses')}</option>
                {['available', 'active', 'completed'].map((status) => <option key={status} value={status}>{t(language, `chronicle.status.${status}`)}</option>)}
              </select>
            </label>
          </div>
        )}
        {chronicle.pinnedObjectiveId && (
          <div className="chronicle-tracker-settings">
            <span>{t(language, 'chronicle.pinned')}: {pinnedTitle ?? chronicle.pinnedObjectiveId}</span>
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: 'SET_CHRONICLE_TRACKER_HIDDEN', hidden: !chronicle.trackerHidden })}
              aria-pressed={chronicle.trackerHidden}
            >
              {t(language, chronicle.trackerHidden ? 'chronicle.showTracker' : 'chronicle.hideTracker')}
            </Button>
          </div>
        )}
      </Panel>

      <div className="chronicle-tabs" role="tablist" aria-label={t(language, 'journal.title')}>
        {CHRONICLE_TABS.map((tab) => (
          <button
            key={tab}
            id={`chronicle-tab-${tab}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="chronicle-panel"
            onClick={() => setActiveTab(tab)}
          >
            {t(language, `chronicle.tab.${tab}`)}
          </button>
        ))}
      </div>

      <section id="chronicle-panel" role="tabpanel" aria-labelledby={`chronicle-tab-${activeTab}`} className={`chronicle-panel chronicle-section-${activeTab}`}>
        {visibleEntries.length === 0 ? <p className="muted">{t(language, 'chronicle.noEntries')}</p> : (
          <ul className="journal-list chronicle-list">
            {visibleEntries.map((entry) => entry.type === 'quest' ? (
              <QuestCard
                key={entry.id}
                entry={entry}
                language={language}
                readIds={readIds}
                pinnedObjectiveId={chronicle.pinnedObjectiveId}
                onRead={markRead}
                onPin={pinObjective}
                navigate={navigate}
              />
            ) : entry.type === 'person' ? (
              <EntryCard
                key={entry.id}
                entry={{ ...entry, titleKey: entry.nameKey, descriptionKey: entry.factsKey }}
                language={language}
                isRead={readIds.includes(entry.id)}
                onRead={markRead}
              />
            ) : (
              <EntryCard
                key={entry.id}
                entry={entry}
                language={language}
                isRead={readIds.includes(entry.id)}
                onRead={markRead}
              />
            ))}
          </ul>
        )}
      </section>
      <p className="muted chronicle-facts-note">{t(language, 'investigation.journalSummary')}</p>
    </div>
  );
}
