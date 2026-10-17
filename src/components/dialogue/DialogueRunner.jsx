import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { CHARACTERS } from '../../content/characters.js';
import { useGame } from '../../state/GameContext.jsx';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { useSound } from '../../hooks/useSound.js';
import { Button, Portrait } from '../common/ui.jsx';
import PlayerPortrait from '../character/PlayerPortrait.jsx';
import { localizeChapter1 } from '../../i18n/chapter1.js';
import { t } from '../../i18n/index.js';

export const fillTemplate = (text, player) =>
  text.replaceAll('{name}', player?.name ?? 'traveller').replaceAll('{address}', player?.address ? `${player.address} ${player.name}` : player?.name ?? 'traveller');

const passes = (node, flags) => !node.if || flags[node.if.flag] === node.if.is;

/**
 * Reusable dialogue component driven by data nodes:
 *  line   { speaker, text, if? }
 *  choice { type:'choice', prompt, options:[{ id, text, set, replies }] }
 * Supports typewriter text, skip, conditional lines, choices that set flags, and a transcript.
 */
export default function DialogueRunner({ nodes, flags: initialFlags = {}, onSetFlags, onComplete, completeLabel = 'Continue' }) {
  const { game } = useGame();
  const player = game.player;
  const reduced = useReducedMotion();
  const play = useSound();
  const [items, setItems] = useState(nodes);
  const [flags, setFlags] = useState(initialFlags);
  const firstValid = (list, from, f) => { let i = from; while (i < list.length && !passes(list[i], f)) i += 1; return i; };
  const [cursor, setCursor] = useState(() => firstValid(nodes, 0, initialFlags));
  const [history, setHistory] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const nextRef = useRef(null);

  const node = localizeChapter1(items[cursor], game.settings.language);
  const isChoice = node?.type === 'choice';
  const speaker = node && !isChoice ? CHARACTERS[node.speaker] ?? CHARACTERS.narrator : null;
  const text = node && !isChoice ? fillTemplate(node.text, player) : '';
  const { shown, done, skip } = useTypewriter(text, game.settings.textSpeed, reduced);

  const finished = cursor >= items.length;

  const advance = () => {
    if (!isChoice && node) setHistory((h) => [...h, { who: speaker.id === 'you' ? player.name : speaker.name, text }]);
    play('page');
    setCursor((c) => firstValid(items, c + 1, flags));
  };

  const next = () => { if (!done) skip(); else advance(); };

  // Keyboard: Enter / Space advance when focus is not on a control.
  useEffect(() => {
    const onKey = (e) => {
      if (isChoice || finished) return;
      if (e.target.closest?.('button, a, input, select, textarea')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  useEffect(() => { nextRef.current?.focus?.(); }, [cursor]);

  const choose = (opt) => {
    const merged = { ...flags, ...(opt.set ?? {}) };
    setFlags(merged);
    if (opt.set) onSetFlags?.(opt.set);
    setHistory((h) => [...h, { who: player.name, text: opt.text }]);
    const replies = (opt.replies ?? []).map((r) => ({ ...r }));
    const merged_items = [...items.slice(0, cursor + 1), ...replies, ...items.slice(cursor + 1)];
    setItems(merged_items);
    setCursor(firstValid(merged_items, cursor + 1, merged));
  };

  const portrait = useMemo(() => {
    if (!speaker) return null;
    if (speaker.portrait === '__player__') return <PlayerPortrait size="lg" />;
    return speaker.portrait ? <Portrait portraitKey={speaker.portrait} name={speaker.name} size="lg" accent={speaker.accent} /> : <div className="portrait portrait-lg portrait-book" aria-hidden="true">📖</div>;
  }, [speaker]);

  if (finished) {
    return <div className="dialogue-end"><Button onClick={onComplete}>{completeLabel}</Button></div>;
  }

  return (
    <div className="dialogue">
      {isChoice ? (
        <div className="dialogue-box dialogue-choice" role="group" aria-label={node.prompt}>
          <p className="dialogue-name">{node.prompt}</p>
          <div className="choice-list">
            {node.options.map((o) => <Button key={o.id} variant="ghost" onClick={() => choose(o)}>{fillTemplate(o.text, player)}</Button>)}
          </div>
        </div>
      ) : (
        <div className="dialogue-box">
          {portrait}
          <div className="dialogue-main">
            <p className="dialogue-name">{speaker.id === 'you' ? player.name : speaker.name}{speaker.title ? <span className="dialogue-title"> · {speaker.title}</span> : null}</p>
            <p className="dialogue-text" aria-live="polite">{shown}</p>
            <div className="dialogue-actions">
              <Button variant="primary" onClick={next} ref={nextRef}>{done ? t(game.settings.language, 'chapter.next') : t(game.settings.language, 'chapter.skipAnimation')}</Button>
              <button type="button" className="link-btn" onClick={() => setShowLog((s) => !s)} aria-expanded={showLog}><ScrollText size={14} aria-hidden="true" /> {t(game.settings.language, 'chapter.transcript')}</button>
            </div>
          </div>
        </div>
      )}
      {showLog && (
        <ol className="transcript" aria-label={t(game.settings.language, 'chapter.transcriptLabel')}>
          {history.length === 0 && <li className="muted">{t(game.settings.language, 'chapter.nothingSaid')}</li>}
          {history.map((h, i) => <li key={i}><strong>{h.who}:</strong> {h.text}</li>)}
        </ol>
      )}
    </div>
  );
}
