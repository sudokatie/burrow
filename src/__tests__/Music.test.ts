// Music.test.ts - Tests for background music system

import { Music, MusicSystem } from '../game/Music';

describe('MusicSystem', () => {
  beforeEach(() => {
    MusicSystem.resetInstance();
  });

  describe('getInstance', () => {
    it('returns a singleton instance', () => {
      const instance1 = MusicSystem.getInstance();
      const instance2 = MusicSystem.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('setEnabled / isEnabled', () => {
    it('enables and disables music', () => {
      const music = MusicSystem.getInstance();
      expect(music.isEnabled()).toBe(true);
      
      music.setEnabled(false);
      expect(music.isEnabled()).toBe(false);
      
      music.setEnabled(true);
      expect(music.isEnabled()).toBe(true);
    });

    it('stops music when disabled', () => {
      const music = MusicSystem.getInstance();
      music.play();
      music.setEnabled(false);
      expect(music.isCurrentlyPlaying()).toBe(false);
    });
  });

  describe('setVolume / getVolume', () => {
    it('sets and gets volume', () => {
      const music = MusicSystem.getInstance();
      
      music.setVolume(0.5);
      expect(music.getVolume()).toBe(0.5);
      
      music.setVolume(1.0);
      expect(music.getVolume()).toBe(1.0);
    });

    it('clamps volume to 0-1 range', () => {
      const music = MusicSystem.getInstance();
      
      music.setVolume(-0.5);
      expect(music.getVolume()).toBe(0);
      
      music.setVolume(1.5);
      expect(music.getVolume()).toBe(1);
    });
  });

  describe('play / stop / toggle', () => {
    it('does not throw when playing', () => {
      const music = MusicSystem.getInstance();
      expect(() => music.play()).not.toThrow();
      expect(() => music.play('gameplay')).not.toThrow();
    });

    it('does not throw when stopping', () => {
      const music = MusicSystem.getInstance();
      expect(() => music.stop()).not.toThrow();
    });

    it('does not throw when toggling', () => {
      const music = MusicSystem.getInstance();
      expect(() => music.toggle()).not.toThrow();
    });

    it('does not play when disabled', () => {
      const music = MusicSystem.getInstance();
      music.setEnabled(false);
      music.play();
      expect(music.isCurrentlyPlaying()).toBe(false);
    });
  });

  describe('isCurrentlyPlaying', () => {
    it('returns false initially', () => {
      const music = MusicSystem.getInstance();
      expect(music.isCurrentlyPlaying()).toBe(false);
    });

    it('returns false after stop', () => {
      const music = MusicSystem.getInstance();
      music.play();
      music.stop();
      expect(music.isCurrentlyPlaying()).toBe(false);
    });
  });
});

describe('Music singleton export', () => {
  it('exports Music as a ready-to-use singleton', () => {
    expect(Music).toBeDefined();
    expect(typeof Music.play).toBe('function');
    expect(typeof Music.stop).toBe('function');
    expect(typeof Music.toggle).toBe('function');
    expect(typeof Music.setEnabled).toBe('function');
    expect(typeof Music.isEnabled).toBe('function');
    expect(typeof Music.setVolume).toBe('function');
    expect(typeof Music.getVolume).toBe('function');
  });
});
