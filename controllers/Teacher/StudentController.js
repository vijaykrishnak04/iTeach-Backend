import mongoose from "mongoose";
import Student from "../../Models/StudentSchema.js";

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

export const blockStudent = async (req, res) => {
    try {
        const id = req.body.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json("Invalid ID");
        }

        // Block the student
        const updateResponse = await Student.updateOne(
            { _id: id },
            { $set: { isBlocked: true } }
        );
        console.log(updateResponse);

        if (updateResponse.modifiedCount === 1) {
            return res.status(200).json({ message: "Student Blocked successfully" });
        } else if (updateResponse.matchedCount === 0) {
            return res.status(400).json("Student not found");
        } else {
            return res.status(400).json("Blocking student failed");
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};

export const unblockStudent = async (req, res) => {
    try {
        const id = req.body.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json("Invalid ID");
        }

        const updateResponse = await Student.updateOne(
            { _id: id },
            { $set: { isBlocked: false } }
        );
        console.log(updateResponse);
        if (updateResponse.modifiedCount === 1) {
            return res.status(200).json({ message: "Student Unblocked successfully" });
        } else if (updateResponse.matchedCount === 0) {
            return res.status(400).json("Student not found");
        } else {
            return res.status(400).json("Unblocking student failed");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};

