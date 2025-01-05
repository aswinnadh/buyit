import Cart from "../models/cart.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";

export const renderCheckOutCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).exec();
    const cartItems = await Cart.find({ user: userId });
    const wallet = (await Wallet.findOne({ user: userId }).exec()) || {
      amount: 0,
    };

    const productDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.item);
        return {
          ...product._doc,
          quantity: item.quantity,
          color: item.color,
        };
      })
    );

    const discount = parseFloat(req.query.discount) || 0; // Get discount from query parameters
    const couponCode = req.query.couponCode || ""; // Get coupon code from query parameters

    res.render("checkOutCart", {
      user,
      cartItems: productDetails,
      discount,
      couponCode,
      wallet,
    });
  } catch (error) {
    next(error);
  }
};

export const handleApplyCoupon = async (req, res, next) => {
  try {
    const { couponCode, price } = req.body; // Get userId, price, and couponCode from form data

    console.log(req.body)
    if (!couponCode) {
      req.flash("error", "Coupon code cannot be empty.");
      return res.redirect("back");
    }
    // Fetch the coupon using the provided couponCode and userId
    const coupon = await Coupon.findById(couponCode);

    // Check if coupon exists
    if (!coupon) {
      req.flash("error", "Invalid coupon or not applicable.");
      return res.redirect("back");
    }

    // Check if price is lower than coupon amount
    if (price < coupon.amount) {
      req.flash("info", "Very low price range! Coupon not applicable.");
      return res.redirect("back");
    }

    // Redirect with the discount amount
    res.redirect(
      `/user/checkOutCart?discount=${coupon.amount}&couponCode=${couponCode}`
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { username, phone, address, district, state, pincode } = req.body;
    await User.findByIdAndUpdate(userId, {
      username,
      phone,
      address,
      district,
      state,
      pincode,
    });
    req.flash("success", "Profile updated successfully");
    res.redirect("back");
  } catch (error) {
    next(error);
  }
};

export const getCheckoutData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity, color } = req.body;

    // Log the entire request body to ensure all fields are present
    console.log("Request Body:", req.body);

    // Fetch user and product details
    const user = await User.findById(userId).exec();
    const product = await Product.findById(productId).exec();
    const wallet = (await Wallet.findOne({ user: userId }).exec()) || {
      amount: 0,
    };

    // Validate product existence
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Construct cartItems array
    const cartItems = [
      {
        _id: product._id,
        name: product.name,
        quantity: parseInt(quantity) || 1, // Ensure quantity is an integer and default to 1 if not provided
        price: product.price,
        offer: product.offer || 0, // Default to 0% offer if not provided
        images: product.images || [],
        color: color || "default", // Default color if not provided
      },
    ];

    // Default discount and coupon code
    const discount = 0; // Set to 0 for now, can be dynamically calculated
    const couponCode = ""; // Empty string when no coupon is applied

    // Render the checkout page
    res.render("checkOutCart", {
      user,
      cartItems,
      discount,
      couponCode,
      wallet,
    });
  } catch (error) {
    // Handle errors
    console.error("Error in getCheckoutData:", error);
    next(error);
  }
};
