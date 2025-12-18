import { Router } from "express";
import { testGetUsers } from "../controllers/auth.controller";

const router = Router();
router.get("/test-users", testGetUsers);

export default router;
