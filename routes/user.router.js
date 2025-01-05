import { Router } from "express";
import connectEnsureLogin from "connect-ensure-login";
import { renderProduct } from "../controlers/home.controller.js";
import {
  handleWishlist,
  renderWishlist,
} from "../controlers/wishlist.controller.js";
import {
  handleAddToCart,
  removeItemFromCart,
  renderCart,
  updateCartQuantity,
} from "../controlers/cart.controller.js";
import {
  getCheckoutData,
  handleApplyCoupon,
  renderCheckOutCart,
  updateUserData,
} from "../controlers/checkout.controller.js";
import { renderProfile } from "../controlers/profile.controller.js";

import {
  handlePurchase,
  handlePurchaseWallet,
} from "../controlers/purchase.controller.js";
import { formSearch, renderSearch } from "../controlers/search.controller.js";
import { renderOrderDetails } from "../controlers/admin.controller.js";

const router = Router();

router.get(
  "/product/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  renderProduct
);

router.get(
  "/search",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  renderSearch
);
router.get(
  "/formSearch",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  formSearch
);

router.get(
  "/profile",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  renderProfile
);

router.get(
  "/orderDetails/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  
  renderOrderDetails
);


router.get(
  "/wishlist",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  renderWishlist
);

router.post(
  "/editWishlist",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  handleWishlist
);
router.post(
  "/addToCart",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  handleAddToCart
);
router.get(
  "/cart",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  renderCart
);

router.post(
  "/updateCartQuantity",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  updateCartQuantity
);

router.delete(
  "/removeItemFromCart/:itemId",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  removeItemFromCart
);

router.get(
  "/checkOutCart",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  renderCheckOutCart
);

router.post(
  "/updateUserData",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  updateUserData
);

router.post(
  "/buyNow",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  getCheckoutData
);
router.post(
  "/applyCoupon",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  handleApplyCoupon
);

router.post(
  "/purchaseCod",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  handlePurchase
);
router.post(
  "/purchaseWallet",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  handlePurchaseWallet
);

export default router;
