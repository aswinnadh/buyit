import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const handleAddToCart = async (req, res, next) => {
  try {
    const { userId, productId, quantity, color } = req.body;

    // Check if the product is already in the cart for the same user
    const existingCartItem = await Cart.findOne({
      user: userId,
      item: productId,
      color: color,
    });

    if (existingCartItem) {
      req.flash("error", "Product already in your cart");
      return res.redirect(`/user/product/${productId}`);
    }

    // Add the product to the cart
    const newCartItem = new Cart({
      user: userId,
      item: productId,
      quantity: quantity,
      color: color,
    });
    await newCartItem.save();

    req.flash("success", "Product added to your cart");
    res.redirect("back");
  } catch (error) {
    next(error);
  }
};

export const renderCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all cart items for the current user
    const cartItems = await Cart.find({ user: userId });

    // Retrieve product details for each cart item
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

    // Pass userId to the view
    res.render("cart", { cartItems: productDetails, userId });
  } catch (error) {
    next(error);
  }
};

export const removeItemFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    console.log("Attempting to remove item:", { userId, itemId }); // Debugging line

    const result = await Cart.findOneAndDelete({ user: userId, item: itemId });

    if (result) {
      req.flash("success", "Item removed from your cart");
      console.log("Successfully removed item:", { userId, itemId }); // Debugging line
    } else {
      req.flash("error", "Item not found in your cart");
      console.log("Item not found in cart:", { userId, itemId }); // Debugging line
    }
    res.redirect("back");
  } catch (error) {
    console.error("Error removing item:", error);
    next(error);
  }
};


export const updateCartQuantity = async (req, res) => {
  const { userId, quantities } = req.body;

  if (!userId || !quantities) {
    return res.status(400).json({ error: "Missing userId or quantities" });
  }

  try {
    // Loop through the quantities and update each cart item
    const updates = Object.entries(quantities).map(
      async ([productId, quantity]) => {
        await Cart.findOneAndUpdate(
          { user: userId, item: productId },
          { quantity: parseInt(quantity, 10) },
          { new: true }
        );
      }
    );

    await Promise.all(updates);

    res.redirect("/user/cart");
  } catch (error) {
    console.error("Error updating cart:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the cart" });
  }
};
