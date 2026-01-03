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
  order: number;
}

export interface CreateTrainingCycleInput {
  user_id?: string;
  race_id?: string;
  name: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
}

export interface UpdateTrainingCycleInput {
  name: string;
}
