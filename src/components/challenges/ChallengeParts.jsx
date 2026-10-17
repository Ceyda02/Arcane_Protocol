import { ArrowDown, ArrowUp } from 'lucide-react';
import { useGame } from '../../state/GameContext.jsx';
import { t } from '../../i18n/index.js';

function useLanguage() {
  return useGame().game.settings.language;
}

/**
 * One renderer per challenge type. Each receives:
 * { challenge, answer, setAnswer, result, locked }
 * `result` is present after submit so we can show per-item feedback (not colour alone: text and glyphs too).
 */

export function EvidenceTable({ columns, rows, notes, caption }) {
  const language = useLanguage();
  return (
    <div className="table-wrap">
      <table className="ledger">
        {caption && <caption>{caption === 'Evidence' ? t(language, 'challenge.evidence') : caption}</caption>}
        <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{(r.cells ?? r).map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
      </table>
      {notes && <p className="ledger-note">{notes}</p>}
    </div>
  );
}

export function MultipleChoice({ challenge, answer, setAnswer, result, locked }) {
  return (
    <fieldset className="choices" disabled={locked}>
      <legend className="sr-only">{challenge.instructions}</legend>
      {challenge.data.options.map((o) => (
        <label key={o.id} className={`choice ${answer === o.id ? 'is-selected' : ''}`}>
          <input type="radio" name={challenge.id} value={o.id} checked={answer === o.id} onChange={() => setAnswer(o.id)} />
          <span>{o.text}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function MultiSelect({ challenge, answer = [], setAnswer, result, locked }) {
  const language = useLanguage();
  const { data } = challenge;
  const toggle = (id) => setAnswer(answer.includes(id) ? answer.filter((x) => x !== id) : [...answer, id]);
  const mark = (id) => {
    if (!result) return null;
    const should = data.correctIds.includes(id);
    const did = answer.includes(id);
    if (should && did) return <span className="mark mark-good">✔ {t(language, 'challenge.worthInvestigating')}</span>;
    if (should && !did) return <span className="mark mark-bad">✖ {t(language, 'challenge.missed')}: {data.explanations?.[id]}</span>;
    if (!should && did) return <span className="mark mark-bad">✖ {t(language, 'challenge.notSuspicious')}: {data.explanations?.[id]}</span>;
    return null;
  };
  if (data.rows) {
    return (
      <div className="table-wrap">
        <table className="ledger ledger-select">
          <caption className="sr-only">{t(language, 'challenge.selectEntries')}</caption>
          <thead><tr><th scope="col">{t(language, 'challenge.flag')}</th>{data.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id} className={answer.includes(r.id) ? 'is-selected' : ''}>
                <td>
                  <input type="checkbox" id={`${challenge.id}-${r.id}`} checked={answer.includes(r.id)} disabled={locked} onChange={() => toggle(r.id)} aria-label={`${t(language, 'challenge.flagEntry')} ${r.cells[0]}: ${r.cells[3]} ${t(language, 'challenge.by')} ${r.cells[2]}`} />
                </td>
                {r.cells.map((c, i) => <td key={i}>{c}</td>)}
                {result && <td className="mark-cell">{mark(r.id)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <fieldset className="choices" disabled={locked}>
      <legend className="sr-only">{challenge.instructions}</legend>
      {data.items.map((it) => (
        <label key={it.id} className={`choice ${answer.includes(it.id) ? 'is-selected' : ''}`}>
          <input type="checkbox" checked={answer.includes(it.id)} onChange={() => toggle(it.id)} />
          <span>{it.text} {mark(it.id)}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function MatchPairs({ challenge, answer = {}, setAnswer, result, locked }) {
  const language = useLanguage();
  const { data } = challenge;
  return (
    <div className="pairs">
      {data.left.map((l) => {
        const wrong = result && result.details.wrong?.includes(l.id);
        return (
          <div key={l.id} className="pair">
            <label htmlFor={`${challenge.id}-${l.id}`} className="pair-left">{l.text}</label>
            <select id={`${challenge.id}-${l.id}`} value={answer[l.id] ?? ''} disabled={locked} onChange={(e) => setAnswer({ ...answer, [l.id]: e.target.value })}>
              <option value="" disabled>{t(language, 'challenge.choose')}</option>
              {data.right.map((r) => <option key={r.id} value={r.id}>{r.text}</option>)}
            </select>
            {result && <span className={`mark ${wrong ? 'mark-bad' : 'mark-good'}`}>{wrong ? `✖ ${data.explanations?.[l.id] ?? ''}` : `✔ ${t(language, 'challenge.correct')}`}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function SortOrder({ challenge, answer, setAnswer, result, locked }) {
  const language = useLanguage();
  const items = challenge.data.items;
  const order = answer ?? items.map((i) => i.id);
  const text = (id) => items.find((i) => i.id === id)?.text;
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setAnswer(next);
  };
  const bad = result?.details?.wrongPositions ?? [];
  return (
    <ol className="sortlist">
      {order.map((id, i) => (
        <li key={id} className={result ? (bad.includes(i) ? 'is-wrong' : 'is-right') : ''}>
          <span className="sort-pos" aria-hidden="true">{i + 1}</span>
          <span className="sort-text">{text(id)}</span>
          {result && <span className="mark">{bad.includes(i) ? '✖' : '✔'}</span>}
          <span className="sort-btns">
            <button type="button" className="icon-btn" disabled={locked || i === 0} onClick={() => move(i, -1)} aria-label={`${t(language, 'challenge.moveEarlier')}: ${text(id)}`}><ArrowUp size={16} /></button>
            <button type="button" className="icon-btn" disabled={locked || i === order.length - 1} onClick={() => move(i, 1)} aria-label={`${t(language, 'challenge.moveLater')}: ${text(id)}`}><ArrowDown size={16} /></button>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function DecisionTree({ challenge, answer = {}, setAnswer, result, locked }) {
  const language = useLanguage();
  const { data } = challenge;
  return (
    <div className="tree">
      {data.evidence?.rows && <EvidenceTable columns={data.evidence.columns} rows={data.evidence.rows} notes={data.evidence.notes} caption="Evidence" />}
      {data.steps.map((s, idx) => {
        const r = result?.details?.steps?.find((x) => x.stepId === s.id);
        return (
          <fieldset key={s.id} className="tree-step" disabled={locked}>
            <legend>{t(language, 'challenge.decision')} {idx + 1}: {s.prompt}</legend>
            {s.options.map((o) => (
              <label key={o.id} className={`choice ${answer[s.id] === o.id ? 'is-selected' : ''}`}>
                <input type="radio" name={`${challenge.id}-${s.id}`} checked={answer[s.id] === o.id} onChange={() => setAnswer({ ...answer, [s.id]: o.id })} />
                <span>{o.text}</span>
              </label>
            ))}
            {r && <p className={`mark ${r.score >= 1 ? 'mark-good' : 'mark-bad'}`}>{r.score >= 1 ? '✔' : r.critical ? '⚠' : '✖'} {r.feedback}</p>}
          </fieldset>
        );
      })}
    </div>
  );
}

const VERDICTS = [
  { id: 'approve', labelKey: 'challenge.verdict.approve' },
  { id: 'sandbox', labelKey: 'challenge.verdict.sandbox' },
  { id: 'reject', labelKey: 'challenge.verdict.reject' },
];

export function PermissionReview({ challenge, answer = {}, setAnswer, result, locked }) {
  const language = useLanguage();
  const set = (id, patch) => setAnswer({ ...answer, [id]: { verdict: null, grants: [], ...answer[id], ...patch } });
  return (
    <div className="perm-list">
      {challenge.data.items.map((item) => {
        const a = answer[item.id] ?? { verdict: null, grants: [] };
        const r = result?.details?.items?.find((x) => x.id === item.id);
        return (
          <article key={item.id} className="perm-card">
            <h4>{item.name}</h4>
            <p><strong>{t(language, 'challenge.statedPurpose')}:</strong> {item.purpose}</p>
            <p className="perm-sub">{t(language, 'challenge.provenance')}</p>
            <ul>{item.provenance.map((p) => <li key={p}>{p}</li>)}</ul>
            <fieldset disabled={locked}>
              <legend className="perm-sub">{t(language, 'challenge.requestedPermissions')}</legend>
              {item.permissions.map((p) => (
                <label key={p.id} className="check">
                  <input type="checkbox" checked={a.grants.includes(p.id)} onChange={() => set(item.id, { grants: a.grants.includes(p.id) ? a.grants.filter((x) => x !== p.id) : [...a.grants, p.id] })} />
                  <span>{p.label}</span>
                </label>
              ))}
            </fieldset>
            <fieldset disabled={locked}>
              <legend className="perm-sub">{t(language, 'challenge.verdict')}</legend>
              {VERDICTS.map((v) => (
                <label key={v.id} className={`choice ${a.verdict === v.id ? 'is-selected' : ''}`}>
                  <input type="radio" name={`${item.id}-verdict`} checked={a.verdict === v.id} onChange={() => set(item.id, { verdict: v.id })} />
                  <span>{t(language, v.labelKey)}</span>
                </label>
              ))}
            </fieldset>
            {r && <p className={`mark ${r.score >= 1 ? 'mark-good' : 'mark-bad'}`}>{r.score >= 1 ? '✔' : '✖'} {r.note}</p>}
          </article>
        );
      })}
    </div>
  );
}

export function FillIn({ challenge, answer = {}, setAnswer, result, locked }) {
  return (
    <div className="fill">
      {challenge.data.blanks.map((b) => (
        <label key={b.id} className="fill-row">
          <span>{b.label}</span>
          <input type="text" value={answer[b.id] ?? ''} disabled={locked} onChange={(e) => setAnswer({ ...answer, [b.id]: e.target.value })} autoComplete="off" />
          {result?.details?.wrong?.includes(b.id) && <span className="mark mark-bad">✖ {b.hint}</span>}
        </label>
      ))}
    </div>
  );
}
