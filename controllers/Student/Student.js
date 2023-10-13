
import Student from "../../Models/StudentSchema.js";
import bcrypt from 'bcrypt';
import { deleteFiles } from "../../config/cloudinary.js";
import { sendMail } from "../../helpers/mailer.js";
import Otp from "../../Models/OtpSchema.js";
import xss from "xss";
import validator from "validator";

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







export const checkIfStudentHasEnrolled = async (req, res, next) => {
    try {
        // Extracting the student's _id from the request parameters
        const { id } = req.params;

        // Finding the student using the _id
        const student = await Student.findById(id).populate('classRef.class')
        if (student?.classRef?.class) {
            return res.status(200).json({ success: true, data: student.classRef.class });
        } else {
            return res.status(200).json({ success: false })
        }


    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const editStudent = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validator.isMongoId(id)) {
            return res.status(400).json('Invalid Id');
        }

        const { 0: { filename = null, path = null } = {} } = req.files || {};
        const studentImage = (filename && path) ? { public_id: filename, url: path } : null;

        let updateFields = {};

        if (studentImage) {
            updateFields.studentImage = studentImage;
        }

        if (req.body.public_id) {
            await deleteFiles([req.body.public_id]);
        }

        if (req.body.name) updateFields.fullName = xss(req.body.name);
        if (req.body.email) updateFields.email = xss(req.body.email);
        if (req.body.phoneNumber) updateFields.phoneNumber = xss(req.body.phoneNumber);
        if (req.body.classRef) updateFields.classRef = xss(req.body.classRef);
        if (req.body.gender) updateFields.gender = xss(req.body.gender);
        if (req.body.dateOfBirth) updateFields.dateOfBirth = xss(req.body.dateOfBirth);
        if (req.body.address) updateFields.address = xss(req.body.address);

        const updatedStudent = await Student.findOneAndUpdate(
            { _id: id }, // find a document with that matches this filter
            { $set: updateFields }, // apply these updates
            { new: true, runValidators: true } // options: return the new version of the document and run model validations
        );

        if (!updatedStudent) {
            return res.status(404).json('No student was updated, possibly because the student was not found or no new data was provided.');
        }

        return res.status(200).json({ success: true, student: updatedStudent });


    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};


export const changePassword = async (req, res, next) => {
    try {
        // Getting the student's _id and credentials from the request
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Find the student using the _id
        const student = await Student.findById(id);

        // If student is not found, return an error
        if (!student) {
            return res.status(404).json('Student not found');
        }

        // Check if the currentPassword matches the stored hash
        const isMatch = await bcrypt.compare(currentPassword, student.password);

        if (!isMatch) {
            return res.status(400).json('Incorrect current password');
        }

        // New password and current password should not be the same
        if (newPassword === currentPassword) {
            return res.status(400).json('New password should be different from the current password');
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        student.password = hashedNewPassword;

        // Save the updated student record to the database
        await student.save();

        return res.status(200).json('Password changed successfully');

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.params;
        console.log("bruhh is here");
        // Find the student using the email
        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(404).json('User with this email not found');
        }

        await sendMail(email, student.fullName)
        return res.status(200).json('Reset password link sent successfully');

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};

export const OtpVerification = async (req, res, next) => {
    try {
        const { StudentAuth, otp } = req.body;
        const email = StudentAuth
        console.log(req.body);
        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ error: 'Invalid OTP format' });
        }

        // Find OTP record using email
        const otpRecord = await Otp.findOne({ email });
        console.log(otpRecord);
        // Check if OTP record exists and is valid
        if (!otpRecord || Date.now() > otpRecord.expirationTime) {
            return res.status(400).json({ error: 'OTP has expired or does not exist' });
        }

        // Check if provided OTP matches the OTP from the database
        if (Number(otp) !== Number(otpRecord.otp)) {
            return res.status(400).json({ error: 'Incorrect OTP' });
        }

        // Delete the OTP record as it's no longer needed
        await Otp.deleteOne({ email });

        return res.status(200).json({ message: "proceed to change password" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const forgotChangePassword = async (req, res, next) => {
    try {
        // Getting the student's _id and credentials from the request
        const { email } = req.params;
        const { newPassword } = req.body;

        // Find the student using the _id
        const student = await Student.findOne({ email: email });

        // If student is not found, return an error
        if (!student) {
            return res.status(404).json('Student not found');
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        student.password = hashedNewPassword;

        // Save the updated student record to the database
        await student.save();

        return res.status(200).json('Password changed successfully');

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};
