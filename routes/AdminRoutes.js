import express from 'express';
import {
    login, addTeacher, getTeachers, deleteTeacher, blockTeacher, unblockTeacher, getDashboardData, addBanner, getBanners, deleteBanner
} from '../controllers/Admin/Admin.js';
import verifyToken from '../Middlewares/Authorization.js'
import { uploadFiles } from '../config/cloudinary.js';
import { addCourse, deleteCourse, editCourse, getAllCourses, hideCourse, unhideCourse } from '../controllers/Admin/CourseController.js';
import { addClass, deleteClass, getClasses } from '../controllers/Admin/ClassController.js';

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

//syllabus
AdminRouter.get('/get-syllabus', verifyToken.verifyTokenAdmin, getClasses);
AdminRouter.post('/add-syllabus', verifyToken.verifyTokenAdmin, uploadFiles, addClass);
AdminRouter.delete('/delete-syllabus/:id', verifyToken.verifyTokenAdmin, deleteClass);

//dashboard
AdminRouter.get('/get-dashboard-data', verifyToken.verifyTokenAdmin, getDashboardData)

//
AdminRouter.get('/get-banners', verifyToken.verifyTokenAdmin, getBanners)
AdminRouter.post('/add-banner', verifyToken.verifyTokenAdmin, uploadFiles, addBanner)
AdminRouter.delete('/delete-banner/:id', verifyToken.verifyTokenAdmin, deleteBanner)



export default AdminRouter;