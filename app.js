import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from 'morgan';
import http from 'http';
import dbConnect from './config/dbConnection.js';
import initSocketIO from './helpers/socket.js'; // Path to the socket.js file
import LandingPageRouter from './routes/LandingPageRoutes.js';
import AdminRoutes from './routes/AdminRoutes.js';
import TeacherRoutes from './routes/TeacherRoutes.js';
import StudentRoutes from './routes/StudentRoutes.js';

const app = express();

dotenv.config();
dbConnect();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cors options
const corsOptions = {
  origin: 'https://i-teach.netlify.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use("/api", LandingPageRouter);
app.use("/api/admin", AdminRoutes);
app.use("/api/teacher", TeacherRoutes);
app.use("/api/student", StudentRoutes);

const server = http.createServer(app);

initSocketIO(server); // Initialize socket.io with the server instance

server.listen(process.env.PORT_NO, (error) => {
  if (error) {
    console.error('Error starting the server:', error);
  } else {
    console.log('Server started on port', process.env.PORT_NO);
  }
});
