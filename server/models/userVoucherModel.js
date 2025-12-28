import mongoose from 'mongoose';

const userVoucherSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'voucher', required: true },
    status: { type: String, enum: ['saved', 'used', 'expired'], default: 'saved' },
    savedAt: { type: Date, default: Date.now },
    usedAt: { type: Date },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order' }
});

const userVoucherModel = mongoose.models.userVoucher || mongoose.model('userVoucher', userVoucherSchema);

export default userVoucherModel;
