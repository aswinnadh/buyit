import dotenv from "dotenv";
import Razorpay from "razorpay";
import mongoose from 'mongoose';
import crypto from 'crypto';

import Cart from "../models/cart.model.js";
import Purchase from "../models/purchase.model.js";
import Wallet from "../models/wallet.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import { methods, states, status } from "../utils/constants.js";

dotenv.config();

export const handlePurchase = async (req, res, next) => {
  try {
    const {
      userId,
      username,
      phone,
      address,
      district,
      state,
      pincode,
      items,
      couponId,
      amountToPay,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !username ||
      !phone ||
      !address ||
      !district ||
      !state ||
      !pincode ||
      !items ||
      !amountToPay ||
      !paymentMethod
    ) {
      req.flash("error", "Fields not be empty");
    }

    // Create new purchase object
    const newPurchase = new Purchase({
      user: userId,
      username,
      phone,
      address,
      district,
      state,
      pincode,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        colour: item.color,
      })),
      coupon: couponId,
      amount: parseFloat(amountToPay),
      method: paymentMethod,
      status: "PLACED",
      createdAt: Date.now(),
    });

    // Save purchase to the database
    await newPurchase.save();

    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    // Delete applied coupon if provided
    if (couponId) {
      await Coupon.deleteOne({ _id: couponId, user: userId });
    }

    // Remove purchased items from the cart
    await Cart.deleteMany({
      user: userId,
      item: { $in: items.map((item) => item.productId) },
    });

    // Respond with success message
    req.flash("success", "Purchase completed successfully");
    res.redirect("/user/cart");
  } catch (error) {
    console.error("Error processing purchase:", error);
    next(error);
  }
};

export const handlePurchaseWallet = async (req, res, next) => {
  try {
    const {
      userId,
      username,
      phone,
      address,
      district,
      state,
      pincode,
      items,
      couponId,
      amountToPay,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !username ||
      !phone ||
      !address ||
      !district ||
      !state ||
      !pincode ||
      !items ||
      !amountToPay ||
      !paymentMethod
    ) {
      req.flash("info", "Missing required fields");
      return res.redirect("back");
    }

    // Fetch user's wallet
    const wallet = await Wallet.findOne({ user: userId }).exec();
    if (!wallet) {
      req.flash("error", "User wallet not found");
      return res.redirect("back");
    }

    // Check if wallet balance is sufficient
    if (wallet.amount < amountToPay) {
      req.flash("info", "Insufficient wallet balance");
      return res.redirect("back");
    }

    // Deduct amount from wallet
    wallet.amount -= parseFloat(amountToPay);
    await wallet.save();

    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
    // Create new purchase object
    const newPurchase = new Purchase({
      user: userId,
      username,
      phone,
      address,
      district,
      state,
      pincode,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        colour: item.color,
      })),
      coupon: couponId,
      amount: parseFloat(amountToPay),
      method: paymentMethod,
      status: "PLACED",
      createdAt: Date.now(),
    });

    // Save purchase to the database
    await newPurchase.save();

    // Delete applied coupon if provided
    if (couponId) {
      await Coupon.deleteOne({ _id: couponId, user: userId });
    }
    // Generate a new coupon with a random amount between 100 and 1000
    const randomAmount = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    const newCoupon = new Coupon({
      user: userId,
      amount: randomAmount,
    });
    await newCoupon.save();
    req.flash("success", `you revieved a coupon of ₹ ${randomAmount}`);

    // Remove purchased items from the cart
    await Cart.deleteMany({
      user: userId,
      item: { $in: items.map((item) => item.productId) },
    });

    // Respond with success message
    req.flash(
      "success",
      "Purchase completed successfully and amount deducted from wallet"
    );
    res.redirect("/user/cart");
  } catch (error) {
    console.error("Error processing purchase:", error);
    next(error); // Pass error to the error handler middleware
  }
};


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const handlePurchaseRazer = async (req, res, next) => {
  try {
    const { amountToPay, userId, username, phone, address, district, state, pincode, items } = req.body;
    const amount = amountToPay * 100; // Convert amount to paise

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      userId,
      username,
      phone,
      address,
      district,
      state,
      pincode,
      items,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    next(error);
  }
};



export const verifyPayment = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    userId,
    username,
    phone,
    address,
    district,
    state,
    pincode,
    items,
    amountToPay,
    couponId, // Capture the couponId if provided
  } = req.body;

  // Generate signature for verification
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    try {
      // Create a new purchase document
      const newPurchase = new Purchase({
        user: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
        username,
        phone,
        address,
        district,
        state,
        pincode,
        items: items.map((item) => ({
          productId: new mongoose.Types.ObjectId(item.productId), // Convert productId to ObjectId
          quantity: parseInt(item.quantity, 10), // Ensure quantity is an integer
          colour: item.color, // Match schema
        })),
        coupon: couponId, // Include couponId
        amount: parseFloat(amountToPay), // Convert amount to a number
        method: methods.upi,
        status: status.placed,
      });

      // Save the purchase
      await newPurchase.save();

      // Update stock for purchased items
      for (const item of items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }

      // Delete the applied coupon if provided
      if (couponId) {
        await Coupon.deleteOne({ _id: couponId, user: userId });
      }

      // Remove purchased items from the user's cart
      await Cart.deleteMany({
        user: userId,
        item: { $in: items.map((item) => item.productId) },
      });

      console.log("Purchase saved successfully:", newPurchase);
      req.flash("success", "Order placed successfully");
      res.redirect("/user/cart");
    } catch (error) {
      console.error("Error saving purchase details:", error.message);
      req.flash("error", "Failed to save purchase details");
      res.redirect("/user/cart");
    }
  } else {
    console.error("Payment verification failed");
    req.flash("error", "Payment verification failed");
    res.redirect("/user/cart");
  }
};
