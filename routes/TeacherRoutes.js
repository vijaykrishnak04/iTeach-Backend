import express from 'express';
import verifyToken from '../Middlewares/Authorization.js'
import { login } from '../controllers/Teacher/Teacher.js'
const TeacherRouter = express.Router()

TeacherRouter.post('/login', login)

export default TeacherRouter