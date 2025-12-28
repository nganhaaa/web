import express from 'express';
import { checkSpinStatus, spinWheel } from '../controllers/spinController.js';
import authUser from '../middleware/auth.js';

const spinRouter = express.Router();

spinRouter.post('/check', authUser, checkSpinStatus);
spinRouter.post('/spin', authUser, spinWheel);

export default spinRouter;
