import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from 'morgan';
import dbConnect from './config/dbConnection.js';
import LandingPageRouter from './routes/LandingPageRoutes.js'
import AdminRoutes from './routes/AdminRoutes.js';

const app = express();

dotenv.config();
dbConnect();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use(errorHandler);
app.use(
  cors()
);

app.use("/api",LandingPageRouter)
app.use("/api/admin",AdminRoutes)

app.listen(process.env.PORT_NO, (error) => {
  if (error) {
    console.error('Error starting the server:', error);
  } else {
    console.log('Server started on port', process.env.PORT_NO);
  }
});