const BASE_URL = import.meta.env.BASE_URL;
const MUSIC_ASSETS = {
  mainTheme: 'Loop_The_Bards_Tale.wav',
};
const SOUND_ASSETS = {
  back: 'ui_back.wav',
  click: 'ui_button_click.wav',
  hover: 'ui_button_hover.wav',
  confirm: 'ui_confirm.wav',
  error: 'ui_error.wav',
  page: 'ui_back.wav',
  correct: 'ui_confirm.wav',
  wrong: 'ui_error.wav',
  complete: 'ui_confirm.wav',
  open: 'ui_confirm.wav',
};

let music = null;
let activeTrack = 'mainTheme';
const effects = new Map();
const reportedFailures = new Set();

function audioPath(filename) {
  return `${BASE_URL}audio/${filename}`;
}

function reportAssetFailure(path, error) {
  if (reportedFailures.has(path)) return;
  reportedFailures.add(path);
  console.warn(`Optional audio asset could not be loaded: ${path}`, error);
}

function playElement(element, path) {
  const playback = element.play();
  if (playback?.catch) {
    playback.catch((error) => {
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') reportAssetFailure(path, error);
    });
  }
}

function makeAudio(filename, { loop = false } = {}) {
  if (typeof Audio === 'undefined') return null;
  const path = audioPath(filename);
  const audio = new Audio(path);
  audio.preload = 'none';
  audio.loop = loop;
  audio.addEventListener('error', () => reportAssetFailure(path, audio.error));
  return audio;
}

export function playSound(name, settings) {
  if (!settings || settings.muted || settings.volume <= 0) return;
  const filename = SOUND_ASSETS[name];
  if (!filename || typeof Audio === 'undefined') return;

  let effect = effects.get(name);
  if (!effect) {
    effect = makeAudio(filename);
    if (!effect) return;
    effects.set(name, effect);
  }
  effect.pause();
  effect.currentTime = 0;
  effect.volume = Math.min(0.65, settings.volume * 0.7);
  playElement(effect, audioPath(filename));
}

function syncMusic(settings) {
  if (!settings || settings.muted || settings.musicMuted || settings.musicVolume <= 0) {
    music?.pause();
    return;
  }
  if (!music) {
    const filename = MUSIC_ASSETS[activeTrack ?? 'mainTheme'];
    music = makeAudio(filename, { loop: true });
    if (!music) return;
  }
  music.volume = Math.min(0.45, settings.musicVolume * 0.45);
  if (music.paused) playElement(music, audioPath(MUSIC_ASSETS[activeTrack ?? 'mainTheme']));
}

export function unlockAudio(settings) {
  syncMusic(settings);
}

export function updateAudioSettings(settings) {
  for (const [name, effect] of effects) {
    effect.volume = Math.min(0.65, settings.volume * 0.7);
    if (settings.muted || settings.volume <= 0) effect.pause();
    if (settings.muted || settings.volume <= 0) effects.delete(name);
  }
  syncMusic(settings);
}

export function setMusicScene(scene, settings) {
  const track = scene in MUSIC_ASSETS ? scene : 'mainTheme';
  if (activeTrack === track) {
    syncMusic(settings);
    return;
  }
  activeTrack = track;
  if (music) {
    music.pause();
    music.currentTime = 0;
    music.src = audioPath(MUSIC_ASSETS[track]);
    music.load();
  }
  syncMusic(settings);
}
