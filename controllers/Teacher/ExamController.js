import Class from "../../Models/ClassSchema.js";
import Exam from "../../Models/ExamSchema.js";


// 1. Create Exam
export const createExam = async (req, res, next) => {
    try {
      const { title, duration, date, selectedClassAndSubject, questions } = req.body;
      console.log(req.body);
      // Check if an exam with the same title already exists
      const examExist = await Exam.findOne({ title: title });
      if (examExist) {
        return res.status(409).json("Exam with this title already exists");
      }
  
      // Create a new exam object using the Exam model
      const newExam = new Exam({
        title: title,
        duration: duration,
        date: date,
        class: selectedClassAndSubject,
        questions: questions
      });
  
      // Save the new exam record to the database
      const savedExam = await newExam.save();
  
      // Update the Class collection by appending the new exam's ID to the selectedClass's exams array
      await Class.findByIdAndUpdate(
        selectedClassAndSubject.classId,
        { $push: { exams: savedExam._id } },
        { new: true, useFindAndModify: false }
      );
  
      return res.status(200).json(savedExam);
  
    } catch (err) {
      console.error(err);
      res.status(500).json("Internal server error");
    }
  };
  
  
  // 2. Get Exams
  export const getExams = async (req, res, next) => {
    try {
      const exams = await Exam.find();
      return res.status(200).json(exams);
    } catch (err) {
      console.error(err);
      res.status(500).json("Internal server error");
    }
  };
  
  // 3. Edit Exam
  export const editExam = async (req, res, next) => {
    try {
      const { examId, examTitle, examDescription, questions } = req.body;
  
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json("Exam not found");
      }
  
      // Updating the exam properties
      exam.title = examTitle;
      exam.description = examDescription;
      exam.questions = questions;
  
      // Save the updated exam record to the database
      const updatedExam = await exam.save();
      return res.status(200).json(updatedExam);
  
    } catch (err) {
      console.error(err);
      res.status(500).json("Internal server error");
    }
  };
  
  // 4. Cancel Exam
  export const cancelExam = async (req, res, next) => {
    try {
      const examId = req.params.id;
  
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json("Exam not found");
      }
  
      // Delete the exam record from the database
      await Exam.findByIdAndDelete(examId);
  
      // Remove the exam ID from the Class's exams array
      await Class.findByIdAndUpdate(
        exam.class._id,
        { $pull: { exams: examId } },  // Use $pull to remove examId from the exams array
        { new: true, useFindAndModify: false }  // Return updated document and use native findOneAndUpdate()
      );
  
      return res.status(200).json(examId);
  
    } catch (err) {
      console.error(err);
      res.status(500).json("Internal server error");
    }
  };