import { SAVE_VERSION, createInitialState, sanitizeState } from './saveSchema.js';

export const SAVE_KEY = 'arcane-protocol:save';

function getStore(storage) {
  if (storage) return storage;
  try {
    const s = globalThis.localStorage;
    // Probe: some browsers expose the object but throw on access.
    const probe = '__arcane_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** Returns { state, status, error } — status: 'new' | 'loaded' | 'migrated' | 'corrupt' | 'unavailable' */
export function loadGame(storage) {
  const store = getStore(storage);
  if (!store) return { state: createInitialState(), status: 'unavailable', error: 'Storage is unavailable in this browser.' };
  let text;
  try {
    text = store.getItem(SAVE_KEY);
  } catch {
    return { state: createInitialState(), status: 'unavailable', error: 'Storage could not be read.' };
  }
  if (text == null) return { state: createInitialState(), status: 'new' };
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { state: createInitialState(), status: 'corrupt', error: 'Your saved game could not be read, so a new game was started.' };
  }
  const wasOld = (typeof parsed?.version === 'number' ? parsed.version : 0) < SAVE_VERSION;
  const result = sanitizeState(parsed);
  if (!result.ok) {
    const msg =
      result.error === 'newer-version'
        ? 'This save was made by a newer version of the game. It has been left untouched.'
        : 'Your saved game was invalid, so a new game was started.';
    return { state: createInitialState(), status: 'corrupt', error: msg, reason: result.error };
  }
  return { state: result.state, status: wasOld ? 'migrated' : 'loaded' };
}

/** Returns { ok, error? } — error: 'unavailable' | 'quota' | 'unknown' */
export function saveGame(state, storage) {
  const store = getStore(storage);
  if (!store) return { ok: false, error: 'unavailable' };
  try {
    store.setItem(SAVE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
    return { ok: true };
  } catch (e) {
    const quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
    return { ok: false, error: quota ? 'quota' : 'unknown' };
  }
}

export function hasSave(storage) {
  const store = getStore(storage);
  try {
    return Boolean(store && store.getItem(SAVE_KEY));
  } catch {
    return false;
  }
}

export function clearSave(storage) {
  const store = getStore(storage);
  try {
    store?.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
