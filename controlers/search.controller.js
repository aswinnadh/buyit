import Product from "../models/product.model.js";

export const renderSearch = (req, res) => {
    const products = res.locals.products || [];
    res.render("search", { products });
  };
  

export const formSearch=async (req, res) => {
    try {
      const { name } = req.query;
      const products = await Product.find({ name: { $regex: name, $options: "i" } });
      res.render("search", { products });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }