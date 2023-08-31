import express from 'express';
import verifyToken from '../Middlewares/Authorization.js'
import { addChapter, editChapter, getClassById, getClasses, login } from '../controllers/Teacher/Teacher.js'
import { uploadFiles } from '../config/cloudinary.js';
const TeacherRouter = express.Router()

TeacherRouter.post('/login', login)

//classes
TeacherRouter.get('/get-classes',verifyToken.verifyTeacherToken, getClasses)
TeacherRouter.get('/get-class/:id',verifyToken.verifyTeacherToken, getClassById)
TeacherRouter.post('/add-chapter',verifyToken.verifyTeacherToken,uploadFiles, addChapter)
TeacherRouter.patch('/edit-chapter',verifyToken.verifyTeacherToken,uploadFiles, editChapter)


export default TeacherRouter