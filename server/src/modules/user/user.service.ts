import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { profiles } from "../../db/schema/index.js";

export class UserService {
  /**
   * Retrieves or lazily creates a profile for an authenticated user.
   */
  static async getOrCreateProfile(userId: string, defaultName?: string) {
    const existing = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    if (existing) {
      return existing;
    }

    // Auto-create initial profile
    const profileId = randomUUID();
    await db.insert(profiles).values({
      id: profileId,
      userId,
      displayName: defaultName || null,
      preferences: {
        theme: "dark",
        defaultMemoryType: "text",
        notificationsEnabled: true,
      },
    });

    const [created] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId));

    return created;
  }
}
