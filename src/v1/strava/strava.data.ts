import { db } from "@/shared/database/database";
import { env } from "@/shared/config/global.config";
import {
  StravaAccountModel,
  CreateStravaAccountModel,
  UpdateStravaAccountModel,
  StravaTokenResponse,
  StravaTokenUpdate,
  StravaActivity,
} from "./strava.model";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_OAUTH_URL = "https://www.strava.com/oauth/token";

export class StravaData {

  public static async getStravaAccountByUserId(userId: string): Promise<StravaAccountModel | null> {
    const result = await db.query("SELECT * FROM strava_accounts WHERE user_id = $1", [userId]);
    return result.rows[0] || null;
  }

  public static async getStravaAccountByAthleteId(athleteId: number): Promise<StravaAccountModel | null> {
    const result = await db.query("SELECT * FROM strava_accounts WHERE strava_athlete_id = $1", [athleteId]);
    return result.rows[0] || null;
  }

  public static async createStravaAccount(data: CreateStravaAccountModel): Promise<string> {
    const { user_id, strava_athlete_id, access_token, refresh_token, expires_at, scope } = data;

    const result = await db.query(
      `INSERT INTO strava_accounts (user_id, strava_athlete_id, access_token, refresh_token, expires_at, scope)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         strava_athlete_id = EXCLUDED.strava_athlete_id,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expires_at = EXCLUDED.expires_at,
         scope = EXCLUDED.scope,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [user_id, strava_athlete_id, access_token, refresh_token, expires_at, scope || null]
    );

    return result.rows[0].id;
  }

  public static async updateStravaAccount(userId: string, data: UpdateStravaAccountModel): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, keyof UpdateStravaAccountModel> = {
      access_token: "access_token",
      refresh_token: "refresh_token",
      expires_at: "expires_at",
      scope: "scope",
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

    await db.query(`UPDATE strava_accounts SET ${fields.join(", ")} WHERE user_id = $${paramIndex}`, values);
  }

  public static async deleteStravaAccount(userId: string): Promise<void> {
    await db.query("DELETE FROM strava_accounts WHERE user_id = $1", [userId]);
  }

  public static async exchangeCodeForTokens(code: string): Promise<StravaTokenResponse> {
    const response = await fetch(STRAVA_OAUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorDetails = error.errors ? JSON.stringify(error.errors) : "";
      throw new Error(`Strava OAuth error: ${error.message || "Failed to exchange code"}${errorDetails ? ` - ${errorDetails}` : ""}`);
    }

    return response.json();
  }

  public static async refreshAccessToken(refreshToken: string): Promise<StravaTokenUpdate> {
    const response = await fetch(STRAVA_OAUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to refresh access token");
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
  }

  public static async revokeAccess(accessToken: string): Promise<void> {
    const response = await fetch(`https://www.strava.com/oauth/deauthorize?access_token=${accessToken}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to revoke Strava access");
    }
  }

  public static async fetchActivities(
    accessToken: string,
    options: {
      page?: number;
      perPage?: number;
      after?: number;
      before?: number;
    } = {}
  ): Promise<StravaActivity[]> {
    const { page = 1, perPage = 100, after, before } = options;

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    if (after) params.append("after", String(after));
    if (before) params.append("before", String(before));

    const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch activities");
    }

    return response.json();
  }

  public static async fetchAllActivities(accessToken: string, after?: number): Promise<StravaActivity[]> {
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const activities = await this.fetchActivities(accessToken, {
        page,
        perPage,
        after,
      });

      if (activities.length === 0) break;

      allActivities.push(...activities);

      if (activities.length < perPage) break;

      page++;
    }

    return allActivities;
  }

  public static async getValidAccessToken(account: StravaAccountModel): Promise<string> {
    const now = new Date();
    const expiresAt = new Date(account.expires_at);

    // If token is still valid (with 5 min buffer), return it
    if (expiresAt.getTime() - 5 * 60 * 1000 > now.getTime()) {
      return account.access_token;
    }

    // Token expired, refresh it
    const newTokens = await this.refreshAccessToken(account.refresh_token);

    // Update in database
    await this.updateStravaAccount(account.user_id, {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_at: new Date(newTokens.expires_at * 1000),
    });

    return newTokens.access_token;
  }
}
