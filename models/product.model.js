import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  brand: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  offer: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 3.5
  },
  detail: {
    type: String
  },
  colors: {
    type: Array,
    default: ["red", "white", "black"]
  },
  images: {
    type: Array
  },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('product', ProductSchema);

export default Product;
