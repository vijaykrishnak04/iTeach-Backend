import express from 'express';
import {
    login, addTeacher, getTeachers, deleteTeacher, blockTeacher, unblockTeacher, addCourse, getAllCourses, hideCourse, deleteCourse, unhideCourse, editCourse
} from '../controllers/Admin/Admin.js';
import verifyToken from '../Middlewares/Authorization.js'
import { uploadFiles } from '../config/cloudinary.js';

const AdminRouter = express.Router();

AdminRouter.post('/login', login);

//teacher
AdminRouter.post('/add-teacher', verifyToken.verifyTokenAdmin, addTeacher)
AdminRouter.get('/get-teachers', verifyToken.verifyTokenAdmin, getTeachers)
AdminRouter.delete('/delete-teacher/:id', verifyToken.verifyTokenAdmin, deleteTeacher)
AdminRouter.patch('/block-teacher/:id', verifyToken.verifyTokenAdmin, blockTeacher)
AdminRouter.patch('/unblock-teacher/:id', verifyToken.verifyTokenAdmin, unblockTeacher);

//course
AdminRouter.post('/add-course', verifyToken.verifyTokenAdmin, uploadFiles, addCourse);
AdminRouter.get('/get-courses', verifyToken.verifyTokenAdmin, getAllCourses);
AdminRouter.patch('/hide-course/:id', verifyToken.verifyTokenAdmin, hideCourse);
AdminRouter.patch('/unhide-course/:id', verifyToken.verifyTokenAdmin, unhideCourse);
AdminRouter.delete('/delete-course/:id', verifyToken.verifyTokenAdmin, deleteCourse);
AdminRouter.put('/edit-course/:id', verifyToken.verifyTokenAdmin, uploadFiles, editCourse);








export default AdminRouter;