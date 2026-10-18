import { describe, expect, it, vi } from 'vitest';

class FakeAudio {
  static instances = [];

  constructor(src) {
    this.src = src;
    this.paused = true;
    this.playCount = 0;
    this.listeners = {};
    FakeAudio.instances.push(this);
  }

  addEventListener(name, callback) {
    this.listeners[name] = callback;
  }

  play() {
    this.paused = false;
    this.playCount += 1;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {}
}

describe('optional audio manager', () => {
  it('starts music by default, toggles music separately from effects, and uses supplied asset paths', async () => {
    vi.stubGlobal('Audio', FakeAudio);
    FakeAudio.instances = [];
    const { playSound, setMusicScene, unlockAudio, updateAudioSettings } = await import('../components/common/sound.js?audio-test');
    const settings = { muted: false, musicMuted: false, volume: 0.5, musicVolume: 0.25 };
    setMusicScene('mainTheme', settings);

    playSound('click', settings);
    playSound('click', settings);
    expect(FakeAudio.instances).toHaveLength(2);
    expect(FakeAudio.instances[0].src).toContain('audio/Loop_The_Bards_Tale.wav');
    expect(FakeAudio.instances[0].loop).toBe(true);
    expect(FakeAudio.instances[0].volume).toBeCloseTo(0.1125);
    expect(FakeAudio.instances[1].src).toContain('audio/ui_button_click.wav');
    expect(FakeAudio.instances[1].playCount).toBe(2);

    updateAudioSettings({ ...settings, musicMuted: true });
    expect(FakeAudio.instances[0].paused).toBe(true);
    expect(FakeAudio.instances[1].paused).toBe(false);
    unlockAudio(settings);
    expect(FakeAudio.instances[0].paused).toBe(false);
    vi.unstubAllGlobals();
  });
});
