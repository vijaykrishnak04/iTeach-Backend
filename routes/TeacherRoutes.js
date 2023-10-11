import express from 'express';
import verifyToken from '../Middlewares/Authorization.js'
import { changePassword, editProfile, login } from '../controllers/Teacher/Teacher.js'
import { uploadFiles } from '../config/cloudinary.js';
import { getChatList } from '../controllers/Teacher/ChatController.js';
import { addChapter, editChapter, getClassById, getClasses } from '../controllers/Teacher/ClassController.js';
import { cancelExam, createExam, getExams } from '../controllers/Teacher/ExamController.js';
import { addSchedule, deleteSchedule, getSchedules, getTodaySchedule } from '../controllers/Teacher/ScheduleController.js';
import { blockStudent, getStudents, getStudentsByIds, unblockStudent } from '../controllers/Teacher/StudentController.js';
const TeacherRouter = express.Router()

TeacherRouter.post('/login', login)
TeacherRouter.post('/edit-profile', verifyToken.verifyTeacherToken, uploadFiles, editProfile)
TeacherRouter.put('/change-password/:id', verifyToken.verifyTeacherToken, changePassword)
//classes
TeacherRouter.get('/get-classes', verifyToken.verifyTeacherToken, getClasses)
TeacherRouter.get('/get-class/:id', verifyToken.verifyTeacherToken, getClassById)
TeacherRouter.post('/add-chapter', verifyToken.verifyTeacherToken, uploadFiles, addChapter)
TeacherRouter.patch('/edit-chapter', verifyToken.verifyTeacherToken, uploadFiles, editChapter)

//exam
TeacherRouter.post('/create-exam', verifyToken.verifyTeacherToken, createExam)
TeacherRouter.get('/get-exams', verifyToken.verifyTeacherToken, getExams)
TeacherRouter.delete('/cancel-exam/:id', verifyToken.verifyTeacherToken, cancelExam)

//student
TeacherRouter.get('/get-students', verifyToken.verifyTeacherToken, getStudentsByIds)
TeacherRouter.get('/get-all-students', verifyToken.verifyTeacherToken, getStudents)
TeacherRouter.patch('/remove-student-from-class/:id', verifyToken.verifyTeacherToken, getStudents)
TeacherRouter.patch('/block-student', verifyToken.verifyTeacherToken, blockStudent)
TeacherRouter.patch('/unblock-student', verifyToken.verifyTeacherToken, unblockStudent)


// Chats related routes
TeacherRouter.get('/chat/:id', getChatList)

//schedules related 
TeacherRouter.get('/get-schedules', verifyToken.verifyTeacherToken, getSchedules)
TeacherRouter.post('/add-schedule', verifyToken.verifyTeacherToken, addSchedule)
TeacherRouter.delete('/delete-schedule/:id', verifyToken.verifyTeacherToken, deleteSchedule)
TeacherRouter.get('/get-today-schedules', verifyToken.verifyTeacherToken, getTodaySchedule)

export default TeacherRouter