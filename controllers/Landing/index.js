import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { sendMail } from '../../helpers/mailer.js'
import Otp from "../../Models/OtpSchema.js";
import Student from "../../Models/StudentSchema.js";
import Banner from "../../Models/BannerSchema.js";
import Course from "../../Models/CourseSchema.js";
import Teacher from "../../Models/TeacherSchema.js";
import Class from "../../Models/ClassSchema.js";

dotenv.config()

// singup data
export const signup = async (req, res, next) => {
  console.log(req.body)
  try {
    const { fullName, email, phoneNumber, password } = req.body

    const isExist = await Student.findOne({
      $or: [
        { fullName: fullName },
        { phoneNumber: phoneNumber },
        { email: email }
      ]
    });

    if (isExist) {
      const existingFields = [];

      if (isExist.fullName === fullName) {
        existingFields.push("name");
      }
      if (isExist.phoneNumber === parseFloat(phoneNumber)) {
        existingFields.push("phone number");
      }
      if (isExist.email === email) {
        existingFields.push("email");
      }
      return res.status(400).json(existingFields);
    }

    const OTP = `${Math.floor(100000 + Math.random() * 900000)}`;
    await sendMail(email, fullName, OTP)
   

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
    const { fullName, email, phoneNumber, password } = req.body.StudentAuth;
    const { otp } = req.body
    console.log(req.body);
    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    // Find OTP record using email
    const otpRecord = await Otp.findOne({ email });
    console.log(otpRecord);
    // Check if OTP record exists and is valid
    if (!otpRecord || Date.now() > otpRecord.expirationTime) {
      return res.status(400).json({ error: 'OTP has expired or does not exist' });
    }

    // Check if provided OTP matches the OTP from the database
    if (Number(otp) !== Number(otpRecord.otp)) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }


    // Create the new student account since OTP is verified

    await Student.create({
      fullName,
      email,
      phoneNumber,
      password: password,
    });

    // Delete the OTP record as it's no longer needed
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: 'Success, account created!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


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

    console.log(student);
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      console.log(isMatch);
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
      student,
      token: `Bearer ${token}`,
    });

  } catch (err) {
    console.error("Error occurred during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//banner

export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find()

    if (!banners) return res.status(404).json("No Banners found")

    return res.status(200).json(banners)

  } catch (err) {
    return res.status(500).json("An error occurred while getting banners");
  }
}

//courses

export const getCourses = async (req, res, next) => {
  try {
    // Aggregating only needed fields from Course
    const courses = await Course.aggregate([
      { $match: { isHidden: false } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          thumbnail: 1
        }
      }
    ]);

    // Aggregating only needed fields from Class
    const classes = await Class.aggregate([
      {
        $project: {
          _id: 1,
          title: "$name",
          description: 1,
          thumbnail: 1
        }
      }
    ]);

    if ((courses && courses.length === 0) && (classes && classes.length === 0)) {
      return res.status(409).json('no data found');
    } else {
      const data = [...courses, ...classes]
      return res.status(200).json(data);
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json('internal server error');
  }
};


//get tutors

export const getTutors = async (req, res, next) => {
  try {
    const tutors = await Teacher.find({ isBlocked: false })
    if (!tutors) {
      return res.status(404).json("No tutors found")
    } else {
      return res.status(200).json(tutors)
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json('internal server error');
  }
}

//get pricing

export const getPricing = async (req, res, next) => {
  try {
    const classPricing = await Class.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
        },
      },
    ]);

    const coursePricing = await Course.aggregate([
      {
        $project: {
          _id: 1,
          name: "$title",
          price: 1,
        },
      },
    ]);

    const pricing = [...classPricing, ...coursePricing];
    if (pricing) {
      return res.status(200).json(pricing);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json('internal server error');
  }
}
