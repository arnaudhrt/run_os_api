import { GarminData } from "./garmin.data";
import { GarminAccountModel, GarminActivity } from "./garmin.model";
import { ActivityData } from "@/v1/activities/activity.data";
import { convertGarminActivities } from "./garmin.utils";

export interface SyncResult {
  fetched: number;
  saved: number;
}

export interface SyncOptions {
  startDate?: Date;
  endDate?: Date;
}

export interface ConnectResult {
  success: boolean;
  accountId: string;
}

export class GarminService {
  /**
   * Connect a Garmin account for a user
   */
  public static async connectAccount(
    userId: string,
    email: string,
    password: string
  ): Promise<ConnectResult> {
    // Login to Garmin Connect
    const client = await GarminData.createGarminClient(email, password);

    // Export tokens for storage
    const tokens = GarminData.exportTokens(client);

    // Encrypt password before storing
    const encryptedPassword = GarminData.encryptPassword(password);

    // Store account in database
    const accountId = await GarminData.createGarminAccount({
      user_id: userId,
      garmin_email: email,
      garmin_password_encrypted: encryptedPassword,
      oauth1_token: tokens?.oauth1,
      oauth2_token: tokens?.oauth2,
    });

    return { success: true, accountId };
  }

  /**
   * Sync activities from Garmin for a user
   */
  public static async syncActivities(userId: string, account: GarminAccountModel, options: SyncOptions = {}): Promise<SyncResult> {
    // Create authenticated client
    const client = await GarminData.createClientFromAccount(account);

    // Fetch activities from Garmin
    // If date range provided, use it; otherwise fall back to last_sync_at
    let garminActivities: GarminActivity[];
    if (options.startDate || options.endDate) {
      garminActivities = await GarminData.fetchAllActivities(client, options.startDate, options.endDate);
    } else {
      const syncDate = account.last_sync_at ? new Date(account.last_sync_at) : undefined;
      garminActivities = await GarminData.fetchAllActivities(client, syncDate);
    }

    // Convert to our format
    const convertedActivities = convertGarminActivities(garminActivities, userId);

    // Save activities to database
    let savedCount = 0;
    if (convertedActivities.length > 0) {
      const ids = await ActivityData.createBulk(convertedActivities);
      savedCount = ids.length;
    }

    // Update tokens and last_sync_at
    const newTokens = GarminData.exportTokens(client);
    await GarminData.updateGarminAccount(userId, {
      oauth1_token: newTokens?.oauth1,
      oauth2_token: newTokens?.oauth2,
      last_sync_at: new Date().toISOString(),
    });

    return {
      fetched: garminActivities.length,
      saved: savedCount,
    };
  }

  /**
   * Filter activities by date (for testing/reuse)
   */
  public static filterActivitiesByDate(activities: GarminActivity[], afterDate: Date): GarminActivity[] {
    return activities.filter((a) => new Date(a.startTimeGMT) > afterDate);
  }
}
