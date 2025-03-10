import { Request, Response } from "express";
import Transaction, { ITransaction } from "../models/Transaction";

// เพิ่มรายการ
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { type, amount, date } = req.body;
    const newTransaction = new Transaction({
      type,
      amount,
      date: date ? new Date(date) : new Date(), // ถ้าไม่มี date ให้ใช้วันเวลาปัจจุบัน
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// แสดงรายการทั้งหมด
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// คำนวณยอดคงเหลือ
export const getBalance = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find();
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

// ค้นหารายการตามวันที่หรือประเภท
export const searchTransactions = async (req: Request, res: Response) => {
  try {
    const { type, date } = req.query;
    const filter: any = {};
    if (type) filter.type = type;
    if (date) filter.date = new Date(date as string);

    const transactions = await Transaction.find(filter);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ลบรายการ
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { date, month, year } = req.query;
    const filter: any = {};

    if (date) {
      // กรองตามวัน (YYYY-MM-DD)
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    } else if (month && year) {
      // กรองตามเดือนและปี (YYYY-MM)
      const start = new Date(`${year}-${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    } else if (year) {
      // กรองตามปี (YYYY)
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter);

    // คำนวณยอดรวมรายรับและรายจ่าย
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
