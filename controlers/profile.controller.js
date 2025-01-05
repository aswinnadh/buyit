import Coupon from "../models/coupon.model.js";
import Purchase from "../models/purchase.model.js";
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";

export const renderProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const wallet = await Wallet.findOne({ user: userId });
    const coupons = await Coupon.find({ user: userId });
    const orders = await Purchase.find({ user: userId }).populate('items.productId');

    res.render("profile", {
      user,
      wallet,
      coupons,
      orders, // Pass orders to the template
      isAdmin: req.user.role === 'admin'
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};




export const addCoupon = async (req, res, next) => {
  try {
    const { couponAmount, userId } = req.body;

    // Validate input
    if (!userId || !couponAmount) {
      req.flash("error", "User ID and Coupon Amount are required.");
      return res.redirect("back");
    }

    const amount = parseFloat(couponAmount);
    if (isNaN(amount) || amount <= 0) {
      req.flash("error", "Invalid coupon amount.");
      return res.redirect("back");
    }

    const newCoupon = new Coupon({ user: userId, amount });
    await newCoupon.save();

    req.flash("success", "Coupon added successfully.");
    res.redirect("back");
  } catch (error) {
    next(error);
  }
};

export const addToUserWallet = async (req, res, next) => {
  try {
    const { userId, walletAmount } = req.body;

    // Validate input
    if (!userId || !walletAmount) {
      req.flash("error", "User ID and Wallet Amount are required.");
      return res.redirect("back");
    }

    // Ensure walletAmount is a positive number
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      req.flash("error", "Invalid wallet amount.");
      return res.redirect("back");
    }

    // Find wallet by user ID or create a new one
    let wallet = await Wallet.findOne({ user: userId }).exec();
    if (wallet) {
      wallet.amount += amount; // Add amount to existing wallet balance
    } else {
      wallet = new Wallet({ user: userId, amount }); // Create new wallet
    }

    await wallet.save(); // Save changes to the database

    req.flash("success", `₹${amount} added to the user's wallet successfully.`);
    res.redirect("back");
  } catch (error) {
    next(error); // Pass error to the error-handling middleware
  }
};

