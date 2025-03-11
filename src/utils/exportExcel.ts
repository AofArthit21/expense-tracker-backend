// import { Request, Response } from "express";
// import Transaction from "../models/Transaction";
// import ExcelJS from "exceljs";

// export const exportExcel = async (_req: Request, res: Response) => {
//   try {
//     const transactions = await Transaction.find();

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Transactions");

//     worksheet.columns = [
//       { header: "Type", key: "type", width: 15 },
//       { header: "Amount", key: "amount", width: 15 },
//       { header: "Date", key: "date", width: 20 },
//     ];

//     transactions.forEach((t) => {
//       worksheet.addRow({
//         type: t.type,
//         amount: t.amount,
//         date: t.date.toISOString(),
//       });
//     });

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=transactions.xlsx"
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

import { RequestHandler } from "express";
import Transaction from "../models/Transaction";
import ExcelJS from "exceljs";
import { AuthRequest } from "../types";

export const exportExcel: RequestHandler<any, any, any, any> = async (
  req: AuthRequest,
  res,
  next
) => {
  try {
    const userId = req.user?.userId; // ตรวจสอบ userId จาก JWT
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const transactions = await Transaction.find({ userId });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    worksheet.columns = [
      { header: "Type", key: "type", width: 15 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 20 },
    ];

    transactions.forEach((t) => {
      worksheet.addRow({
        type: t.type,
        amount: t.amount,
        date: t.date.toISOString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
