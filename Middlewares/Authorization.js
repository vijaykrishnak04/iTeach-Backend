import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Student from '../Models/StudentSchema.js';
import Teacher from '../Models/TeacherSchema.js';

dotenv.config();

const verifyToken = (role) => {
    return async (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing!' });
        }

        let secret;
        switch (role) {
            case 'admin':
                secret = process.env.ADMIN_SECRET;
                break;
            case 'teacher':
                secret = process.env.JWT_SECRET;
                break;
            case 'student':
                secret = process.env.USER_SECRET_KEY;
                break;
            default:
                return res.status(401).json({ message: 'Invalid role specified for token verification.' });
        }

        try {
            const decoded = jwt.verify(token.split(' ')[1], secret);
            if (role === 'student') {
                const student = await Student.findById(decoded.id);  // Replace with your correct ID field
                if (student && student.isBlocked) {
                    return res.status(401).json({ message: 'This student is blocked.' });
                }
            }
            if (role === 'teacher') {
                const teacher = await Teacher.findById(decoded._id);  // Replace with your correct ID field
                if (teacher && teacher.isBlocked) {
                    return res.status(401).json({ message: 'This teacher is blocked.' });
                }
            }
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Authorization token has expired!' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid authorization token.' });
            } else {
                return res.status(500).json({ message: 'Internal Server Error.' });
            }
        }
    };
};

export default {
    verifyTokenAdmin: verifyToken('admin'),
    verifyTeacherToken: verifyToken('teacher'),
    verifyTokenStudent: verifyToken('student')
};
