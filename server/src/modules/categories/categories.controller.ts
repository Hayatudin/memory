import { Request, Response } from "express";
import { CategoriesService } from "./categories.service.js";

export class CategoriesController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await CategoriesService.listByUser(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const data = await CategoriesService.getById(userId, id);
      if (!data) {
        res.status(404).json({ success: false, error: { message: "Category not found" } });
        return;
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { name, icon, color, description } = req.body;
      if (!name || typeof name !== "string") {
        res.status(400).json({
          success: false,
          error: { message: "Category name is required" },
        });
        return;
      }

      const data = await CategoriesService.create(userId, { name, icon, color, description });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      // Check duplicate category name error
      if (error.code === "ER_DUP_ENTRY") {
        res.status(409).json({
          success: false,
          error: { message: "A category with this name already exists" },
        });
        return;
      }
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const data = await CategoriesService.update(userId, id, req.body);
      if (!data) {
        res.status(404).json({ success: false, error: { message: "Category not found" } });
        return;
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const deleted = await CategoriesService.delete(userId, id);
      if (!deleted) {
        res.status(404).json({ success: false, error: { message: "Category not found" } });
        return;
      }
      res.json({ success: true, data: { id, deleted: true } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
