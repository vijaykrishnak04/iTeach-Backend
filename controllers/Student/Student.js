import Course from "../../Models/CourseSchema.js"
import Student from "../../Models/StudentSchema.js";
import Class from "../../Models/ClassSchema.js"
import Exam from "../../Models/ExamSchema.js";
import Teacher from "../../Models/TeacherSchema.js"

import mongoose from "mongoose";
import Chat from "../../Models/ChatSchema.js";






export const getStudentById = async (req, res, next) => {
    try {
        // Getting the student's _id from the request parameters
        const { id } = req.params;

        // Finding the student using the _id and populating classRef
        const student = await Student.findById(id);
        // Checking if the student exists
        if (!student) {
            return res.status(404).json('Student not found');
        } else {
            return res.status(200).json(student);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}







export const checkIfStudentHasEnrolled = async (req, res, next) => {
    try {
        // Extracting the student's _id from the request parameters
        const { id } = req.params;

        // Finding the student using the _id
        const student = await Student.findById(id).populate('classRef')

        if (student.classRef) {
            return res.status(200).json({ success: true, data: student.classRef });
        } else {
            return res.status(404).json({ success: false })
        }


    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const editStudent = async (req, res, next) => {
    try {
        // Getting the student's _id from the request parameters
        const { id } = req.params;
        const { 0: { filename = null, path = null } = {} } = req.files || {};

        const studentImage = (filename && path) ? { public_id: filename, url: path } : null;



        // Find the student using the _id
        const student = await Student.findById(id);

        // If student is not found, return an error
        if (!student) {
            return res.status(404).json('Student not found');
        }

        // Update the student's properties based on the request body
        if (studentImage) {
            student.studentImage = studentImage;
        }
        student.fullName = req.body.name || student.fullName;
        student.email = req.body.email || student.email;
        student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
        student.classRef = req.body.classRef || student.classRef;
        student.gender = req.body.gender || student.gender;
        student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
        student.address = req.body.address || student.address;

        // Save the updated student record to the database
        await student.save();

        return res.status(200).json(student);

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};
