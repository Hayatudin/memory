import { Router } from "express";
import { MemoriesController } from "./memories.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", MemoriesController.list);
router.post("/", MemoriesController.create);
router.get("/link-preview", MemoriesController.getLinkPreview);
router.get("/:id", MemoriesController.getById);
router.put("/:id", MemoriesController.update);
router.delete("/:id", MemoriesController.delete);

export const memoriesRouter = router;
