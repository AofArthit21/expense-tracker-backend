import mongoose from "mongoose";

export interface ITransaction extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: "income" | "expense";
  amount: number;
  date: Date;
}

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
});

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
