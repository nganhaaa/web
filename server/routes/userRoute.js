import express from 'express';
import {loginUser, registerUser, loginAdmin} from '../controllers/userController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const userRouter = express.Router();

userRouter.post('/login', authLimiter, loginUser);
userRouter.post('/register', authLimiter, registerUser);
userRouter.post('/admin', authLimiter, loginAdmin);

export default userRouter;