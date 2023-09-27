
//chats

import mongoose from "mongoose";
import Chat from "../../Models/ChatSchema.js";
import Teacher from "../../Models/TeacherSchema.js";

export const getTeachers = async (req, res, next) => {
    try {
        const teachers = await Teacher.aggregate([
            {
                $match: { isBlocked: false } // Only get teachers who aren't blocked
            },
            {
                $project: {
                    teacherId: "$_id",               // Rename _id to studentId
                    teacherInfo: {
                        fullName: "$fullName",
                        teacherImage: {
                            $cond: { if: "$teacherImage", then: "$teacherImage.url", else: null }
                        }
                    }
                }
            }
        ]);
        if (teachers || teachers.length !== 0) {
            return res.status(200).json(teachers)
        } else {
            return res.status(404).json("No Teachers found")
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}


export const getChatList = async (req, res, next) => {
    try {
        const studentId = new mongoose.Types.ObjectId(req.params.id);

        console.log(studentId);

        const chatList = await Chat.aggregate([
            {
                $match: {
                    participants: studentId
                }
            },
            {
                $project: {
                    teacherId: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$participants",
                                    as: "participant",
                                    cond: { $ne: ["$$participant", studentId] }
                                }
                            },
                            0
                        ]
                    },
                    messages: 1   // Adding messages for the chat between the two participants
                }
            },
            {
                $lookup: {
                    from: "teachers",       // Assuming 'students' is the name of the students collection
                    localField: "teacherId",
                    foreignField: "_id",
                    as: "teacherInfo"
                }
            },
            {
                $unwind: "$teacherInfo"  // Flatten the resulting studentInfo array for easier access
            },
            {
                $project: {
                    teacherId: 1,
                    messages: 1,
                    "teacherInfo.fullName": 1,
                    "teacherInfo.teacherImage": {
                        $cond: { if: "$teacherInfo.teacherImage", then: "$teacherInfo.teacherImage.url", else: null }
                    }
                }
            }
        ]);

        return res.status(200).json(chatList);
    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}
