import { addOrChangeClass } from "./ClassController.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from "dotenv";
import { purchaseCourse } from "./CourseController.js";
import Payment from "../../Models/PaymentSchema.js";


dotenv.config();

const razorInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

const convertToDecimal = (amountInCents) => {
    return (amountInCents / 100).toFixed(2);
  };
  

export const createOrder = async (req, res, next) => {
    try {
        const options = {
            amount: req.body.amount,  // in the smallest currency unit
            currency: "INR",
            receipt: "receipt#1",
            payment_capture: '1'
        };

        const response = await razorInstance.orders.create(options);
        const convertedAmount = convertToDecimal(req.body.amount);

        const newPayment = new Payment({
            Amount: convertedAmount,
            orderId: response.id,
            verified: false 
        });
        await newPayment.save();
        return res.json({
            orderId: response.id
        });
    } catch (error) {
        console.error("Error in creating order: ", error);
        return res.status(500).json({ message: 'Error creating order' });
    }
};




export const verifyPayment = async (req, res, next) => {
    try {
        const { paymentId, orderId, signature, classId, studentId, courseId } = req.body;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest('hex');
        const paymentRecord = await Payment.findOne({ orderId });
        if (generatedSignature === signature) {
            paymentRecord.verified = true;  // set verified to true
            paymentRecord.paymentId = paymentId;
            paymentRecord.signature = signature;
            paymentRecord.classId = classId;
            paymentRecord.courseId = courseId;
            paymentRecord.studentId = studentId;
            await paymentRecord.save();

            if (courseId) {
                const course = await purchaseCourse(studentId, courseId);
                return res.status(200).json({ success: true, message: "Course purchased successfully", course });
            }
            if (classId) {
                const updatedStudent = await addOrChangeClass(studentId, classId);
                return res.status(200).json({ success: true, message: "Class added/changed successfully", updatedStudent });
            }

            return res.status(400).json({ message: 'No classId or courseId provided' });

        } else {
            const failedPayment = new Payment({
                paymentId,
                orderId,
                signature,
                classId,
                studentId,
                courseId,
                verified: false
            });
            await failedPayment.save();
            return res.status(400).json({ message: 'Payment verification failed' });
        }


    } catch (error) {
        console.error("Error in payment verification: ", error);
        return res.status(500).json({ message: 'Error payment verification' });
    }
};