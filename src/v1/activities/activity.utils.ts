import { ActivityModel, DayEntry, WeekEntry, MonthEntry, YearEntry, StructuredActivitiesLog } from "./activity.model";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Fixes the Timezone Issue:
 * Converts a Date object to a YYYY-MM-DD string based on LOCAL time.
 */
function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Internal types with non-null arrays for building the structure
interface InternalWeekEntry extends Omit<WeekEntry, "days"> {
  days: DayEntry[];
}

interface InternalMonthEntry extends Omit<MonthEntry, "weeks"> {
  weeks: InternalWeekEntry[];
}

interface InternalYearEntry extends Omit<YearEntry, "months"> {
  months: InternalMonthEntry[];
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
  return new Date(d.setDate(diff));
}

function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

function createEmptyTotals() {
  return {
    distance_meters: 0,
    duration_seconds: 0,
    elevation_gain_meters: 0,
    activities_count: 0,
    races_count: 0,
  };
}

function addToTotals(totals: ReturnType<typeof createEmptyTotals>, activity: ActivityModel) {
  totals.distance_meters += activity.distance_meters || 0;
  totals.duration_seconds += activity.duration_seconds || 0;
  totals.elevation_gain_meters += activity.elevation_gain_meters || 0;
  totals.activities_count += 1;

  if (activity.workout_type === "race") {
    totals.races_count += 1;
  }
}

export function structureActivitiesLog(activities: ActivityModel[], minDate: string | null, maxDate: string | null): StructuredActivitiesLog {
  if (!minDate || !maxDate || activities.length === 0) {
    return {
      years: [],
      totals: createEmptyTotals(),
    };
  }

  // 1. Group activities by local date string
  const activitiesByDate = new Map<string, ActivityModel[]>();
  for (const activity of activities) {
    // We create the date from the timestamp, then format it to the user's local YYYY-MM-DD
    const dateKey = formatLocalDate(new Date(activity.start_time));
    const dayGroup = activitiesByDate.get(dateKey) || [];
    dayGroup.push(activity);
    activitiesByDate.set(dateKey, dayGroup);
  }

  const startDate = getWeekStart(new Date(minDate));
  const endDate = getWeekEnd(new Date(maxDate));

  const yearsMap = new Map<number, InternalYearEntry>();
  const globalTotals = createEmptyTotals();

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const weekNumber = getISOWeekNumber(currentDate);
    const dateStr = formatLocalDate(currentDate); // Align with map key

    // Get or create year entry
    if (!yearsMap.has(year)) {
      yearsMap.set(year, {
        year,
        months: [],
        totals: createEmptyTotals(),
      });
    }
    const yearEntry = yearsMap.get(year)!;

    // Get or create month entry
    let monthEntry = yearEntry.months.find((m) => m.month === month);
    if (!monthEntry) {
      monthEntry = {
        month,
        monthName: MONTH_NAMES[month - 1],
        weeks: [],
        totals: createEmptyTotals(),
      };
      yearEntry.months.push(monthEntry);
    }

    // Get or create week entry
    const weekStartStr = formatLocalDate(getWeekStart(currentDate));
    let weekEntry = monthEntry.weeks.find((w) => w.startDate === weekStartStr);
    if (!weekEntry) {
      weekEntry = {
        weekNumber,
        startDate: weekStartStr,
        endDate: formatLocalDate(getWeekEnd(currentDate)),
        days: [],
        totals: createEmptyTotals(),
      };
      monthEntry.weeks.push(weekEntry);
    }

    // 2. Create day entry with multi-activity support
    const dayActivities = activitiesByDate.get(dateStr) || [];

    // We consider it a rest day only if there are NO activities
    const dayEntry: DayEntry = {
      date: dateStr,
      dayOfWeek: currentDate.getDay(),
      isRestDay: dayActivities.length === 0,
      activities: dayActivities, // Changed from 'activity' to 'activities'
    };
    weekEntry.days.push(dayEntry);

    // 3. Update totals for all activities on this day
    for (const activity of dayActivities) {
      addToTotals(weekEntry.totals as ReturnType<typeof createEmptyTotals>, activity);
      addToTotals(monthEntry.totals as ReturnType<typeof createEmptyTotals>, activity); // Same as week
      addToTotals(yearEntry.totals, activity);
      addToTotals(globalTotals, activity);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Final Cleanup: Sort and Null-Optimization
  const internalYears = Array.from(yearsMap.values()).sort((a, b) => b.year - a.year);

  const years: YearEntry[] = internalYears.map((yearEntry) => {
    yearEntry.months.sort((a, b) => b.month - a.month);

    const optimizedMonths: MonthEntry[] = yearEntry.months.map((monthEntry) => {
      monthEntry.weeks.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      const optimizedWeeks: WeekEntry[] = monthEntry.weeks.map((weekEntry) => {
        weekEntry.days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          ...weekEntry,
          days: weekEntry.totals.activities_count === 0 ? null : weekEntry.days,
        };
      });

      const allWeeksEmpty = optimizedWeeks.every((w) => w.totals.activities_count === 0);
      return {
        ...monthEntry,
        weeks: allWeeksEmpty ? null : optimizedWeeks,
      };
    });

    const allMonthsEmpty = optimizedMonths.every((m) => m.totals.activities_count === 0);
    return {
      ...yearEntry,
      months: allMonthsEmpty ? null : optimizedMonths,
    };
  });

  return {
    years,
    totals: globalTotals,
  };
}
