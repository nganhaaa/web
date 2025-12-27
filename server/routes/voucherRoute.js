import express from 'express';
import {
    getAllVouchers,
    saveVoucher,
    getUserVouchers,
    validateVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    listVouchers
} from '../controllers/voucherController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const voucherRouter = express.Router();

// Public routes
voucherRouter.get('/all', getAllVouchers);
voucherRouter.post('/validate', validateVoucher);

// User routes
voucherRouter.post('/save', authUser, saveVoucher);
voucherRouter.post('/user', authUser, getUserVouchers);

// Admin routes
voucherRouter.post('/create', adminAuth, createVoucher);
voucherRouter.put('/update', adminAuth, updateVoucher);
voucherRouter.delete('/delete', adminAuth, deleteVoucher);
voucherRouter.get('/list', adminAuth, listVouchers);

export default voucherRouter;
