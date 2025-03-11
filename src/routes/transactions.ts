import * as express from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  addTransaction,
  getTransactions,
  getBalance,
  searchTransactions,
  deleteTransaction,
  getSummary,
} from "../controllers/transactionController";
import { exportExcel } from "../utils/exportExcel";

const router = express.Router();

// ✅ Middleware `authenticate` ถูกต้องแล้ว
router.post("/", authenticate, addTransaction);
router.get("/", authenticate, getTransactions);
router.get("/balance", authenticate, getBalance);
router.get("/search", authenticate, searchTransactions);
router.delete("/:id", authenticate, deleteTransaction);
router.get("/export", authenticate, exportExcel);
router.get("/summary", authenticate, getSummary);

export default router;
