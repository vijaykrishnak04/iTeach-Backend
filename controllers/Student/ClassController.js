import mongoose from 'mongoose';
import Class from "../../Models/ClassSchema.js";
import Student from "../../Models/StudentSchema.js";

export const getClasses = async (req, res, next) => {
    try {
        const classes = await Class.find();
        if (!classes || classes.length === 0) {
            return res.status(409).json('no data found');
        } else {
            return res.status(200).json(classes);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}


export const addOrChangeClass = async (studentId, classId) => {
    try {
        const options = { new: true };

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Remove student from previous class, if exists
        const prevClassId = student.classRef?._id;
        if (prevClassId) {
            await Class.findByIdAndUpdate(prevClassId, { $pull: { students: studentId } }, options);
        }

        // Prepare the new class information, including the joinedDate
        const newClassInfo = {
            class: classId,
            joinedDate: new Date()  // Set joinedDate to the current date and time
        };

        // Update student's class
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { classRef: newClassInfo, exam: [] },
            options
        );

        if (!updatedStudent) {
            throw new Error('Failed to update student');
        }

        // Add student to the new class
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { $push: { students: studentId } },
            options
        );

        if (!updatedClass) {
            throw new Error('Failed to update class');
        }

        return updatedStudent;

    } catch (error) {
        console.log(error);
        throw new Error('Internal server error');
    }
};



