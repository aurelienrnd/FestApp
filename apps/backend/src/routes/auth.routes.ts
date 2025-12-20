import { Router } from "express";
import { testGetUsers, createUser } from "../controllers/auth.controller";

const router = Router();
router.get("/test-users", testGetUsers);
router.post("/user", createUser);
export default router;
