import { type RecallQuality } from "@/types";

interface CardSchedule {
  easinessFactor: number;
  interval: number;
  repetitions: number;
}

interface ScheduleResult extends CardSchedule {
  nextReviewDate: string;
}

function todayString(date?: Date): string {
  const d = date ?? new Date();
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function sm2(
  card: CardSchedule,
  quality: RecallQuality,
  today?: Date
): ScheduleResult {
  const todayStr = todayString(today);

  let { easinessFactor, interval, repetitions } = card;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easinessFactor =
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }

  const nextReviewDate = addDays(todayStr, interval);

  return {
    easinessFactor: Math.round(easinessFactor * 100) / 100,
    interval,
    repetitions,
    nextReviewDate,
  };
}
