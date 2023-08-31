import Course from "../../Models/course.js"
import Student from "../../Models/student.js";
import Class from "../../Models/ClassSchema.js"
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config();

const razorInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});


export const getStudentById = async (req, res, next) => {
    try {
        // Getting the student's _id from the request parameters
        const { id } = req.params;

        // Finding the student using the _id and populating classRef
        const student = await Student.findById(id);
        // Checking if the student exists
        if (!student) {
            return res.status(404).json('Student not found');
        } else {
            return res.status(200).json(student);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}


export const getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ isHidden: false });
        if (!courses || courses.length === 0) {
            return res.status(409).json('no data found');
        } else {
            return res.status(200).json(courses);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}

export const getCourse = async (req, res, next) => {
    try {
        const id = req.params.id
        const course = await Course.findOne({ _id: id }, { isHidden: false });
        if (!course) {
            return res.status(409).json('no course data found');
        } else {
            return res.status(200).json(course);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}


export const getClasses = async (req, res, next) => {
    try {
        const classes = await Class.find();
        if (!classes || classes.length === 0) {
            return res.status(409).json('no data found');
        } else {
            return res.status(200).json(classes);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}

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
    const { paymentId, orderId, signature, classId, studentId } = req.body;
    console.log(req.body);
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(orderId + "|" + paymentId)
        .digest('hex');

    if (generatedSignature === signature) {
        Student.findByIdAndUpdate(studentId, { classRef: classId }, { new: true })
            .then(updatedStudent => {
                if (!updatedStudent) {
                    return res.status(404).json({ success: false, message: 'Student not found' });
                }

                // Now update the Class with the studentId
                return Class.findByIdAndUpdate(classId, { $push: { students: studentId } }, { new: true })
                    .then(updatedClass => {
                        if (!updatedClass) {
                            return res.status(404).json({ success: false, message: 'Class not found' });
                        }
                        return res.json({ success: true, updatedStudent });
                    });
            })
            .catch(err => {
                return res.status(500).json({ success: false, message: err.message });
            });

    } else {
        return res.status(400).json({ message: 'Payment verification failed' });
    }

};

export const checkIfStudentHasEnrolled = async (req, res, next) => {
    try {
        // Extracting the student's _id from the request parameters
        const { id } = req.params;

        // Finding the student using the _id
        const student = await Student.findById(id).populate('classRef')

        if (student.classRef) {
            return res.status(200).json({ success: true, data: student.classRef });
        } else {
            return res.status(404).json({ success: false })
        }


    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const editStudent = async (req, res, next) => {
    try {
        // Getting the student's _id from the request parameters
        const { id } = req.params;

        console.log(req.body);

        // Find the student using the _id and update the record
        const student = await Student.findByIdAndUpdate(id, req.body, {
            new: true, // this ensures the updated document is returned
            runValidators: true // this ensures all model validations run on update
        });

        // If findByIdAndUpdate doesn't find the document, it returns null
        if (!student) {
            return res.status(404).json('Student not found');
        } else {
            return res.status(200).json(student);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}


