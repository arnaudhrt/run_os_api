import { PhaseType } from "@/shared/models/types";

export interface TrainingCycleModel {
  id: string;
  user_id: string;
  race_id?: string;
  name: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
  created_at: string;
}

export interface PhaseInput {
  phase_type: PhaseType;
  duration_weeks: number;
}

export interface CreateTrainingCycleInput {
  user_id: string;
  race_id?: string;
  name: string;
  start_date?: string; // Optional if race_id provided (will use race date as end)
  end_date?: string; // Optional if race_id provided
  phases: PhaseInput[];
}

export interface UpdateTrainingCycleInput {
  name: string;
}
