import { PhaseType } from "@/shared/models/types";

export interface PhaseModel {
  id: string;
  user_id: string;
  race_id?: string;
  phase_type: PhaseType;
  start_date: string;
  end_date: string;
  description?: string;
  weekly_volume_target_km?: number;
  weekly_elevation_target_m?: number;
  created_at: string;
  updated_at: string;
}

export type CreatePhaseModel = Omit<PhaseModel, "id" | "created_at" | "updated_at">;

export type UpdatePhaseModel = Partial<Omit<PhaseModel, "id" | "created_at" | "updated_at">>;
