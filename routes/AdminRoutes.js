import express from 'express';
import {
    login, addTeacher, getTeachers, deleteTeacher, blockTeacher, unblockTeacher, addCourse, getAllCourses, hideCourse, deleteCourse, unhideCourse
} from '../controllers/Admin/Admin.js';
import uploadImage from '../config/cloudinary.js';
import verifyToken from '../Middlewares/Authorization.js'

const AdminRouter = express.Router();

AdminRouter.post('/login', login);
AdminRouter.post('/add-teacher', verifyToken.verifyTokenAdmin, addTeacher)
AdminRouter.get('/get-teachers', verifyToken.verifyTokenAdmin, getTeachers)
AdminRouter.delete('/delete-teacher/:id', verifyToken.verifyTokenAdmin, deleteTeacher)
AdminRouter.patch('/block-teacher/:id', verifyToken.verifyTokenAdmin, blockTeacher)
AdminRouter.patch('/unblock-teacher/:id', verifyToken.verifyTokenAdmin, unblockTeacher);
AdminRouter.post('/add-course', verifyToken.verifyTokenAdmin, uploadImage, addCourse);
AdminRouter.get('/get-courses', verifyToken.verifyTokenAdmin, getAllCourses);
AdminRouter.patch('/hide-course/:id', verifyToken.verifyTokenAdmin, hideCourse);
AdminRouter.patch('/unhide-course/:id', verifyToken.verifyTokenAdmin, unhideCourse);
AdminRouter.delete('/delete-course/:id', verifyToken.verifyTokenAdmin, deleteCourse);







export default AdminRouter;