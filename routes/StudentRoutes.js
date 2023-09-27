import express from 'express';
import verifyToken from '../Middlewares/Authorization.js'
import { checkIfStudentHasEnrolled, editStudent, getStudentById } from '../controllers/Student/Student.js';
import { uploadFiles } from '../config/cloudinary.js';
import { getCourse, getCourses } from '../controllers/Student/CourseController.js';
import { getClasses } from '../controllers/Student/ClassController.js';
import { createOrder, verifyPayment } from '../controllers/Student/PaymentController.js';
import { getExamsByIds, validateExam } from '../controllers/Student/ExamController.js';
import { getChatList, getTeachers } from '../controllers/Student/ChatController.js';
import { getSchedules } from '../controllers/Student/ScheduleController.js';
import { getTodaySchedule } from '../controllers/Teacher/ScheduleController.js';
const StudentRouter = express.Router()

StudentRouter.get('/get-student/:id', verifyToken.verifyTokenStudent, getStudentById)
StudentRouter.put('/edit-student/:id', verifyToken.verifyTokenStudent, uploadFiles, editStudent)

//course
StudentRouter.get('/get-courses', verifyToken.verifyTokenStudent, getCourses)
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
StudentRouter.get('/chat/:id', getChatList)

//schedule
StudentRouter.get('/get-schedules', verifyToken.verifyTokenStudent, getSchedules)
StudentRouter.get('/get-today-schedules', verifyToken.verifyTokenStudent, getTodaySchedule)

export default StudentRouter