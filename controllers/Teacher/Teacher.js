import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Teacher from '../../Models/teacher.js';

dotenv.config(); // Load environment variables

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(404).json({ message: "The user with the email does not exist" });
    }

    if (teacher.isBlocked) {
      return res.status(400).json({ message: "Sorry, this user is currently blocked. Please contact the administrator for further assistance." });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const payload = {
      id: teacher.id,
      fullName: teacher.fullName,
    };

    const token = jwt.sign(payload, process.env.USER_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRATION_TIME || "7d",
    });

    const response = {
      success: true,
      id: teacher.id,
      name: teacher.fullName,
      token: `Bearer ${token}`,
    };

    res.json(response);

  } catch (err) {
    console.error("Error occurred during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
