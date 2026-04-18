import express from "express";
import authController from "../controllers/auth.controller.js";
const router=express.Router();
router.post("/register",authController.registerUser);
router.post("/login",authController.loginUser);
router.post("/logout",authController.logoutUser);
export default router;