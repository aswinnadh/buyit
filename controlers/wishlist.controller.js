import Product from "../models/product.model.js";
import WishList from "../models/wishlist.model.js";

export const renderWishlist = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    
    // Find all wishlist items for the current user
    const wishlist = await WishList.find({ user: userId });

    // Extract product IDs from the wishlist items
    const productIds = wishlist.map(item => item.item);

    // Find the corresponding products
    const wishlistItems = await Product.find({ _id: { $in: productIds } });

    // Render the wishlist template with the retrieved product data
    res.render("wishlist", { wishlistItems, wishlistProductIds: productIds });
  } catch (error) {
    next(error);
  }
};


export const handleWishlist = async (req, res, next) => {
  try {
    const { productId, isChecked } = req.body;
    const userId = req.user?._id; // Assuming user ID is available in req.user

    if (isChecked) {
      // Add to wishlist
      await WishList.create({ user: userId, item: productId });
      req.flash("success", "product added to wishlist");
    } else {
      // Remove from wishlist
      await WishList.findOneAndDelete({ user: userId, item: productId });
      req.flash("success", "product removed from wishlist");
    }
  } catch (error) {
    next(error);
  }
};
