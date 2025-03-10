import mongoose from "mongoose";

export interface ITransaction extends mongoose.Document {
  type: "income" | "expense";
  amount: number;
  date: Date;
}

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
});

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
