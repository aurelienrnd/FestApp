import { Router } from "express";
import { testGetUsers, createUser } from "../controllers/auth.controller";

const router = Router();
router.post("/user", createUser); //NOTE cette routes est creer pour tester et cera deplacer plus tard
router.get("/test-users", testGetUsers); //NOTE cette route est juste pour tester la connexion a la base de donnée, a supprimer plus tard
export default router;
