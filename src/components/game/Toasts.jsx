import { useEffect, useState } from 'react';
import { useGame } from '../../state/GameContext.jsx';
import { SKILLS } from '../../content/skills.js';
import { GRIMOIRE_BY_ID } from '../../content/lessons/grimoire.js';
import { MALWARE_CREATURES } from '../../content/index.js';
import { REALM_CREATURES } from '../../content/bestiary.js';

function describe(e) {
  switch (e.type) {
    case 'xp': return `+${e.amount} XP${e.skill ? ` · ${SKILLS[e.skill]?.name ?? ''}` : ''}`;
    case 'level': return `Level up! You are now level ${e.level}.`;
    case 'achievement': return `Achievement: ${e.name}`;
    case 'grimoire': return `New Grimoire page: ${GRIMOIRE_BY_ID[e.id]?.title ?? e.id}`;
    case 'bestiary': return `Bestiary entry: ${[...MALWARE_CREATURES, ...REALM_CREATURES].find((c) => c.id === e.id)?.name ?? e.id}`;
    case 'quest': return `Quest complete: ${e.title}`;
    default: return null;
  }
}

/** Polite, non-blocking notices. Driven by real game events only. */
export default function Toasts() {
  const { events, eventKey } = useGame();
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!events.length) return undefined;
    const added = events.map((e, i) => ({ id: `${eventKey}-${i}`, text: describe(e) })).filter((t) => t.text);
    setList((l) => [...l, ...added].slice(-5));
    const timer = setTimeout(() => setList((l) => l.filter((t) => !added.includes(t))), 5000);
    return () => clearTimeout(timer);
  }, [eventKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="toasts" role="status" aria-live="polite">
      {list.map((t) => <div key={t.id} className="toast">{t.text}</div>)}
    </div>
  );
}
