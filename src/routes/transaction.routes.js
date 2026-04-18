import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import transactionController from "../controllers/transaction.controller.js";
const router=express.Router();
router.post("/",authMiddleware.authMiddleware,transactionController.createTransaction)
router.post("system//initial-funds",authMiddleware.authSystemMiddleware,transactionController.createInitialFundsTransaction)

export default router;