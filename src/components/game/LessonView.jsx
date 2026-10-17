import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { CHARACTERS } from '../../content/characters.js';
import { Button, Panel, Portrait } from '../common/ui.jsx';
import { localizeChapter1 } from '../../i18n/chapter1.js';
import { t } from '../../i18n/index.js';
import { useGame } from '../../state/GameContext.jsx';

/** Lesson screen: plain-language first, with the technical detail one click deeper (progressive disclosure). */
export default function LessonView({ lesson, flags = {}, onContinue }) {
  const { game } = useGame();
  const localizedLesson = localizeChapter1(lesson, game.settings.language);
  const [deeper, setDeeper] = useState(false);
  const who = flags.askedFirst === 'elowen' ? CHARACTERS.elowen : CHARACTERS.ash;
  const introKey = flags.askedFirst === 'elowen' ? 'elowen' : 'ash';
  const intro = localizedLesson.intro?.[introKey] ?? localizedLesson.intro?.ash;
  return (
    <Panel className="lesson" aria-labelledby="lesson-title">
      <header className="lesson-head">
        <BookOpen aria-hidden="true" />
        <h2 id="lesson-title">{localizedLesson.title}</h2>
      </header>
      {intro && (
        <div className="lesson-intro">
          <Portrait portraitKey={who.portrait} name={who.name} size="sm" accent={who.accent} />
          <p><strong>{who.name}:</strong> {intro}</p>
        </div>
      )}
      {localizedLesson.sections.map((s) => (
        <section key={s.heading} className="lesson-section">
          <h3>{s.heading}</h3>
          {s.body.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
      {localizedLesson.technical && (
        <div className="deeper">
          <button type="button" className="link-btn" onClick={() => setDeeper((d) => !d)} aria-expanded={deeper}>
            <ChevronDown size={14} aria-hidden="true" className={deeper ? 'rot' : ''} /> {t(game.settings.language, deeper ? 'chapter.hide' : 'chapter.show')} {t(game.settings.language, 'chapter.technicalDetail')}
          </button>
          {deeper && <p className="deeper-text">{localizedLesson.technical}</p>}
        </div>
      )}
      <div className="challenge-actions"><Button onClick={onContinue}>{t(game.settings.language, 'chapter.readyForChallenge')}</Button></div>
    </Panel>
  );
}
