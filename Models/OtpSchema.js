import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      required: true
    },
    expirationTime: {
      type: Date,
      required: true,
      expires: 10 // expires in 180 seconds
    }
  },
  {
    timestamps: true,
  }
);

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
