import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Teacher from '../../Models/teacher.js';

dotenv.config();


// login data
export const login = async (req, res, next) => {
  try{
    
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
  } catch(err) {
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
    const teacherExist = await Teacher.findOne({ email:email})
    if(teacherExist){
      console.log(teacherExist);
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

