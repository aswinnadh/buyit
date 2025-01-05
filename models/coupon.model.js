import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
});

const Coupon = mongoose.model('coupon', couponSchema);

export default Coupon;



