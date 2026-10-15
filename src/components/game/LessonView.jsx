import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { CHARACTERS } from '../../content/characters.js';
import { Button, Panel, Portrait } from '../common/ui.jsx';

/** Lesson screen: plain-language first, with the technical detail one click deeper (progressive disclosure). */
export default function LessonView({ lesson, flags = {}, onContinue }) {
  const [deeper, setDeeper] = useState(false);
  const who = flags.askedFirst === 'elowen' ? CHARACTERS.elowen : CHARACTERS.ash;
  const introKey = flags.askedFirst === 'elowen' ? 'elowen' : 'ash';
  const intro = lesson.intro?.[introKey] ?? lesson.intro?.ash;
  return (
    <Panel className="lesson" aria-labelledby="lesson-title">
      <header className="lesson-head">
        <BookOpen aria-hidden="true" />
        <h2 id="lesson-title">{lesson.title}</h2>
      </header>
      {intro && (
        <div className="lesson-intro">
          <Portrait portraitKey={who.portrait} name={who.name} size="sm" accent={who.accent} />
          <p><strong>{who.name}:</strong> {intro}</p>
        </div>
      )}
      {lesson.sections.map((s) => (
        <section key={s.heading} className="lesson-section">
          <h3>{s.heading}</h3>
          {s.body.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
      {lesson.technical && (
        <div className="deeper">
          <button type="button" className="link-btn" onClick={() => setDeeper((d) => !d)} aria-expanded={deeper}>
            <ChevronDown size={14} aria-hidden="true" className={deeper ? 'rot' : ''} /> {deeper ? 'Hide' : 'Show'} the technical detail
          </button>
          {deeper && <p className="deeper-text">{lesson.technical}</p>}
        </div>
      )}
      <div className="challenge-actions"><Button onClick={onContinue}>I’m ready for the challenge</Button></div>
    </Panel>
  );
}
