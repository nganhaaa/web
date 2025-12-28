import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: String, enum: ['Men', 'Women', 'Kids', 'All'] }],
    createdAt: { type: Date, default: Date.now }
});

const voucherModel = mongoose.models.voucher || mongoose.model('voucher', voucherSchema);

export default voucherModel;
