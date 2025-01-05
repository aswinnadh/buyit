import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  amount: {
    type: Number,
    required: true
  }
});

const Wallet = mongoose.model('wallet', walletSchema);

export default Wallet;

