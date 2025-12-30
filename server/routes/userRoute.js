import express from 'express';
import { 
    loginUser, 
    registerUser, 
    loginAdmin,
    createAdmin,
    listAdmins,
    listAllUsers
} from '../controllers/userController.js';
import { googleLogin, googleLoginAdmin } from '../controllers/googleAuthController.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);
userRouter.post('/admin', loginAdmin);

// Google OAuth routes
userRouter.post('/google-login', googleLogin);
userRouter.post('/google-login-admin', googleLoginAdmin);

// Admin only routes
userRouter.post('/create-admin', adminAuth, createAdmin);
userRouter.get('/list-admins', adminAuth, listAdmins);
userRouter.get('/list-users', adminAuth, listAllUsers);

export default userRouter;