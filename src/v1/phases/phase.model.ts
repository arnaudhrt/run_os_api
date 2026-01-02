import { PhaseType } from "@/shared/models/types";

export interface PhaseModel {
  id: string;
  cycle_id: string;
  phase_type: PhaseType;
  order: number;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export type CreatePhaseModel = Omit<PhaseModel, "id" | "created_at" | "updated_at">;

export type UpdatePhaseModel = Partial<Omit<PhaseModel, "id" | "cycle_id" | "created_at" | "updated_at">>;
