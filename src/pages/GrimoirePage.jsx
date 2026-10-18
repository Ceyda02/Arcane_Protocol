import { useMemo, useState } from 'react';
import { Bookmark, Clock } from 'lucide-react';
import { useGame } from '../state/GameContext.jsx';
import { GRIMOIRE_PAGES, GRIMOIRE_BY_ID, GRIMOIRE_CATEGORIES } from '../content/lessons/grimoire.js';
import { Button, EmptyState, Panel } from '../components/common/ui.jsx';
import { useSound } from '../hooks/useSound.js';
import { t } from '../i18n/index.js';
import { localizeBestiaryPage } from '../i18n/bestiary.js';
import { localizeChapter1 } from '../i18n/chapter1.js';

export default function GrimoirePage() {
  const { game, dispatch } = useGame();
  const language = game.settings.language;
  const play = useSound();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filter, setFilter] = useState('all');
  const [selId, setSelId] = useState(null);

  const unlocked = game.progress.grimoire
    .map((id) => GRIMOIRE_BY_ID[id])
    .filter(Boolean)
    .map((page) => localizeBestiaryPage(localizeChapter1(page, language), language));
  const { bookmarks, reviewLater } = game.library;
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return unlocked.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (filter === 'bookmarks' && !bookmarks.includes(p.id)) return false;
      if (filter === 'later' && !reviewLater.includes(p.id)) return false;
      if (!needle) return true;
      return [p.title, p.concept, p.plain, p.technical, p.category].join(' ').toLowerCase().includes(needle);
    });
  }, [unlocked, q, cat, filter, bookmarks, reviewLater]);

  const page = selId ? list.find((entry) => entry.id === selId) ?? list[0] : list[0];

  if (unlocked.length === 0) {
    return <EmptyState title={t(language, 'grimoire.blank')}>{t(language, 'grimoire.blankHelp')}</EmptyState>;
  }

  return (
    <div className="grimoire">
      <h1>{t(language, 'grimoire.title')}</h1>
      <p className="muted">{unlocked.length} / {GRIMOIRE_PAGES.length} {t(language, 'grimoire.found')}.</p>
      <div className="grimoire-tools">
        <label className="field"><span>{t(language, 'grimoire.search')}</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(language, 'grimoire.searchHint')} /></label>
        <label className="field"><span>{t(language, 'grimoire.category')}</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">{t(language, 'grimoire.allCategories')}</option>
            {GRIMOIRE_CATEGORIES.map((c) => <option key={c} value={c}>{t(language, `grimoire.category.${c}`)}</option>)}
          </select>
        </label>
        <label className="field"><span>{t(language, 'grimoire.show')}</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t(language, 'grimoire.allPages')}</option><option value="bookmarks">{t(language, 'grimoire.bookmarkedFilter')}</option><option value="later">{t(language, 'grimoire.reviewLaterFilter')}</option>
          </select>
        </label>
      </div>
      <div className="grimoire-grid">
        <ul className="page-list" aria-label={t(language, 'grimoire.pages')}>
          {list.length === 0 && <li className="muted">{t(language, 'grimoire.noMatch')}</li>}
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" className={`page-btn ${page?.id === p.id ? 'is-selected' : ''}`} onClick={() => { setSelId(p.id); play('page'); }} aria-current={page?.id === p.id ? 'page' : undefined}>
                <span>{p.title}</span>
                <span className="muted">{t(language, `grimoire.category.${p.category}`)}{bookmarks.includes(p.id) ? ' · ★' : ''}{reviewLater.includes(p.id) ? ' · ⏳' : ''}</span>
              </button>
            </li>
          ))}
        </ul>
        {page ? (
          <Panel key={page.id} className="page-detail" aria-live="polite">
            <div className="grimoire-glow" aria-hidden="true" />
            <p className="muted">{t(language, `grimoire.category.${page.category}`)} · {t(language, 'grimoire.learnedIn')}: {page.source}</p>
            <h2>{page.title}</h2>
            <div className="page-actions">
              <Button variant="ghost" onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', id: page.id })} aria-pressed={bookmarks.includes(page.id)}><Bookmark size={14} aria-hidden="true" /> {bookmarks.includes(page.id) ? t(language, 'grimoire.bookmarked') : t(language, 'grimoire.bookmark')}</Button>
              <Button variant="ghost" onClick={() => dispatch({ type: 'TOGGLE_REVIEW_LATER', id: page.id })} aria-pressed={reviewLater.includes(page.id)}><Clock size={14} aria-hidden="true" /> {reviewLater.includes(page.id) ? t(language, 'grimoire.inQueue') : t(language, 'grimoire.reviewLater')}</Button>
            </div>
            <h3>{t(language, 'grimoire.plain')}</h3><p>{page.plain}</p>
            <h3>{t(language, 'grimoire.technical')}</h3><p>{page.technical}</p>
            {page.example && (<><h3>{page.example.label}</h3><pre className="evidence" tabIndex={0}>{page.example.text}</pre></>)}
            <h3>{t(language, 'grimoire.commonMistake')}</h3><p>{page.mistake}</p>
            <h3>{t(language, 'grimoire.takeaway')}</h3><p>{page.takeaway}</p>
            {page.links?.length > 0 && (<><h3>{t(language, 'grimoire.readMore')}</h3><ul>{page.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul></>)}
          </Panel>
        ) : <Panel><p className="muted">{t(language, 'grimoire.selectPage')}</p></Panel>}
      </div>
    </div>
  );
}
