import express from "express";
import authmiddleware from "../middlewares/auth.middleware.js";
import accountController from "../controllers/account.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router=express.Router();
router.post("/",authmiddleware.authMiddleware,accountController.createAccount);
router.get("/",authMiddleware.authMiddleware,accountController.getUserControllerAccount);
router.get("balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalance);
export default router;