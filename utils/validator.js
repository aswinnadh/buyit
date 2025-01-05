import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .trim()
    .matches(/^\S+$/)
    .withMessage("Username should not contain spaces"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("email must be walid")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .trim()
    .isLength({ min: 3 })
    .withMessage("password is too short"),
];
