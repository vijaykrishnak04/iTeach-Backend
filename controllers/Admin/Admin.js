import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Teacher from '../../Models/teacher.js';
import Course from "../../Models/course.js";
import { json } from "express";

dotenv.config();


// login data
export const login = async (req, res, next) => {
  try {

    const { email, password } = req.body

    if (process.env.ADMIN_EMAIL === email && process.env.ADMIN_PASSWORD === password) {
      const payload = {
        email: email,
      };
      jwt.sign(
        payload,
        process.env.ADMIN_SECRET,
        {
          expiresIn: 3600000,
        },

        (err, token) => {
          if (err) console.error("Errors in Token generating");

          else {
            res.json({
              status: true,
              email: email,
              token: `Bearer ${token}`,
            });
          }
        }
      );
    } else {
      const error = "Incorrect email or password";
      res.json({ errors: error });
    }
  } catch (err) {
    console.log(err)
    res.json("internal server error")
  }

};


// add-teacher 
export const addTeacher = async (req, res, next) => {
  try {
    const { fullName, email, password, subject } = req.body;
    console.log(req.body);

    // Create a new teacher object using the teacher model
    const teacherExist = await Teacher.findOne({ email: email })
    if (teacherExist) {
      return res.status(409).json("Teacher with this email already exist")
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = new Teacher({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      subject: subject,
    });

    // Save the new teacher record to the database
    const savedTeacher = await newTeacher.save();
    res.status(200).json(savedTeacher); // Optionally, you can send the saved teacher data back as a response

  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};

export const getTeachers = async (req, res, next) => {
  try {
    const teachersList = await Teacher.find();
    if (teachersList) {
      return res.status(200).json(teachersList);
    } else {
      return res.status(404).json("No data found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
};


export const deleteTeacher = async (req, res, next) => {
  try {
    const Id = req.params.id.trim();
    await Teacher.findByIdAndDelete({ _id: Id })
    const updatedTeachersList = await Teacher.find()
    return res.status(200).json(updatedTeachersList)
  } catch (err) {
    console.log(err);
    res.status(500).json('Internal server error')
  }
}

export const blockTeacher = async (req, res, next) => {
  try {
    const Id = req.params.id.trim();
    await Teacher.findByIdAndUpdate({ _id: Id }, { isBlocked: true })
    const updatedTeachersList = await Teacher.find()
    return res.status(200).json(updatedTeachersList)
  } catch (err) {
    console.log(err);
    res.status(500).json('internal server error')
  }
}

export const unblockTeacher = async (req, res, next) => {
  try {
    const Id = req.params.id.trim();
    await Teacher.findByIdAndUpdate({ _id: Id }, { isBlocked: false });
    const updatedTeachersList = await Teacher.find();
    return res.status(200).json(updatedTeachersList);
  } catch (err) {
    console.log(err);
    return res.status(500).json('internal server error');
  }
}


//course management

export const addCourse = async (req, res, next) => {
  try {
    const { courseTitle, courseDescription, lessons } = req.body;
    console.log(req.body);
    console.log(req.file)
    const { path, filename } = req.file;

    // Check if a course with the same title already exists
    const courseExist = await Course.findOne({ title: courseTitle });
    if (courseExist) {
      return res.status(409).json("Course with this title already exists");
    }

    // Create a new course object using the Course model
    const newCourse = new Course({
      title: courseTitle,
      description: courseDescription,
      thumbnail: {
        public_id: filename,
        url: path,
      },
      lessons: lessons,
    });

    // Save the new course record to the database
    const savedCourse = await newCourse.save();
    res.status(200).json(savedCourse);

  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};

export const getAllCourses = async (req, res, next) => {
  try {
    // Retrieve all courses from the database
    const courses = await Course.find();

    if (!courses || courses.length === 0) {
      return res.status(404).json("No courses found");
    }

    res.status(200).json(courses);

  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};

export const hideCourse = async (req, res, next) => {
  try {
    const Id = req.params.id.trim();
    await Course.findByIdAndUpdate({ _id: Id }, { isHidden: true });
    const updatedCourseList = await Course.find();
    return res.status(200).json(updatedCourseList);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};

export const unhideCourse = async (req, res, next) => {
  try {
    const Id = req.params.id.trim();
    await Course.findByIdAndUpdate({ _id: Id }, { isHidden: false });
    const updatedCourseList = await Course.find();
    return res.status(200).json(updatedCourseList);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const Id = req.params.id.trim();
    await Course.findByIdAndDelete({ _id: Id });
    const updatedCourseList = await Course.find();
    return res.status(200).json(updatedCourseList);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};







