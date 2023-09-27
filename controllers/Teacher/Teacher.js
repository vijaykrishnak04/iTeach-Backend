import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Teacher from '../../Models/TeacherSchema.js';
import Class from "../../Models/ClassSchema.js";
import Exam from "../../Models/ExamSchema.js";
import Student from "../../Models/StudentSchema.js";

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
    console.log(req.body);
    console.log(req.files);
    const { 0: { filename = null, path = null } = {} } = req.files || {};
    const teacherImage = (filename && path) ? { public_id: filename, url: path } : null;

    const teacher = await Teacher.findById(req.body._id)

    if (!teacher) return res.status(404).json("teacher not found")

    if (teacherImage) {
      teacher.teacherImage = teacherImage;
    }
    teacher.fullName = req.body.fullName || teacher.fullName;
    teacher.email = req.body.email || teacher.email;

    // Save the updated teacher record to the database
    await teacher.save();

    return res.status(200).json(teacher);


  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}



export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.aggregate([
      {
        $match: { isBlocked: false } // Only get students who aren't blocked
      },
      {
        $project: {
          studentId: "$_id",               // Rename _id to studentId
          studentInfo: {
            fullName: "$fullName",
            studentImage: {
              $cond: { if: "$studentImage", then: "$studentImage.url", else: null }
            }
          }
        }
      }
    ]);

    if (students && students.length > 0) {
      return res.status(200).json(students);
    }

    return res.status(404).json("No Students data found");

  } catch (err) {
    // Make sure to handle the error appropriately
    return res.status(500).json({ message: "An error occurred", error: err.message });
  }
}


export const getStudentsByIds = async (req, res, next) => {
  try {
    // Extract the ids query parameter and split by commas to get an array of IDs
    const ids = req.query.ids.split(',').map(id => new mongoose.Types.ObjectId(id));
    // Fetch the exams by their IDs
    const students = await Student.find({
      _id: { $in: ids }
    });

    // Check if any exams were found
    if (students.length === 0) {
      return res.status(409).json('No students data found for the provided IDs.');
    } else {
      return res.status(200).json(students);
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json('Internal server error');
  }
}




