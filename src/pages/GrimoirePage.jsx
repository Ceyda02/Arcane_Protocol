import { useMemo, useState } from 'react';
import { Bookmark, Clock } from 'lucide-react';
import { useGame } from '../state/GameContext.jsx';
import { GRIMOIRE_PAGES, GRIMOIRE_BY_ID, GRIMOIRE_CATEGORIES } from '../content/lessons/grimoire.js';
import { Button, EmptyState, Panel } from '../components/common/ui.jsx';
import { useSound } from '../hooks/useSound.js';

export default function GrimoirePage() {
  const { game, dispatch } = useGame();
  const play = useSound();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filter, setFilter] = useState('all');
  const [selId, setSelId] = useState(null);

  const unlocked = game.progress.grimoire.map((id) => GRIMOIRE_BY_ID[id]).filter(Boolean);
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

  const page = (selId && GRIMOIRE_BY_ID[selId] && game.progress.grimoire.includes(selId)) ? GRIMOIRE_BY_ID[selId] : list[0];

  if (unlocked.length === 0) {
    return <EmptyState title="The Grimoire is blank">Complete a lesson to write its first page. Every page you earn stays here for review.</EmptyState>;
  }

  return (
    <div className="grimoire">
      <h1>The Cyber Grimoire</h1>
      <p className="muted">{unlocked.length} of {GRIMOIRE_PAGES.length} pages found.</p>
      <div className="grimoire-tools">
        <label className="field"><span>Search</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. timestamps" /></label>
        <label className="field"><span>Category</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All categories</option>
            {GRIMOIRE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="field"><span>Show</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All pages</option><option value="bookmarks">Bookmarked</option><option value="later">Review later</option>
          </select>
        </label>
      </div>
      <div className="grimoire-grid">
        <ul className="page-list" aria-label="Pages">
          {list.length === 0 && <li className="muted">No pages match.</li>}
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" className={`page-btn ${page?.id === p.id ? 'is-selected' : ''}`} onClick={() => { setSelId(p.id); play('page'); }} aria-current={page?.id === p.id ? 'page' : undefined}>
                <span>{p.title}</span>
                <span className="muted">{p.category}{bookmarks.includes(p.id) ? ' · ★' : ''}{reviewLater.includes(p.id) ? ' · ⏳' : ''}</span>
              </button>
            </li>
          ))}
        </ul>
        {page ? (
          <Panel className="page-detail" aria-live="polite">
            <p className="muted">{page.category} · Learned in: {page.source}</p>
            <h2>{page.title}</h2>
            <div className="page-actions">
              <Button variant="ghost" onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', id: page.id })} aria-pressed={bookmarks.includes(page.id)}><Bookmark size={14} aria-hidden="true" /> {bookmarks.includes(page.id) ? 'Bookmarked' : 'Bookmark'}</Button>
              <Button variant="ghost" onClick={() => dispatch({ type: 'TOGGLE_REVIEW_LATER', id: page.id })} aria-pressed={reviewLater.includes(page.id)}><Clock size={14} aria-hidden="true" /> {reviewLater.includes(page.id) ? 'In review queue' : 'Review later'}</Button>
            </div>
            <h3>In plain language</h3><p>{page.plain}</p>
            <h3>The technical view</h3><p>{page.technical}</p>
            {page.example && (<><h3>{page.example.label}</h3><pre className="evidence" tabIndex={0}>{page.example.text}</pre></>)}
            <h3>A common mistake</h3><p>{page.mistake}</p>
            <h3>Defensive takeaway</h3><p>{page.takeaway}</p>
            {page.links?.length > 0 && (<><h3>Read more</h3><ul>{page.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul></>)}
          </Panel>
        ) : <Panel><p className="muted">Select a page.</p></Panel>}
      </div>
    </div>
  );
}
