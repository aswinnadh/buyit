import { Router } from "express";
import connectEnsureLogin from "connect-ensure-login";
import { registerValidator } from "../utils/validator.js";
import passport from "../utils/passport.auth.js";
import {
  handleLogin,
  handleLogout,
  handleSignup,
  renderLogin,
  renderSignup,
} from "../controlers/auth.controller.js";
import { preventBack } from "../middlewares/auth.middle.js";

const router = Router();

router
  .route("/signup")
  .get(connectEnsureLogin.ensureLoggedOut({ redirectTo: "/" }),preventBack, renderSignup)
  .post(
    connectEnsureLogin.ensureLoggedOut({ redirectTo: "/" }),
    registerValidator,
    handleSignup
  );

router
  .route("/login")
  .get(connectEnsureLogin.ensureLoggedOut({ redirectTo: "/" }),preventBack, renderLogin)
  .post(connectEnsureLogin.ensureLoggedOut({ redirectTo: "/" }), handleLogin);

router.get(
  "/logout",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" }),
  handleLogout
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

export default router;
