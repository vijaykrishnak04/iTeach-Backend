import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { sendMail } from '../../helpers/mailer.js'
import Otp from "../../models/otp.js";
import Student from "../../Models/student.js";


dotenv.config()


//fetch data


// get single hostel data


// fetch room data


// singup data
export const signup = async (req, res, next) => {
  console.log(req.body)
  try {
    const { fullName, email, phoneNumber, password, confirmPassword } = req.body

    const isExist = await Student.findOne({
      $or: [
        { fullname: fullName },
        { phoneNumber: phoneNumber },
        { email: email }
      ]
    });
    if (isExist) {
      console.log("User exists");
      return res.status(400).json({ error: "User with this name, phone, or email already exists" });
    }

    await sendMail(email, fullName)

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const AuthData = {
      fullName,
      password: hashedPassword,
      phoneNumber,
      email,
    };
    res.status(200).json({ response: AuthData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// otp data 
export const OtpVerification = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, otp } = req.body
    console.log(fullName, email, phoneNumber, password, otp);

    if (!/^\d{6}$/.test(otp)) {
      res.status(400).json({ error: 'Invalid OTP format' });
    }

    const StudentAuth = await Student.create({
      fullName,
      email,
      phoneNumber,
      password,
    });

    await Otp.deleteOne({ email });

    res.status(200).json({ message: 'success' });
  } catch (err) {
    console.log(err);
  }
}

// login data
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: "The user with the email does not exist" });
    }

    if (student.isBlocked) {
      return res.status(400).json({ message: "Sorry, this user is currently blocked. Please contact the administrator for further assistance." });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const payload = {
      id: student.id,
      fullName: student.fullName,
    };

    const token = jwt.sign(payload, process.env.USER_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRATION_TIME || "7d",
    });

    res.json({
      success: true,
      _id: student.id,
      fullName: student.fullName,
      token: `Bearer ${token}`,    
    });

  } catch (err) {
    console.error("Error occurred during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};