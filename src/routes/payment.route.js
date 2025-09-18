import { Router } from "express";
import { processPayment, finalizePayment, uploadMiddleware } from "../controllers/payments.controller.js";

const router = Router();

router.post("/process-payment", uploadMiddleware, processPayment);
router.post("/finalize-payment", finalizePayment);

export default router;
