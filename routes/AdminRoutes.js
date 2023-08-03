import express from 'express';
import {
    login, addTeacher, getTeachers, deleteTeacher, blockTeacher, unblockTeacher
} from '../controllers/Admin/Admin.js';
import verifyToken from '../Middlewares/Authorization.js'

const AdminRouter = express.Router();

AdminRouter.post('/login', login);
AdminRouter.post('/add-teacher',verifyToken.verifyTokenAdmin,addTeacher)
AdminRouter.get('/get-teachers',verifyToken.verifyTokenAdmin,getTeachers)
AdminRouter.delete('/delete-teacher/:id',verifyToken.verifyTokenAdmin,deleteTeacher)
AdminRouter.patch('/block-teacher/:id',verifyToken.verifyTokenAdmin, blockTeacher)
AdminRouter.patch('/unblock-teacher/:id',verifyToken.verifyTokenAdmin, unblockTeacher);




export default AdminRouter;