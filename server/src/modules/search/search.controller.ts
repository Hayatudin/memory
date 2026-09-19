import { Request, Response } from "express";
import { MemoriesService } from "../memories/memories.service.js";

export class SearchController {
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const q = (req.query.q as string) || "";
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const data = await MemoriesService.list(userId, {
        search: q,
        page,
        limit,
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
