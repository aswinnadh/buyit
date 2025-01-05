import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: {
    type: Number,
  },
  color: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("cart", cartSchema);

export default Cart;
