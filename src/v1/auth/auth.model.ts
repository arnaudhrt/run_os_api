export interface UserModel {
  id: string;
  first_name: string;
  last_name: string;

  email: string;
  firebase_uid: string;
  garmin_user_id?: string;
  strava_athlete_id?: number;
  created_at: string;
  updated_at: string;
}

export type CreateUserModel = Omit<UserModel, "id" | "created_at" | "updated_at">;
