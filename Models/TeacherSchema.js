import mongoose from "mongoose";
const teacherSchema = new mongoose.Schema(
    {
        fullName: {
            type: String
        },
        email: {
            type: String,
            unique: true
        },
        qualification: {
            type: String,
            required: true
        },
        teacherImage: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        password: {
            type: String
        },
        subject: {
            type: String
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    }
)

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;