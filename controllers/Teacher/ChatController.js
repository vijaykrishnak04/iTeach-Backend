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
          updatedAt: -1
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
          messages: 1 
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      {
        $unwind: "$studentInfo" 
      },
      {
        $project: {
          studentId: 1,
          messages: 1,
          "studentInfo.fullName": 1,
          "studentInfo.studentImage": {
            $cond: {
              if: "$studentInfo.studentImage",
              then: "$studentInfo.studentImage.url",
              else: null
            }
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