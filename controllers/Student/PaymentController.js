import { addOrChangeClass } from "./ClassController.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from "dotenv";


dotenv.config();

const razorInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

export const createOrder = async (req, res, next) => {
    try {
        const options = {
            amount: req.body.amount,  // in the smallest currency unit
            currency: "INR",
            receipt: "receipt#1",
            payment_capture: '1'
        };

        const response = await razorInstance.orders.create(options);
        return res.json({
            orderId: response.id
        });
    } catch (error) {
        console.error("Error in creating order: ", error);
        return res.status(500).json({ message: 'Error creating order' });
    }
};




export const verifyPayment = (req, res, next) => {
    try {
        const { paymentId, orderId, signature, classId, studentId } = req.body;
        console.log(req.body);
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest('hex');

        if (generatedSignature === signature) {
            addOrChangeClass(studentId, classId, res);

        } else {
            return res.status(400).json({ message: 'Payment verification failed' });
        }


    } catch (error) {
        console.error("Error in payment verification: ", error);
        return res.status(500).json({ message: 'Error payment verification' });
    }

};