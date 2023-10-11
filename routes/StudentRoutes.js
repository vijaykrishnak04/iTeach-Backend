import express from 'express';
import verifyToken from '../Middlewares/Authorization.js'
import { OtpVerification, changePassword, checkIfStudentHasEnrolled, editStudent, forgotChangePassword, forgotPassword, getStudentById } from '../controllers/Student/Student.js';
import { uploadFiles } from '../config/cloudinary.js';
import { getCourse, getCourses, getPurchasedCourses } from '../controllers/Student/CourseController.js';
import { getClasses } from '../controllers/Student/ClassController.js';
import { createOrder, verifyPayment } from '../controllers/Student/PaymentController.js';
import { getExamsByIds, validateExam } from '../controllers/Student/ExamController.js';
import { getChatList, getTeachers } from '../controllers/Student/ChatController.js';
import { getSchedules, getTodaySchedules } from '../controllers/Student/ScheduleController.js';
const StudentRouter = express.Router()

StudentRouter.get('/get-student/:id', verifyToken.verifyTokenStudent, getStudentById)
StudentRouter.put('/edit-student/:id', verifyToken.verifyTokenStudent, uploadFiles, editStudent)
StudentRouter.put('/change-password/:id', verifyToken.verifyTokenStudent, changePassword)
StudentRouter.get('/forgot-password/:email', forgotPassword)
StudentRouter.post('/forgot-password-otp', OtpVerification )
StudentRouter.put('/forgot-change-password/:email',forgotChangePassword)
//course
StudentRouter.get('/get-courses/:id', verifyToken.verifyTokenStudent, getCourses)
StudentRouter.get('/get-purchased-courses/:id', verifyToken.verifyTokenStudent, getPurchasedCourses)
StudentRouter.get('/get-course/:id', verifyToken.verifyTokenStudent, getCourse)

//class
StudentRouter.get('/get-classes', verifyToken.verifyTokenStudent, getClasses)
StudentRouter.get('/student-enrolled/:id', verifyToken.verifyTokenStudent, checkIfStudentHasEnrolled)

//payment
StudentRouter.post('/create-order', verifyToken.verifyTokenStudent, createOrder);
StudentRouter.post('/verify-payment', verifyToken.verifyTokenStudent, verifyPayment);

//exams
StudentRouter.get('/get-exams', verifyToken.verifyTokenStudent, getExamsByIds)
StudentRouter.post('/validate-exam/:id', verifyToken.verifyTokenStudent, validateExam)

//chats 
StudentRouter.get('/get-teachers', verifyToken.verifyTokenStudent, getTeachers)
StudentRouter.get('/chat/:id',verifyToken.verifyTokenStudent, getChatList)

//schedule
StudentRouter.get('/get-schedules', verifyToken.verifyTokenStudent, getSchedules)
StudentRouter.get('/get-today-schedules/:id', verifyToken.verifyTokenStudent, getTodaySchedules)

export default StudentRouter