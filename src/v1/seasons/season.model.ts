import { PhaseType, RaceType } from "@/shared/models/types";

export interface SeasonModel {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface RaceModel {
  id: string;
  season_id: string;
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
  result_place?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhaseModel {
  id: string;
  race_id: string;
  phase_type: PhaseType;
  start_date: string;
  end_date: string;
  description?: string;
  weekly_volume_target_km?: number;
  weekly_elevation_target_m?: number;
  created_at: string;
  updated_at: string;
}

export type CreateSeasonModel = Omit<SeasonModel, "id" | "user_id" | "created_at" | "updated_at">;
export type CreateSeasonWithUserModel = Omit<SeasonModel, "id" | "created_at" | "updated_at">;
export type CreateRaceModel = Omit<RaceModel, "id" | "is_completed" | "result_time_seconds" | "result_place" | "created_at" | "updated_at">;
export type CreatePhaseModel = Omit<PhaseModel, "id" | "created_at" | "updated_at">;

export type UpdateSeasonModel = Partial<Omit<SeasonModel, "id" | "user_id" | "created_at" | "updated_at">>;
export type UpdateRaceModel = Partial<Omit<RaceModel, "id" | "season_id" | "created_at" | "updated_at">>;
export type UpdatePhaseModel = Partial<Omit<PhaseModel, "id" | "race_id" | "created_at" | "updated_at">>;

export interface RaceWithPhasesModel extends RaceModel {
  phases: PhaseModel[];
}

export interface SeasonWithRacesModel extends SeasonModel {
  races: RaceWithPhasesModel[];
}
