import Product from "../models/product.model.js";
import WishList from "../models/wishlist.model.js";

export const renderHome = async (req, res, next) => {
  try {
    const products = await Product.find();
    const userId = req.user?._id;
    const category=req.query.category;
    const categoriesedProducts= await Product.find({category})
    const wishlistItems = await WishList.find({ user: userId });
    const wishlistProductIds = wishlistItems.map((item) => item.item);
    res.render("home", { products: products ,categoriesedProducts, wishlistProductIds });
  } catch (error) {
    next(error);
  }
};

export const renderCategorySearch= async (req, res, next) => {
  try {
    const products = await Product.find();
    const userId = req.user?._id;
    let category=req.query.category;
    category = category.toUpperCase();
    const categoriesedProducts= await Product.find({category})
    const wishlistItems = await WishList.find({ user: userId });
    const wishlistProductIds = wishlistItems.map((item) => item.item);
    res.render("home", { products: products ,categoriesedProducts, wishlistProductIds });
  } catch (error) {
    next(error);
  }
}


export const renderProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findById(productId);

    const userId = req.user?._id;
    const wishlistItems = await WishList.find({ user: userId });
    const wishlistProductIds = wishlistItems.map((item) => item.item);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/user/products");
    }
    res.render("product", { product, wishlistProductIds });
  } catch (error) {
    next(error);
  }
};

