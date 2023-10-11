import express from "express";
import {
    signup, OtpVerification, login, getBanners, getCourses, getTutors, getPricing
} from '../controllers/Landing/index.js';

const LandingPageRouter = express.Router();



LandingPageRouter.post('/signup', signup)

LandingPageRouter.post('/otp', OtpVerification)

LandingPageRouter.post('/login', login)

LandingPageRouter.get('/get-banners', getBanners)

LandingPageRouter.get('/get-courses', getCourses)

LandingPageRouter.get('/get-tutors', getTutors)


LandingPageRouter.get('/get-pricing', getPricing)








export default LandingPageRouter