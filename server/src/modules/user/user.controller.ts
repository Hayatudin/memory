import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service.js";

export class UserController {
  /**
   * Returns authenticated user info, session details, and user profile.
   */
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const session = req.session!;
      const profile = await UserService.getOrCreateProfile(user.id, user.name);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          session: {
            id: session.id,
            expiresAt: session.expiresAt,
            userAgent: session.userAgent,
          },
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
