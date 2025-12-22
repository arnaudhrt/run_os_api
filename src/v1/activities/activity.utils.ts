import { ActivityModel, DayEntry, WeekEntry, MonthEntry, YearEntry, StructuredActivitiesLog } from "./activity.model";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
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

function createEmptyTotalsWithRaces() {
  return {
    ...createEmptyTotals(),
    races_count: 0,
  };
}

function addToTotals(totals: ReturnType<typeof createEmptyTotals> | ReturnType<typeof createEmptyTotalsWithRaces>, activity: ActivityModel) {
  totals.distance_meters += activity.distance_meters || 0;
  totals.duration_seconds += activity.duration_seconds || 0;
  totals.elevation_gain_meters += activity.elevation_gain_meters || 0;
  totals.activities_count += 1;

  if ("races_count" in totals && activity.workout_type === "race") {
    totals.races_count += 1;
  }
}

export function structureActivitiesLog(activities: ActivityModel[], minDate: string | null, maxDate: string | null): StructuredActivitiesLog {
  // If no activities, return empty structure
  if (!minDate || !maxDate || activities.length === 0) {
    return {
      years: [],
      totals: createEmptyTotals(),
    };
  }

  // Create a map of activities by date for quick lookup
  const activitiesByDate = new Map<string, ActivityModel>();
  for (const activity of activities) {
    const dateKey = new Date(activity.start_time).toISOString().split("T")[0];
    // If multiple activities on same day, keep the first one (they're sorted by start_time DESC)
    if (!activitiesByDate.has(dateKey)) {
      activitiesByDate.set(dateKey, activity);
    }
  }

  // Extend range to complete weeks
  const startDate = getWeekStart(new Date(minDate));
  const endDate = getWeekEnd(new Date(maxDate));

  // Build the structure using internal types
  const yearsMap = new Map<number, InternalYearEntry>();
  const globalTotals = createEmptyTotalsWithRaces();

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const weekNumber = getISOWeekNumber(currentDate);
    const dateStr = formatDate(currentDate);

    // Get or create year entry
    if (!yearsMap.has(year)) {
      yearsMap.set(year, {
        year,
        months: [],
        totals: createEmptyTotalsWithRaces(),
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
    const weekStart = getWeekStart(currentDate);
    const weekEnd = getWeekEnd(currentDate);
    const weekStartStr = formatDate(weekStart);
    let weekEntry = monthEntry.weeks.find((w) => w.startDate === weekStartStr);
    if (!weekEntry) {
      weekEntry = {
        weekNumber,
        startDate: weekStartStr,
        endDate: formatDate(weekEnd),
        days: [],
        totals: createEmptyTotals(),
      };
      monthEntry.weeks.push(weekEntry);
    }

    // Create day entry
    const activity = activitiesByDate.get(dateStr) || null;
    const dayEntry: DayEntry = {
      date: dateStr,
      dayOfWeek: currentDate.getDay(),
      isRestDay: activity === null,
      activity,
    };
    weekEntry.days.push(dayEntry);

    // Update totals if there's an activity
    if (activity) {
      addToTotals(weekEntry.totals as ReturnType<typeof createEmptyTotals>, activity);
      addToTotals(monthEntry.totals as ReturnType<typeof createEmptyTotals>, activity);
      addToTotals(yearEntry.totals, activity);
      addToTotals(globalTotals, activity);
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort and convert to final structure with null optimization
  const internalYears = Array.from(yearsMap.values()).sort((a, b) => b.year - a.year);

  const years: YearEntry[] = internalYears.map((yearEntry) => {
    yearEntry.months.sort((a, b) => b.month - a.month);

    const optimizedMonths: MonthEntry[] = yearEntry.months.map((monthEntry) => {
      monthEntry.weeks.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      const optimizedWeeks: WeekEntry[] = monthEntry.weeks.map((weekEntry) => {
        weekEntry.days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // If week has no activities, set days to null
        return {
          ...weekEntry,
          days: weekEntry.totals.activities_count === 0 ? null : weekEntry.days,
        };
      });

      // If all weeks in month are empty, set weeks to null
      const allWeeksEmpty = optimizedWeeks.every((w) => w.totals.activities_count === 0);
      return {
        ...monthEntry,
        weeks: allWeeksEmpty ? null : optimizedWeeks,
      };
    });

    // If all months in year are empty, set months to null
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
