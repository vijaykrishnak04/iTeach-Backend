import express from "express";
import {
    signup, OtpVerification, login, getBanners, getCourses, getTutors
} from '../controllers/Landing/index.js';

const LandingPageRouter = express.Router();



LandingPageRouter.post('/signup', signup)

LandingPageRouter.post('/otp', OtpVerification)

LandingPageRouter.post('/login', login)

LandingPageRouter.get('/get-banners', getBanners)

LandingPageRouter.get('/get-courses', getCourses)

LandingPageRouter.get('/get-tutors', getTutors)








export default LandingPageRouter