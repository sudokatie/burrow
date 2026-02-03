import { DAY_START_HOUR, NIGHT_START_HOUR, STARTING_DAY, STARTING_HOUR } from './constants';

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
}

export function createTime(): GameTime {
  return {
    day: STARTING_DAY,
    hour: STARTING_HOUR,
    minute: 0,
  };
}

export function advanceTime(time: GameTime, minutes: number): void {
  time.minute += minutes;
  
  while (time.minute >= 60) {
    time.minute -= 60;
    time.hour += 1;
  }
  
  while (time.hour >= 24) {
    time.hour -= 24;
    time.day += 1;
  }
}

export function getTimeString(time: GameTime): string {
  const hourStr = time.hour.toString().padStart(2, '0');
  const minStr = time.minute.toString().padStart(2, '0');
  return `Day ${time.day} - ${hourStr}:${minStr}`;
}

export function isDaytime(time: GameTime): boolean {
  return time.hour >= DAY_START_HOUR && time.hour < NIGHT_START_HOUR;
}

export function isNighttime(time: GameTime): boolean {
  return !isDaytime(time);
}

export function getDayProgress(time: GameTime): number {
  // Returns 0-1 representing progress through the day (6am to 8pm)
  const dayLength = NIGHT_START_HOUR - DAY_START_HOUR;
  
  if (time.hour < DAY_START_HOUR) return 0;
  if (time.hour >= NIGHT_START_HOUR) return 1;
  
  const hoursPassed = time.hour - DAY_START_HOUR;
  const minutesFraction = time.minute / 60;
  
  return (hoursPassed + minutesFraction) / dayLength;
}
