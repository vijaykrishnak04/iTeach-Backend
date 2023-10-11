import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Teacher from '../../Models/TeacherSchema.js';
import Course from "../../Models/CourseSchema.js";
import Class from "../../Models/ClassSchema.js"
import Student from "../../Models/StudentSchema.js"
import { deleteFiles } from "../../config/cloudinary.js";
import Banner from "../../Models/BannerSchema.js";
import Payment from "../../Models/PaymentSchema.js";
import validator from 'validator';
import xss from 'xss';

dotenv.config();


//dashboard 
export const getDashboardData = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const studentsTotal = await Student.find().countDocuments() || 0;
    const studentsAddedToday = await Student.find({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    }).countDocuments() || 0;

    const revenue = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$Amount" },
        },
      },
    ]) || [{ totalRevenue: 0 }];

    const todaysRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lte: endOfToday
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$Amount" }
        }
      },
      {
        $project: {
          totalRevenue: 1
        }
      }
    ]) || [{ totalRevenue: 0 }];

    const monthlyRevenue = await Payment.aggregate([

      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$Amount" }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          totalRevenue: 1
        }
      },
      {
        $sort: { "year": 1, "month": 1 }
      }
    ]) || [];

    const courses = await Payment.aggregate([
      {
        $match: { courseId: { $exists: true } }
      },
      {
        $group: {
          _id: "$courseId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo"
        }
      },
      {
        $unwind: "$courseInfo"
      },
      {
        $project: {
          count: 1,
          courseTitle: "$courseInfo.title",
          coursePrice: "$courseInfo.price",
          courseThumbnail: "$courseInfo.thumbnail"
        }
      },
      {
        $sort: { count: -1 }
      }
    ]) || [];

    const classes = await Class.aggregate([
      {
        $match: {
          students: { $exists: true, $type: "array" }
        }
      },
      {
        $project: {
          name: 1,
          numberOfStudents: { $size: "$students" }
        }
      },
      {
        $sort: { numberOfStudents: -1 }
      }
    ]) || [];

    const entities = await Payment.aggregate([
      {
        $group: {
          _id: {
            classId: "$classId",
            courseId: "$courseId"
          },
          totalRevenue: { $sum: "$Amount" }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id.courseId",
          foreignField: "_id",
          as: "courseInfo"
        }
      },
      {
        $unwind: {
          path: "$courseInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id.classId",
          foreignField: "_id",
          as: "classInfo"
        }
      },
      {
        $unwind: {
          path: "$classInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          totalRevenue: 1,
          title: {
            $ifNull: ["$courseInfo.title", "$classInfo.name"]
          },
          price: {
            $ifNull: ["$courseInfo.price", "$classInfo.price"]
          },
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]) || [];




    res.status(200).json({
      totalStudents: studentsTotal,
      studentsAddedToday: studentsAddedToday,
      totalRevenue: revenue[0]?.totalRevenue || 0,
      todaysRevenue: todaysRevenue[0]?.totalRevenue || 0,
      monthlyRevenue: monthlyRevenue,
      totalCourses: courses,
      totalClasses: classes,
      entities,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};


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
    let { fullName, email, password, subject, qualification } = req.body;

    fullName = xss(fullName);
    email = xss(email);
    password = xss(password);
    subject = xss(subject);
    qualification = xss(qualification);

    if (!validator.isEmail(email)) {
      return res.status(400).json("Invalid email format");
    }

    const teacherExist = await Teacher.findOne({ email });
    if (teacherExist) {
      return res.status(409).json("Teacher with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teacher({
      fullName,
      email,
      qualification,
      password: hashedPassword,
      subject,
    });

    const savedTeacher = await newTeacher.save();
    res.status(200).json(savedTeacher);

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
    if (!validator.isMongoId(Id)) {
      return res.status(400).json("Invalid Id");
    }
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
    if (!validator.isMongoId(Id)) {
      return res.status(400).json("Invalid Id");
    }
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
    if (!validator.isMongoId(Id)) {
      return res.status(400).json("Invalid Id");
    }
    await Teacher.findByIdAndUpdate({ _id: Id }, { isBlocked: false });
    const updatedTeachersList = await Teacher.find();
    return res.status(200).json(updatedTeachersList);
  } catch (err) {
    console.log(err);
    return res.status(500).json('internal server error');
  }
}

//Banner 

export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find()

    if (!banners) return res.status(404).json("No Banners found")

    return res.status(200).json(banners)

  } catch (err) {
    return res.status(500).json("An error occurred while getting banners");
  }
}

export const addBanner = async (req, res, next) => {
  try {
    const filename = req?.files?.[0]?.filename || null;
    const path = req?.files?.[0]?.path || null;

    if (!filename || !path) {
      return res.status(400).json("No image provided");
    }

    const bannerImage = {
      public_id: filename,
      url: path,
    };

    const savedBanner = new Banner({
      bannerImage: bannerImage,
    });

    await savedBanner.save();

    return res.status(200).json(savedBanner);
  } catch (err) {
    console.error(err);  // Log the error for debugging purposes.
    return res.status(500).json("An error occurred while adding the banner");
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!validator.isMongoId(id)) {
      return res.status(400).json("Invalid Id");
    }
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    await deleteFiles([banner.bannerImage.public_id]);
    await banner.deleteOne()

    return res.status(200).json({ message: "Banner deleted successfully" });

  } catch (err) {
    console.error(err);  // Log the error for debugging purposes.

    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: "Invalid banner ID" });
    }

    return res.status(500).json({ message: "An error occurred while deleting the banner" });
  }
}












