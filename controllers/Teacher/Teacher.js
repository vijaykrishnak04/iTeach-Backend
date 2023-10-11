import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Teacher from '../../Models/TeacherSchema.js';
import validator from 'validator';
import xss from 'xss';

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
      _id: teacher.id,
      fullName: teacher.fullName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION_TIME || "7d",
    });

    const response = {
      success: true,
      _id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      subject: teacher.subject,
      token: `Bearer ${token}`,
    };

    res.json(response);

  } catch (err) {
    console.error("Error occurred during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//profile

export const editProfile = async (req, res, next) => {
  try {
    const { 0: { filename = null, path = null } = {} } = req.files || {};
    const teacherImage = (filename && path) ? { public_id: filename, url: path } : null;
    const { _id, fullName, email } = req.body;

    // Input Validation
    if (!validator.isMongoId(_id)) {
      return res.status(400).json("Invalid ID");
    }

    // Sanitize input to prevent XSS attacks
    const sanitizedFullName = xss(fullName);
    const sanitizedEmail = xss(email);

    let updateFields = {};

    if (teacherImage) {
      updateFields.teacherImage = teacherImage;
    }

    if (sanitizedFullName) updateFields.fullName = sanitizedFullName;
    if (sanitizedEmail) updateFields.email = sanitizedEmail;

    const updatedTeacher = await Teacher.findOneAndUpdate(
      { _id },
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedTeacher) {
      return res.status(404).json("Teacher not found or failed to update");
    }

    return res.status(200).json(updatedTeacher);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const changePassword = async (req, res, next) => {
  try {
      // Getting the student's _id and credentials from the request
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Find the student using the _id
      const teacher = await Teacher.findById(id);

      // If student is not found, return an error
      if (!teacher) {
          return res.status(404).json('Teacher not found');
      }

      // Check if the currentPassword matches the stored hash
      const isMatch = await bcrypt.compare(currentPassword, teacher.password);

      if (!isMatch) {
          return res.status(400).json('Incorrect current password');
      }

      // New password and current password should not be the same
      if (newPassword === currentPassword) {
          return res.status(400).json('New password should be different from the current password');
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Update the password
      teacher.password = hashedNewPassword;

      // Save the updated student record to the database
      await teacher.save();

      return res.status(200).json('Password changed successfully');

  } catch (err) {
      console.log(err);
      return res.status(500).json('Internal server error');
  }
};








