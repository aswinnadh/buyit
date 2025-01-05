import { Router } from "express";
import { renderCategorySearch, renderHome } from "../controlers/home.controller.js";

const router = Router();

router.get("/", renderHome);

router.get(
  "/categorySearch",
  renderCategorySearch
);

router.get("/error", (req, res, next) => {
  res.render("error");
});

export default router;
