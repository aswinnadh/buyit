import dotenv from "dotenv"
import mongoose from "mongoose";
import { roles, states } from "../utils/constants.js";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";

dotenv.config();

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [roles.admin, roles.client],
    default: roles.client,
  },
  status:{
    type:String,
    enum:[states.active,states.blocked],
    default: states.active,
  },
  phone:{
    type:String,
  },
  address:{
    type:String,
  },
  district:{
    type:String,
  },
  state:{
    type:String,
  },
  pincode:{
    type:String,
  },
});

UserSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(this.password, salt);
      this.password = hashPassword;
      if (this.email==process.env.ADMIN_EMAIL.toLowerCase()){
        this.role=roles.admin
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw createHttpError.InternalServerError(error.message);
  }
};

const User = mongoose.model("user", UserSchema);

export default User;
