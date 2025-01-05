import User from "../models/user.model.js";
import { validationResult } from "express-validator";
import passport from "../utils/passport.auth.js";

export const renderSignup = (req, res) => {
  
  res.render("signup");
};

export const handleSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => {
        req.flash("error", error.msg);
      });
      return res.render("signup", {
        email: req.body.email,
        username: req.body.username,
        messages: req.flash(),
      });
    }
    const { email } = req.body;
    const doesExist = await User.findOne({ email: email });
    if (doesExist) {
      req.flash("error", "Email already registered");
      return res.redirect("/auth/signup");
    }
    const user = new User(req.body);
    await user.save();
    req.flash("success", `You registered as ${user.username} `);
    return res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
};

export const renderLogin = (req, res) => {
  
  res.render("login");
};

export const handleLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/auth/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Store user in session or pass user details to success redirect
      res.redirect("/");
    });
  })(req, res, next);
};

export const handleLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/");
  });
};
export const renderError = (req, res) => {
  res.render("error");
};
