import { CreateTrainingCycleInput, PhaseInput } from "./training-cycle.model";
import { TrainingCycleData } from "./training-cycle.data";

interface CalculatedPhase {
  phase_type: string;
  order: number;
  duration_weeks: number;
  start_date: string;
  end_date: string;
}

interface CalculatedCycle {
  user_id: string;
  race_id?: string;
  name: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
  phases: CalculatedPhase[];
}

export class TrainingCycleService {
  /**
   * Get the previous Monday from a given date
   */
  private static getPreviousMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    // If already Monday (1), keep it; if Sunday (0), go back 6 days; otherwise go back (day - 1) days
    if (day === 1) return d;
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    return d;
  }

  /**
   * Get the next Sunday from a given date
   */
  private static getNextSunday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    // If already Sunday (0), keep it; otherwise go forward (7 - day) days
    if (day === 0) return d;
    d.setDate(d.getDate() + (7 - day));
    return d;
  }

  /**
   * Format date as YYYY-MM-DD (local timezone)
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculate phases backwards from end date
   * Each phase starts on Monday and ends on Sunday
   */
  private static calculatePhases(phases: PhaseInput[], endDate: Date): CalculatedPhase[] {
    const calculatedPhases: CalculatedPhase[] = [];
    let phaseEndDate = new Date(endDate);

    for (let i = phases.length - 1; i >= 0; i--) {
      const phase = phases[i];
      const order = i + 1;

      const pEnd = new Date(phaseEndDate);
      const pStart = new Date(pEnd);
      pStart.setDate(pStart.getDate() - phase.duration_weeks * 7 + 1);

      calculatedPhases.unshift({
        phase_type: phase.phase_type,
        order,
        duration_weeks: phase.duration_weeks,
        start_date: this.formatDate(pStart),
        end_date: this.formatDate(pEnd),
      });

      // Next phase ends the day before this phase starts
      phaseEndDate = new Date(pStart);
      phaseEndDate.setDate(phaseEndDate.getDate() - 1);
    }

    return calculatedPhases;
  }

  /**
   * Build the complete cycle with calculated dates and phases
   */
  public static async buildCycle(data: CreateTrainingCycleInput): Promise<CalculatedCycle> {
    // Determine end date
    let endDate: Date;
    if (data.race_id) {
      const raceDate = await TrainingCycleData.getRaceDateById(data.race_id, data.user_id);
      if (!raceDate) {
        throw new Error("Race not found");
      }
      endDate = new Date(raceDate);
    } else if (data.end_date) {
      endDate = new Date(data.end_date);
    } else {
      throw new Error("Either race_id or end_date must be provided");
    }

    // Adjust end date to next Sunday if not already Sunday
    endDate = this.getNextSunday(endDate);

    // Calculate total weeks from phases
    const totalWeeks = data.phases.reduce((sum, phase) => sum + phase.duration_weeks, 0);

    // Calculate start date
    let startDate: Date;
    if (data.start_date) {
      startDate = new Date(data.start_date);
      startDate = this.getPreviousMonday(startDate);
    } else {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - totalWeeks * 7 + 1);
      startDate = this.getPreviousMonday(startDate);
    }

    // Calculate phases
    const calculatedPhases = this.calculatePhases(data.phases, endDate);

    return {
      user_id: data.user_id,
      race_id: data.race_id,
      name: data.name,
      start_date: this.formatDate(startDate),
      end_date: this.formatDate(endDate),
      total_weeks: totalWeeks,
      phases: calculatedPhases,
    };
  }

  /**
   * Create a training cycle with phases
   */
  public static async createTrainingCycle(data: CreateTrainingCycleInput): Promise<string> {
    const calculatedCycle = await this.buildCycle(data);
    return TrainingCycleData.createTrainingCycleWithPhases(calculatedCycle);
  }
}
