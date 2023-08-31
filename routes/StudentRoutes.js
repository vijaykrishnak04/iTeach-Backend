import express from 'express';
import verifyToken from '../Middlewares/Authorization.js'
import { checkIfStudentHasEnrolled, createOrder, editStudent, getClasses, getCourse, getCourses, getStudentById, verifyPayment } from '../controllers/Student/Student.js';

const StudentRouter = express.Router()

StudentRouter.get('/get-student/:id',verifyToken.verifyTokenStudent, getStudentById)
StudentRouter.put('/edit-student/:id',verifyToken.verifyTokenStudent, editStudent)

//course
StudentRouter.get('/get-courses',verifyToken.verifyTokenStudent, getCourses)
StudentRouter.get('/get-course/:id',verifyToken.verifyTokenStudent, getCourse)

//class
StudentRouter.get('/get-classes',verifyToken.verifyTokenStudent, getClasses)
StudentRouter.get('/student-enrolled/:id',verifyToken.verifyTokenStudent, checkIfStudentHasEnrolled)

//payment
StudentRouter.post('/create-order', verifyToken.verifyTokenStudent, createOrder);
StudentRouter.post('/verify-payment', verifyToken.verifyTokenStudent, verifyPayment);

export default StudentRouter