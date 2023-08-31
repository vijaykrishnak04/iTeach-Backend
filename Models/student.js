
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        }
    },
    { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;