import mongoose from "mongoose";

const wishlistSchema=new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    item:{
        type:String,
        required:true
    },
    createdAt: { type: Date, default: Date.now },
})

const WishList=mongoose.model("wishlist",wishlistSchema)

export default WishList;