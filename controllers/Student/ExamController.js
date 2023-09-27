import mongoose from "mongoose";
import Exam from "../../Models/ExamSchema.js";
import Student from "../../Models/StudentSchema.js";

export const getExamsByIds = async (req, res, next) => {
    try {
        // Extract the ids query parameter and split by commas to get an array of IDs
        const ids = req.query.ids.split(',').map(id => new mongoose.Types.ObjectId(id));
        // Fetch the exams by their IDs
        const exams = await Exam.find({
            _id: { $in: ids }
        });

        // Check if any exams were found
        if (exams.length === 0) {
            return res.status(409).json('No exams data found for the provided IDs.');
        } else {
            return res.status(200).json(exams);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}

export const validateExam = async (req, res, next) => {
    try {
        let correctCount = 0;
        const { selectedAnswers, studentId } = req.body;
        const id = req.params.id;
        const exam = await Exam.findById(id);

        if (!exam) {
            return res.status(404).json('Exam Validation failed because submitted exam is deleted');
        }

        exam.questions.forEach((question, index) => {
            // If there's an answer submitted for this question
            if (selectedAnswers.hasOwnProperty(index)) {
                // Check if the submitted answer for the current question matches the correct answer
                if (question.correctAnswer === selectedAnswers[index]) {
                    correctCount++;
                }
            }
        });

        // Calculate the score as a percentage
        const score = `${correctCount}/${exam.questions.length}`

        // First, check if the student has taken the exam before
        const studentHasTakenExam = await Student.findOne({
            _id: studentId,
            "exam._id": exam._id
        });

        if (studentHasTakenExam) {
            // If the student has taken the exam before, update the score
            await Student.updateOne(
                { _id: studentId, "exam._id": exam._id },
                {
                    $set: {
                        "exam.$.marks": score
                    }
                }
            );
        } else {
            // If the student hasn't taken the exam, add the exam details and score
            await Student.updateOne(
                { _id: studentId },
                {
                    $addToSet: {
                        exam: {
                            _id: exam._id,
                            SubjectName: exam.class.subjectName,
                            name: exam.title,
                            marks: score
                        }
                    }
                }
            );
        }

        return res.status(200).json(score);

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}