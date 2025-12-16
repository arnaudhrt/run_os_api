import { db } from "@/shared/database/database";
import { CreateUserModel, UserModel } from "./auth.model";

export class AuthData {
  public static async getUserById(uid: string): Promise<UserModel | null> {
    const result = await db.query("SELECT * FROM users WHERE firebase_uid = $1", [uid]);
    return result.rows[0] || null;
  }

  public static async registerUser(data: CreateUserModel): Promise<void> {
    const { first_name, last_name, email, firebase_uid } = data;

    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, firebase_uid)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
      [first_name, last_name, email, firebase_uid]
    );
  }
}
