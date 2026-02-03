import {
  createTime,
  advanceTime,
  getTimeString,
  isDaytime,
  isNighttime,
  getDayProgress,
  GameTime,
} from '../game/Time';
import { DAY_START_HOUR, NIGHT_START_HOUR, STARTING_DAY, STARTING_HOUR } from '../game/constants';

describe('Time System', () => {
  describe('createTime', () => {
    it('creates time with starting values', () => {
      const time = createTime();
      expect(time.day).toBe(STARTING_DAY);
      expect(time.hour).toBe(STARTING_HOUR);
      expect(time.minute).toBe(0);
    });
  });

  describe('advanceTime', () => {
    it('advances minutes', () => {
      const time = createTime();
      advanceTime(time, 15);
      expect(time.minute).toBe(15);
    });

    it('rolls over to next hour', () => {
      const time = createTime();
      time.minute = 45;
      advanceTime(time, 30);
      expect(time.hour).toBe(STARTING_HOUR + 1);
      expect(time.minute).toBe(15);
    });

    it('rolls over to next day', () => {
      const time = createTime();
      time.hour = 23;
      time.minute = 30;
      advanceTime(time, 60);
      expect(time.day).toBe(STARTING_DAY + 1);
      expect(time.hour).toBe(0);
      expect(time.minute).toBe(30);
    });

    it('handles multiple hour rollover', () => {
      const time = createTime();
      advanceTime(time, 180); // 3 hours
      expect(time.hour).toBe(STARTING_HOUR + 3);
    });
  });

  describe('getTimeString', () => {
    it('formats time correctly', () => {
      const time: GameTime = { day: 5, hour: 14, minute: 30 };
      expect(getTimeString(time)).toBe('Day 5 - 14:30');
    });

    it('pads single digits', () => {
      const time: GameTime = { day: 1, hour: 6, minute: 5 };
      expect(getTimeString(time)).toBe('Day 1 - 06:05');
    });
  });

  describe('isDaytime', () => {
    it('returns true during day hours', () => {
      const time: GameTime = { day: 1, hour: 12, minute: 0 };
      expect(isDaytime(time)).toBe(true);
    });

    it('returns true at day start', () => {
      const time: GameTime = { day: 1, hour: DAY_START_HOUR, minute: 0 };
      expect(isDaytime(time)).toBe(true);
    });

    it('returns false at night start', () => {
      const time: GameTime = { day: 1, hour: NIGHT_START_HOUR, minute: 0 };
      expect(isDaytime(time)).toBe(false);
    });

    it('returns false at night', () => {
      const time: GameTime = { day: 1, hour: 22, minute: 0 };
      expect(isDaytime(time)).toBe(false);
    });

    it('returns false early morning', () => {
      const time: GameTime = { day: 1, hour: 3, minute: 0 };
      expect(isDaytime(time)).toBe(false);
    });
  });

  describe('isNighttime', () => {
    it('returns opposite of isDaytime', () => {
      const dayTime: GameTime = { day: 1, hour: 12, minute: 0 };
      const nightTime: GameTime = { day: 1, hour: 22, minute: 0 };
      
      expect(isNighttime(dayTime)).toBe(!isDaytime(dayTime));
      expect(isNighttime(nightTime)).toBe(!isDaytime(nightTime));
    });
  });

  describe('getDayProgress', () => {
    it('returns 0 before day start', () => {
      const time: GameTime = { day: 1, hour: 4, minute: 0 };
      expect(getDayProgress(time)).toBe(0);
    });

    it('returns 1 after day end', () => {
      const time: GameTime = { day: 1, hour: 22, minute: 0 };
      expect(getDayProgress(time)).toBe(1);
    });

    it('returns 0.5 at midday', () => {
      const midHour = DAY_START_HOUR + (NIGHT_START_HOUR - DAY_START_HOUR) / 2;
      const time: GameTime = { day: 1, hour: midHour, minute: 0 };
      expect(getDayProgress(time)).toBeCloseTo(0.5);
    });

    it('returns 0 at day start', () => {
      const time: GameTime = { day: 1, hour: DAY_START_HOUR, minute: 0 };
      expect(getDayProgress(time)).toBe(0);
    });
  });
});
