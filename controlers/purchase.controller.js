import Cart from "../models/cart.model.js";
import Purchase from "../models/purchase.model.js";
import Wallet from "../models/wallet.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";

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
      return res.status(400).json({ error: "Missing required fields" });
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

      // Generate a new coupon with a random amount between 100 and 1000
      const randomAmount = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
      const newCoupon = new Coupon({
        user: userId,
        amount: randomAmount,
      });
      await newCoupon.save();
      req.flash("success", `you revieved a coupon of ₹ ${randomAmount}`);
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
      req.flash("error", "Missing required fields");
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

      // Generate a new coupon with a random amount between 100 and 1000
      const randomAmount = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
      const newCoupon = new Coupon({
        user: userId,
        amount: randomAmount,
      });
      await newCoupon.save();
      req.flash("success", `you revieved a coupon of ₹ ${randomAmount}`);
    }

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
