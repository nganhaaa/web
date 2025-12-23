import express from 'express';
import { getVouchers, getVoucherById, createVoucher, updateVoucher, deleteVoucher } from '../controllers/voucherController.js';
import { saveVoucher, unsaveVoucher, getSavedVouchers } from '../controllers/voucherController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getVouchers).post(protect, createVoucher);
router
  .route('/:id')
  .get(getVoucherById)
  .put(protect, updateVoucher)
  .delete(protect, deleteVoucher);

router.post('/:voucherId/save', protect, saveVoucher);
router.delete('/:voucherId/save', protect, unsaveVoucher);
router.get('/saved', protect, getSavedVouchers);

export default router;
