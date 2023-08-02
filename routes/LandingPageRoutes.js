import express from "express";
import {
    signup, OtpVerification, login
} from '../controllers/Landing/index.js';

const LandingPageRouter = express.Router();



LandingPageRouter.post('/signup', signup)

LandingPageRouter.post('/otp', OtpVerification)

LandingPageRouter.post('/login', login)







export default LandingPageRouter