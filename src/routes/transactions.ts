import * as express from "express";
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

router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/balance", getBalance);
router.get("/search", searchTransactions);
router.delete("/:id", deleteTransaction);
router.get("/export", exportExcel);
router.get("/summary", getSummary);

export default router;
