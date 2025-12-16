import express from "express";
import { AuthController } from "./auth.controller";
import { verifyRegisterFields, verifyToken } from "./auth.middleware";

const router = express.Router();

router.get("/user", verifyToken, AuthController.getUser);

router.post("/register", verifyRegisterFields, AuthController.registerUser);

export default router;
