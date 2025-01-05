import mongoose from "mongoose";
import { methods, status } from "../utils/constants.js";

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: { type: Number, required: true },
      colour: { type: String, required: true },
    },
  ],
  coupon: { type: String },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: [methods.wallet, methods.upi, methods.cod],
  },
  status: {
    type: String,
    enum: [status.placed, status.canceled, status.deliverd],
    default: status.placed,
  },
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Purchase = mongoose.model("purchase", purchaseSchema);

export default Purchase;
