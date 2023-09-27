import mongoose from "mongoose";
import Chat from "../../Models/ChatSchema.js";



export const getChatList = async (req, res, next) => {
    try {
      const teacherId = new mongoose.Types.ObjectId(req.params.id);
  
      const chatList = await Chat.aggregate([
        {
          $match: {
            participants: teacherId
          }
        },
        {
          $sort: {
            updatedAt: -1   // Sort by updatedAt in descending order (most recent first)
          }
        },
        {
          $project: {
            studentId: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$participants",
                    as: "participant",
                    cond: { $ne: ["$$participant", teacherId] }
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
            from: "students",       // Assuming 'students' is the name of the students collection
            localField: "studentId",
            foreignField: "_id",
            as: "studentInfo"
          }
        },
        {
          $unwind: "$studentInfo"  // Flatten the resulting studentInfo array for easier access
        },
        {
          $project: {
            studentId: 1,
            messages: 1,
            "studentInfo.fullName": 1,
            "studentInfo.studentImage": {
              $cond: { if: "$studentInfo.studentImage", then: "$studentInfo.studentImage.url", else: null }
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