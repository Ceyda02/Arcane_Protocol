import { useEffect, useRef } from 'react';
import { asset } from './assets.js';
import { useGame } from '../../state/GameContext.jsx';
import { useSound } from '../../hooks/useSound.js';
import { t } from '../../i18n/index.js';

export function Button({ children, variant = 'primary', onClick, disabled, type = 'button', sound = true, className = '', ...rest }) {
  const play = useSound();
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled}
      onClick={(e) => { if (sound && !disabled) play('click'); onClick?.(e); }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Panel({ children, className = '', as: Tag = 'section', tone = 'parchment', ...rest }) {
  return <Tag className={`panel panel-${tone} ${className}`} {...rest}>{children}</Tag>;
}

export function ProgressBar({ value, max = 100, label, tone = 'gold' }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div className={`bar bar-${tone}`} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-label={label}>
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Status chip: never relies on colour alone. Always has a text label and a glyph. */
export function StatusChip({ status, language = 'en' }) {
  const map = {
    locked: { glyph: '🔒', text: t(language, 'status.locked') },
    available: { glyph: '◆', text: t(language, 'status.available') },
    completed: { glyph: '✔', text: t(language, 'status.completed') },
    coming_soon: { glyph: '⏳', text: t(language, 'status.coming_soon') },
  };
  const m = map[status] ?? map.locked;
  return <span className={`chip chip-${status}`}><span aria-hidden="true">{m.glyph}</span> {m.text}</span>;
}

export function Portrait({ portraitKey, name, size = 'md', accent, placeholder }) {
  const src = asset(portraitKey);
  return (
    <div className={`portrait portrait-${size} portrait-art-${portraitKey}`} style={accent ? { '--accent-portrait': accent } : undefined}>
      {src ? <img src={src} alt={name ? `Portrait of ${name}` : ''} /> : <span className="portrait-ph" aria-label={placeholder ? 'Placeholder art' : undefined}>{placeholder || '?'}</span>}
    </div>
  );
}

/** Accessible modal confirm dialog with focus management and Escape support. */
export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    ref.current?.querySelector('[data-autofocus]')?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal panel panel-parchment" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" ref={ref}>
        <h2 id="dlg-title">{title}</h2>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel} data-autofocus>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <div className="empty-rune" aria-hidden="true">ᚱ</div>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function useGameSettings() {
  return useGame().game.settings;
}
