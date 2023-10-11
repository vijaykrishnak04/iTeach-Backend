import Class from "../../Models/ClassSchema.js";
import Exam from "../../Models/ExamSchema.js";
import Student from "../../Models/StudentSchema.js";
import { deleteFiles } from "../../config/cloudinary.js";
import path from 'path';
import xss from 'xss';
import validator from 'validator';

export const addClass = async (req, res, next) => {
  try {
    let { name, price, subjects, description } = req.body;

    name = xss(name);
    description = xss(description);
    if (typeof price !== 'number') {
      return res.status(400).json("Price should be a number");
    }
    if (!Array.isArray(subjects) || !subjects.every(sub => typeof sub === 'string')) {
      return res.status(400).json("Invalid subjects format");
    }

    subjects = subjects.map(sub => xss(sub)); 

    const filename = req?.files?.[0]?.filename || null;
    const filePath = req?.files?.[0]?.path || null;

    const sanitizedFilename = xss(filename);

    const fileExtension = path.extname(sanitizedFilename);
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension.toLowerCase())) {
      return res.status(400).json("Invalid file type. Only image files are allowed");
    }

    if (!sanitizedFilename || !filePath) {
      return res.status(400).json("No image provided");
    }

    const thumbnail = {
      public_id: sanitizedFilename,
      url: filePath,
    };

    const classExist = await Class.findOne({ name });
    if (classExist) {
      return res.status(409).json("Syllabus with this name already exists");
    }

    //checking duplicate subjects
    const uniqueSubjects = [...new Set(subjects)];
    if (uniqueSubjects.length !== subjects.length) {
      return res.status(400).json("Duplicate subjects provided");
    }

    const subjectObjects = uniqueSubjects.map(subjectName => ({ subjectName }));

    const newClass = new Class({
      name,
      price,
      thumbnail,
      description,
      subjects: subjectObjects,
    });

    const savedClass = await newClass.save();
    return res.status(200).json(savedClass);

  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};



export const getClasses = async (req, res) => {
  try {
    const syllabusData = await Class.find()
    if (syllabusData) {
      return res.status(200).json(syllabusData)
    } else {
      return res.status(404).json("no data found")
    }
  } catch (err) {
    console.log(err);
  }
}

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validator.isMongoId(id)) {
      return res.status(400).json("Invalid Id");
    }
    
    // Find the class to get exams and students arrays
    const classToDelete = await Class.findById(id);
    if (!classToDelete) {
      return res.status(404).json("Class not found");
    }

    deleteFiles(classToDelete?.thumbnail?.public_id)

    // Delete associated exams

    await Exam.deleteMany({ _id: { $in: classToDelete.exams } });

    // Update students by removing class reference
    await Student.updateMany(
      { _id: { $in: classToDelete.students } },
      { $unset: { classRef: "" } }
    );

    // Delete the class itself
    await Class.findByIdAndDelete(id);

    return res.status(200).json(id);

  } catch (err) {
    console.log(err);
    return res.status(500).json("An error occurred while deleting the syllabus");
  }
};