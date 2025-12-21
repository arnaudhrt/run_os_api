import { db } from "@/shared/database/database";
import { GarminConnect } from "garmin-connect";
import { encrypt, decrypt } from "@/shared/utils/crypto";
import {
  GarminAccountModel,
  CreateGarminAccountModel,
  UpdateGarminAccountModel,
  GarminActivity,
} from "./garmin.model";

export class GarminData {
  /**
   * Encrypt password before storing
   */
  public static encryptPassword(password: string): string {
    return encrypt(password);
  }

  /**
   * Decrypt password for use with Garmin API
   */
  public static decryptPassword(encryptedPassword: string): string {
    return decrypt(encryptedPassword);
  }

  public static async getGarminAccountByUserId(userId: string): Promise<GarminAccountModel | null> {
    const result = await db.query("SELECT * FROM garmin_accounts WHERE user_id = $1", [userId]);
    return result.rows[0] || null;
  }

  public static async createGarminAccount(data: CreateGarminAccountModel): Promise<string> {
    const { user_id, garmin_email, garmin_password_encrypted, oauth1_token, oauth2_token } = data;

    const result = await db.query(
      `INSERT INTO garmin_accounts (user_id, garmin_email, garmin_password_encrypted, oauth1_token, oauth2_token)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         garmin_email = EXCLUDED.garmin_email,
         garmin_password_encrypted = EXCLUDED.garmin_password_encrypted,
         oauth1_token = EXCLUDED.oauth1_token,
         oauth2_token = EXCLUDED.oauth2_token,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [user_id, garmin_email, garmin_password_encrypted, oauth1_token || null, oauth2_token || null]
    );

    return result.rows[0].id;
  }

  public static async updateGarminAccount(userId: string, data: UpdateGarminAccountModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdateGarminAccountModel> = {
      garmin_email: "garmin_email",
      garmin_password_encrypted: "garmin_password_encrypted",
      oauth1_token: "oauth1_token",
      oauth2_token: "oauth2_token",
      last_sync_at: "last_sync_at",
    };

    for (const [dbField, dataKey] of Object.entries(fieldMap)) {
      if (data[dataKey] !== undefined) {
        fields.push(`${dbField} = $${paramIndex++}`);
        values.push(data[dataKey]);
      }
    }

    if (fields.length === 0) return;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    await db.query(`UPDATE garmin_accounts SET ${fields.join(", ")} WHERE user_id = $${paramIndex}`, values);
  }

  public static async deleteGarminAccount(userId: string): Promise<void> {
    await db.query("DELETE FROM garmin_accounts WHERE user_id = $1", [userId]);
  }

  /**
   * Create an authenticated Garmin client
   */
  public static async createGarminClient(email: string, password: string): Promise<GarminConnect> {
    const client = new GarminConnect({
      username: email,
      password: password,
    });

    await client.login();
    return client;
  }

  /**
   * Create client from stored account (using saved tokens if available)
   */
  public static async createClientFromAccount(account: GarminAccountModel): Promise<GarminConnect> {
    const decryptedPassword = this.decryptPassword(account.garmin_password_encrypted);

    const client = new GarminConnect({
      username: account.garmin_email,
      password: decryptedPassword,
    });

    // If we have stored tokens, try to use them
    if (account.oauth1_token && account.oauth2_token) {
      try {
        client.loadToken(
          account.oauth1_token as Parameters<typeof client.loadToken>[0],
          account.oauth2_token as Parameters<typeof client.loadToken>[1]
        );
      } catch {
        // If token loading fails, fall back to regular login
        await client.login();
      }
    } else {
      await client.login();
    }

    return client;
  }

  /**
   * Fetch activities from Garmin
   */
  public static async fetchActivities(
    client: GarminConnect,
    options: {
      start?: number;
      limit?: number;
    } = {}
  ): Promise<GarminActivity[]> {
    const { start = 0, limit = 100 } = options;
    const activities = await client.getActivities(start, limit);
    return activities as unknown as GarminActivity[];
  }

  /**
   * Fetch all activities (paginated)
   */
  public static async fetchAllActivities(
    client: GarminConnect,
    afterDate?: Date
  ): Promise<GarminActivity[]> {
    const allActivities: GarminActivity[] = [];
    let start = 0;
    const limit = 100;

    while (true) {
      const activities = await this.fetchActivities(client, { start, limit });

      if (activities.length === 0) break;

      // Filter by date if provided
      const filteredActivities = afterDate
        ? activities.filter((a) => new Date(a.startTimeGMT) > afterDate)
        : activities;

      allActivities.push(...filteredActivities);

      // If we got less than limit or all activities are before the afterDate, we're done
      if (activities.length < limit) break;

      // If the oldest activity in this batch is before afterDate, we can stop
      if (afterDate) {
        const oldestActivity = activities[activities.length - 1];
        if (new Date(oldestActivity.startTimeGMT) <= afterDate) break;
      }

      start += limit;
    }

    return allActivities;
  }

  /**
   * Export OAuth tokens from client for storage
   */
  public static exportTokens(client: GarminConnect): { oauth1: object; oauth2: object } | null {
    try {
      const tokens = client.exportToken();
      return {
        oauth1: tokens.oauth1,
        oauth2: tokens.oauth2,
      };
    } catch {
      return null;
    }
  }
}
