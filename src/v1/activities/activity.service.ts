import { ActivityData } from "./activity.data";
import { WeeklyStats } from "./activity.model";

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export class ActivityService {
  public static async getWeeklyStats(userId: string, startDate: Date, totalWeeks: number): Promise<WeeklyStats[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalWeeks * 7);

    const rawStats = await ActivityData.getWeeklyStatsRaw(userId, startDate, endDate);

    // Create a map of existing data
    const dataMap = new Map<string, { volume: number; elevation: number; time: number }>();
    for (const row of rawStats) {
      dataMap.set(row.week, {
        volume: Math.round(parseFloat(row.volume) / 1000 * 10) / 10, // Convert to km with 1 decimal
        elevation: Math.round(parseFloat(row.elevation)),
        time: Math.round(parseFloat(row.time)),
      });
    }

    // Generate all weeks and fill with data or zeros
    const weeks: WeeklyStats[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < totalWeeks; i++) {
      const year = currentDate.getFullYear();
      const weekNum = getISOWeek(currentDate);
      const weekKey = `${year}W${weekNum}`;

      const data = dataMap.get(weekKey);
      weeks.push({
        week: weekKey,
        volume: data?.volume ?? 0,
        elevation: data?.elevation ?? 0,
        time: data?.time ?? 0,
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  }
}
