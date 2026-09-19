import { Request, Response } from "express";
import { MemoriesService } from "./memories.service.js";

export class MemoriesController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { categoryId, type, isFavorite, isArchived, search, page, limit } = req.query;

      const data = await MemoriesService.list(userId, {
        categoryId: categoryId as string,
        type: type as any,
        isFavorite: isFavorite !== undefined ? isFavorite === "true" : undefined,
        isArchived: isArchived !== undefined ? isArchived === "true" : undefined,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const data = await MemoriesService.getById(userId, id);
      if (!data) {
        res.status(404).json({ success: false, error: { message: "Memory not found" } });
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
      const { title, content, type, categoryId, sourceUrl, mediaUrl, mediaMetadata, isFavorite, metadata } = req.body;

      if (!title || typeof title !== "string") {
        res.status(400).json({
          success: false,
          error: { message: "Memory title is required" },
        });
        return;
      }

      const data = await MemoriesService.create(userId, {
        title,
        content,
        type,
        categoryId,
        sourceUrl,
        mediaUrl,
        mediaMetadata,
        isFavorite,
        metadata,
      });

      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const data = await MemoriesService.update(userId, id, req.body);
      if (!data) {
        res.status(404).json({ success: false, error: { message: "Memory not found" } });
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
      const deleted = await MemoriesService.delete(userId, id);
      if (!deleted) {
        res.status(404).json({ success: false, error: { message: "Memory not found" } });
        return;
      }
      res.json({ success: true, data: { id, deleted: true } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async getLinkPreview(req: Request, res: Response): Promise<void> {
    try {
      const rawUrl = req.query.url as string;
      if (!rawUrl || typeof rawUrl !== "string") {
        res.status(400).json({
          success: false,
          error: { message: "URL query parameter is required" },
        });
        return;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
      } catch {
        res.status(400).json({
          success: false,
          error: { message: "Invalid URL format" },
        });
        return;
      }

      const cleanUrl = parsedUrl.href;
      const hostname = parsedUrl.hostname.replace(/^www\./, "");

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(cleanUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          res.json({
            success: true,
            data: {
              url: cleanUrl,
              title: hostname,
              description: "",
              image: null,
              siteName: hostname,
            },
          });
          return;
        }

        const html = await response.text();

        // Helper to extract metadata
        const getMeta = (names: string[]): string | null => {
          for (const name of names) {
            const regex1 = new RegExp(
              `<meta[^>]+(?:property|name)=["'](?:og:)?${name}["'][^>]+content=["']([^"']+)["']`,
              "i"
            );
            const m1 = html.match(regex1);
            if (m1 && m1[1]) return m1[1].trim();

            const regex2 = new RegExp(
              `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:)?${name}["']`,
              "i"
            );
            const m2 = html.match(regex2);
            if (m2 && m2[1]) return m2[1].trim();
          }
          return null;
        };

        const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const titleTag = titleTagMatch ? titleTagMatch[1].trim() : null;

        const title = getMeta(["title", "og:title", "twitter:title"]) || titleTag || hostname;
        const description =
          getMeta(["description", "og:description", "twitter:description"]) || "";
        const iconMatch = html.match(/<link[^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i);
        let image =
          getMeta(["image", "og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]) ||
          iconMatch?.[1] ||
          null;

        if (image && !image.startsWith("http")) {
          try {
            image = new URL(image, cleanUrl).href;
          } catch {
            image = null;
          }
        }

        if (!image) {
          image = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(cleanUrl)}&size=128`;
        }

        const siteName =
          getMeta(["site_name", "og:site_name"]) || hostname;

        res.json({
          success: true,
          data: {
            url: cleanUrl,
            title,
            description,
            image,
            siteName,
          },
        });
      } catch {
        // Network timeout / bot-protection fallback
        res.json({
          success: true,
          data: {
            url: cleanUrl,
            title: hostname,
            description: "",
            image: null,
            siteName: hostname,
          },
        });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
