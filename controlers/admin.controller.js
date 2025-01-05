import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import Wallet from "../models/wallet.model.js";
import Purchase from "../models/purchase.model.js";

export const renderDash = (req, res, next) => {
  res.render("dashAdmin");
};

export const renderAddProducts = (req, res, next) => {
  res.render("addProduct");
};

export const handleAddProducts = async (req, res, next) => {
  try {
    const {
      name,
      category,
      brand,
      price,
      offer,
      stock,
      rating,
      detail,
      colors,
    } = req.body;

    const images = req.files.map((file) => {
      return `/uploads/products/${file.filename}`;
    });

    const newProduct = new Product({
      name,
      category,
      brand,
      price,
      offer,
      stock,
      rating,
      detail,
      colors,
      images,
    });

    await newProduct.save();
    req.flash("success", "product added succesfully");
    res.redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

export const renderProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("productListAdmin", { products: products });
  } catch (error) {
    next(error);
  }
};


export const renderEditproduct = async (req, res, next) => {
  try {
    const productId = req.query.id;
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "product not found");
      return res.redirect("/admin/products");
    }
    res.render("editProduct", { product });
  } catch (error) {
    next(error);
  }
};

export const handleEditProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const {
      name,
      category,
      brand,
      price,
      offer,
      stock,
      rating,
      detail,
      colors,
    } = req.body;

    const images = req.files
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];

    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/admin/products");
    }

    product.name = name;
    product.category = category;
    product.brand = brand;
    product.price = price;
    product.offer = offer;
    product.stock = stock;
    product.rating = rating;
    product.detail = detail;
    product.colors = colors;
    if (images.length > 0) {
      product.images = images;
    }

    await product.save();
    req.flash("success", "product updated successfully");
    res.redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

export const handleDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);
    req.flash("success", "Product deleted successfully");
    res.redirect("/admin/products");
  } catch (error) {
    next(error);
  }
};

export const renderUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.render("userList", { users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/users");
    }
    user.role = role;
    await user.save();
    req.flash("success", "User role updated successfully");
    res.redirect("/admin/users");
  } catch (error) {
    next(error);
  }
};
export const updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/users");
    }
    user.status = status;
    await user.save();
    req.flash("success", "User status updated successfully");
    res.redirect("/admin/users");
  } catch (error) {
    next(error);
  }
};

export const handleDeleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id; // Use req.params.id to get the user ID
    await User.findByIdAndDelete(userId);
    req.flash("success", "User deleted successfully");
    res.redirect("/admin/users");
  } catch (error) {
    next(error);
  }
};

export const renderEditUser = async (req, res, next) => {
  try {
    const admin = req.user; // Admin information
    const userId = req.params.id; // User ID from the URL
    const user = await User.findById(userId).exec(); // Fetch the user
    const coupons = await Coupon.find({ user: userId }).exec(); // Fetch coupons for the user
    const wallet = await Wallet.findOne({ user: userId }).exec() || { amount: 0};// Fetch wallet for the user

    // Check if user exists
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/admin/users");
    }

    // Render profile page with wallet
    res.render("profile", { coupons, user, admin, wallet: wallet || { amount: 0 } });
  } catch (error) {
    next(error); // Pass errors to the error-handling middleware
  }
};

export const saveProfile = async (req, res, next) => {
  try {
    const { username, phone, address, district, state, pincode } = req.body;
    const userId = req.params.id; // Use req.params.id to get the user ID

    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/users");
    }

    user.username = username;
    user.phone = phone;
    user.address = address;
    user.district = district;
    user.state = state;
    user.pincode = pincode;

    await user.save();
    req.flash("success", "Profile updated successfully");
    res.redirect("/admin/users");
  } catch (error) {
    next(error);
  }
};


export const renderOrders = async (req, res, next) => {
  try {
    const orders = await Purchase.find().sort({ createdAt: -1 }).populate('user');
    res.render('orderListAdmin', { orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await Purchase.findById(orderId);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }
    order.status = status;
    await order.save();
    req.flash("success", "Order status updated successfully");
    res.redirect("/admin/orders");
  } catch (error) {
    next(error);
  }
};

export const renderOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Purchase.findById(orderId).populate('user').populate('items.productId');
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }
    res.render('orderDetails', { order });
  } catch (error) {
    next(error);
  }
};
