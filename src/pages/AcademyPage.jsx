import { useState } from 'react';
import { useGame } from '../state/GameContext.jsx';
import { Panel, Button } from '../components/common/ui.jsx';
import { t } from '../i18n/index.js';

const PACKETS = [
  { id: 'auth', key: 'packet.auth' },
  { id: 'beacon-a', key: 'packet.beaconA', suspicious: true },
  { id: 'dns', key: 'packet.dns' },
  { id: 'beacon-b', key: 'packet.beaconB', suspicious: true },
  { id: 'update', key: 'packet.update' },
  { id: 'transfer', key: 'packet.transfer' },
  { id: 'patch', key: 'packet.patch' },
];

const PACKET_COUNTS = { easy: 3, normal: 5, hard: 7 };
const normalizeAnswer = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().replace(/[^A-Z]/g, '');

export function decodeCaesar(text, shift) {
  const offset = ((shift % 26) + 26) % 26;
  return text.replace(/[A-Z]/gi, (character) => {
    const base = character === character.toUpperCase() ? 65 : 97;
    return String.fromCharCode(((character.charCodeAt(0) - base - offset + 26) % 26) + base);
  });
}

function PacketExercise({ language, difficulty, record, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const packets = difficulty === 'easy'
    ? [PACKETS[0], PACKETS[1], PACKETS[3]]
    : PACKETS.slice(0, PACKET_COUNTS[difficulty] ?? PACKET_COUNTS.normal);
  const check = () => {
    const expected = packets.filter((packet) => packet.suspicious).map((packet) => packet.id).sort();
    const answer = [...selected].sort();
    const passed = expected.length === answer.length && expected.every((id, index) => id === answer[index]);
    setResult(passed);
    onSubmit(passed);
  };

  return (
    <Panel className="academy-exercise">
      <h2>{t(language, 'academy.packetTitle')}</h2>
      <p>{t(language, 'academy.packetIntro')}</p>
      <p className="muted">{t(language, 'academy.packetSafety')}</p>
      <div className="packet-stream" aria-label={t(language, 'academy.packetStream')}>
        {packets.map((packet, index) => (
          <label key={packet.id} className={`packet-row ${selected.includes(packet.id) ? 'is-selected' : ''}`}>
            <input
              type="checkbox"
              checked={selected.includes(packet.id)}
              disabled={result === true}
              onChange={() => setSelected((current) => current.includes(packet.id)
                ? current.filter((id) => id !== packet.id)
                : [...current, packet.id])}
            />
            <span className="packet-time">10:{String(12 + index).padStart(2, '0')}</span>
            <code>{t(language, `academy.${packet.key}`)}</code>
          </label>
        ))}
      </div>
      {result === null
        ? <Button onClick={check}>{t(language, 'academy.firewall')}</Button>
        : <div className={`feedback ${result ? 'feedback-good' : 'feedback-bad'}`} role="status">
          <strong>{t(language, result ? 'academy.packetCorrect' : 'academy.packetIncorrect')}</strong>
          <p>{t(language, 'academy.packetExplain')}</p>
          {result
            ? <p>{t(language, 'academy.codexBotnet')}</p>
            : <Button variant="ghost" onClick={() => setResult(null)}>{t(language, 'academy.tryAgain')}</Button>}
        </div>}
      {record?.passed && <p className="muted">{t(language, 'academy.completed')}</p>}
    </Panel>
  );
}

function CipherExercise({ language, record, onSubmit }) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const check = (event) => {
    event.preventDefault();
    const solution = decodeCaesar('RIIOLQH EDFNXS', 3);
    const acceptedAnswers = [solution, language === 'tr' ? 'ÇEVRİMDIŞI YEDEK' : solution];
    const passed = acceptedAnswers.some((candidate) => normalizeAnswer(answer) === normalizeAnswer(candidate));
    setResult(passed);
    onSubmit(passed);
  };

  return (
    <Panel className="academy-exercise">
      <h2>{t(language, 'academy.cipherTitle')}</h2>
      <p>{t(language, 'academy.cipherIntro')}</p>
      <p className="cipher-scroll" aria-label={t(language, 'academy.cipherLabel')}>RIIOLQH EDFNXS</p>
      <p className="muted">{t(language, 'academy.cipherClue')}</p>
      <p className="muted">{t(language, 'academy.cipherLanguageNote')}</p>
      <form className="cipher-form" onSubmit={check}>
        <label className="field">
          <span>{t(language, 'academy.cipherAnswer')}</span>
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={result === true} autoComplete="off" />
        </label>
        {result === null && <Button type="submit" disabled={!answer.trim()}>{t(language, 'academy.openSeal')}</Button>}
      </form>
      {result !== null && (
        <div className={`feedback ${result ? 'feedback-good' : 'feedback-bad'}`} role="status">
          <strong>{t(language, result ? 'academy.cipherCorrect' : 'academy.cipherIncorrect')}</strong>
          <p>{t(language, 'academy.cipherExplain')}</p>
          {result
            ? <p>{t(language, 'academy.codexVirus')}</p>
            : <Button variant="ghost" onClick={() => setResult(null)}>{t(language, 'academy.tryAgain')}</Button>}
        </div>
      )}
      {record?.passed && <p className="muted">{t(language, 'academy.completed')}</p>}
    </Panel>
  );
}

export default function AcademyPage() {
  const { game, dispatch } = useGame();
  const language = game.settings.language;
  const difficulty = game.settings.difficulty ?? 'normal';
  const submit = (trainingId) => (passed) => dispatch({ type: 'COMPLETE_TRAINING', trainingId, passed });
  return (
    <div className="academy">
      <h1>{t(language, 'academy.title')}</h1>
      <p className="muted">{t(language, 'academy.intro')}</p>
      <p className="academy-difficulty">{t(language, 'academy.difficulty')}: {t(language, `settings.difficulty.${difficulty}`)}</p>
      <div className="academy-grid">
        <PacketExercise
          language={language}
          difficulty={difficulty}
          record={game.progress.training.packetAnalysis}
          onSubmit={submit('packetAnalysis')}
        />
        <CipherExercise
          language={language}
          record={game.progress.training.cipher}
          onSubmit={submit('cipher')}
        />
      </div>
    </div>
  );
}
