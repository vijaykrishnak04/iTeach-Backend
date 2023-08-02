import express from 'express';
import {
    login, addTeacher
} from '../controllers/Admin/Admin.js';
//import verifyToken from '../middlewares/Authorization.js'

const AdminRouter = express.Router();

AdminRouter.post('/login', login);
AdminRouter.post('/add-teacher',addTeacher)



export default AdminRouter;