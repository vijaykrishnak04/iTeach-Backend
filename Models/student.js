
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
            unique:true
        },
        aadharNumber: {
            type: String,
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        isRequested:{
            type:Boolean,
            default:false
        },
        studentImage: {
            public_id: {
              type: String,
            },
            url: {
              type: String,
            },
          },
        parentName: {
            type: String,
        },
        parentMobileNumber: {
            type: Number,
        },
        address: {
            houseName: {
                type: String,
            },
            area: {
                type: String,
            },
            landMark: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            country: {
                type: String,
            },
            pincode: {
                type: Number,
            },
        },
        isSignUpWithGoogle:{
            type:Boolean
        },
        image: {
            url: {
                type: String,
            },
            publicId: {
                type: String,
            },
        },
        dateOfAdmission: {
            type: Date,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },
        rejectedReason: {
            type: String,
            default: "none"
        },
        isProfile:{
            type:String,
            default:'notCompleted'
        }
    },
    { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;