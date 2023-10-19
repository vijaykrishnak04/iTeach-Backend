
import mongoose from 'mongoose';
const studentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
        },
        phoneNumber: {
            type: Number,
            unique: true
        },
        aadharNumber: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        studentImage: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
                default: "https://res.cloudinary.com/dgolixx5b/image/upload/v1697729784/i-Teach/user_ikxh4c.png"
            },
        },

        address: {
            type: String
        },
        isSignUpWithGoogle: {
            type: Boolean
        },
        dateOfAdmission: {
            type: Date,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        classRef: {
            class: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class'
            },
            joinedDate: {
                type: Date,
            }
        },
        exam: [{
            _id: {
                type: String,
                required: true
            },
            SubjectName: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            marks: {
                type: String,
                required: true
            }
        }],
        courses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
    },
    { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;