import { PhaseType, RaceType } from "@/shared/models/types";

export interface RaceModel {
  id: string;
  user_id: string;
  name: string;
  race_date: string;
  distance_meters?: number;
  elevation_gain_meters?: number;
  target_time_seconds?: number;
  location?: string;
  race_type: RaceType;
  priority: 1 | 2 | 3;
  notes?: string;
  result_time_seconds?: number;
  result_place_overall?: number;
  result_place_gender?: number;
  result_place_category?: number;
  category_name?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateRaceModel = Omit<RaceModel, "id" | "is_completed" | "result_time_seconds" | "result_place_overall" | "result_place_gender" | "result_place_category" | "category_name" | "created_at" | "updated_at">;
export type UpdateRaceModel = Partial<Omit<RaceModel, "id" | "user_id" | "created_at" | "updated_at">>;
