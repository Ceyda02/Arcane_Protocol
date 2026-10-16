import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { gameReducer, initStore } from './gameReducer.js';
import { loadGame, saveGame, clearSave } from '../storage/saveStorage.js';

const GameContext = createContext(null);

export function GameProvider({ children, storage }) {
  const [boot] = useState(() => loadGame(storage));
  const [store, dispatch] = useReducer(gameReducer, boot.state, (s) => initStore(s));
  const [saveStatus, setSaveStatus] = useState({ ok: true, error: boot.status === 'corrupt' || boot.status === 'unavailable' ? boot.error : null, boot: boot.status });
  const first = useRef(true);

  // Autosave on every change to persisted state. Never saves secrets: only game progress.
  useEffect(() => {
    if (first.current) { first.current = false; if (boot.status === 'new' || boot.status === 'corrupt') return; }
    const res = saveGame(store.game, storage);
    setSaveStatus((s) => ({ ...s, ok: res.ok, error: res.ok ? null : res.error }));
  }, [store.game]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply accessibility settings to the document.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = store.game.settings.language;
    root.dataset.text = store.game.settings.textSize;
    root.dataset.motion = store.game.settings.reducedMotion;
  }, [store.game.settings.language, store.game.settings.textSize, store.game.settings.reducedMotion]);

  const value = useMemo(
    () => ({
      game: store.game,
      events: store.events,
      eventKey: store.eventKey,
      saveStatus,
      dispatch,
      resetGame: () => { clearSave(storage); dispatch({ type: 'NEW_GAME', keepSettings: true }); },
    }),
    [store, saveStatus, storage],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
