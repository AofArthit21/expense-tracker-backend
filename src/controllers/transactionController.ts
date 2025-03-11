import { Request, Response } from "express";
import Transaction, { ITransaction } from "../models/Transaction";
import { AuthRequest } from "../types"; // ต้องสร้าง type ของ req.user
import { RequestHandler } from "express";
// เพิ่มรายการ
export const addTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, date } = req.body;
    const userId = req.user?.userId; // ดึง userId จาก JWT

    const newTransaction = new Transaction({
      type,
      amount,
      date: date ? new Date(date) : new Date(),
      userId, // ผูกกับ user
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// แสดงรายการของ user
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const transactions = await Transaction.find({ userId });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// คำนวณยอดคงเหลือของ user
export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const transactions = await Transaction.find({ userId });

    const balance = transactions.reduce((acc, transaction) => {
      return transaction.type === "income"
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);

    res.json({ balance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ค้นหารายการของ user ตามวันที่หรือประเภท
export const searchTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type, date } = req.query;
    const userId = req.user?.userId;
    const filter: any = { userId };

    if (type) filter.type = type;
    if (date) filter.date = new Date(date as string);

    const transactions = await Transaction.find(filter);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTransaction: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.userId; // Type cast req เป็น AuthRequest
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    });

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// สรุปรายรับรายจ่ายของ user
export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { date, month, year } = req.query;
    const userId = req.user?.userId;
    const filter: any = { userId };

    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    } else if (month && year) {
      const start = new Date(`${year}-${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    } else if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter);

    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          acc.totalExpense += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
