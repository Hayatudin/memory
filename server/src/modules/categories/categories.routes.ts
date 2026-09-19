import { Router } from "express";
import { CategoriesController } from "./categories.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", CategoriesController.list);
router.post("/", CategoriesController.create);
router.get("/:id", CategoriesController.getById);
router.put("/:id", CategoriesController.update);
router.delete("/:id", CategoriesController.delete);

export const categoriesRouter = router;
