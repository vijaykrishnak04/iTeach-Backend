import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        Amount: {
            type: Number,
            required: true
        },
        paymentId: {
            type: String,
        },
        orderId: {
            type: String,
            required: true
        },
        signature: {
            type: String,
        },
        dateOfPayment: {
            type: Date,
            default: Date.now,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
