import { Router } from "express";
import { SearchController } from "./search.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", SearchController.search);

export const searchRouter = router;
