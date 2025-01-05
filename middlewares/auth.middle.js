import { roles } from "../utils/constants.js";

export const ensureAdmin = function (req, res, next) {
  if (req.user.role === roles.admin) {
    next();
  } else {
    req.flash("info", "you are not allowed to see this page");
    res.redirect("/");
  }
};

export const preventBack=function (req, res, next) {
  if(req.user){
    return res.redirect("/")
  }
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}
