import { Router } from "express";
import connectEnsureLogin from "connect-ensure-login";
import { ensureAdmin } from "../middlewares/auth.middle.js";
import uploadFile from "../utils/multer.js";
import {
  handleAddProducts,
  handleDeleteProduct,
  handleDeleteUser,
  handleEditProduct,
  renderAddProducts,
  renderDash,
  renderEditproduct,
  renderEditUser,
  renderOrderDetails,
  renderOrders,
  renderProducts,
  renderUsers,
  saveProfile,
  updateOrderStatus,
  updateUserRole,
  updateUserStatus,
} from "../controlers/admin.controller.js";
import { addCoupon, addToUserWallet } from "../controlers/profile.controller.js";

const router = Router();

router.get("/dashboard", renderDash);

router
  .route("/addproduct")
  .get(
    connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
    ensureAdmin,
    renderAddProducts
  )
  .post(uploadFile.array("images", 10), handleAddProducts);

router.get(
  "/editproduct",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  renderEditproduct
);

router.put(
  "/editproduct/:id",
  uploadFile.array("images", 10),
  handleEditProduct
);
router.delete(
  "/deleteProduct/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  handleDeleteProduct
);

router.get(
  "/products",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  renderProducts
);

router.get(
  "/users",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  renderUsers
);

router.put(
  "/updateUserRole/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  updateUserRole
);
router.put(
  "/updateUserStatus/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  updateUserStatus
);

router.get(
  "/editUser/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  renderEditUser
);

router.put(
  "/saveProfile/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  saveProfile
);

router.post(
  "/addCoupon",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  addCoupon
);
router.post(
  "/addToUserWallet",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  addToUserWallet
);

router.delete(
  "/deleteUser/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  handleDeleteUser
);

router.get(
  "/orders",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  renderOrders
);

router.put(
  "/updateOrderStatus/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  updateOrderStatus
);

router.get(
  "/orderDetails/:id",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  renderOrderDetails
);


export default router;
