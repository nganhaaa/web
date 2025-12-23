import voucherModel from '../models/voucherModel.js';
import userVoucherModel from '../models/userVoucherModel.js';

// Get all active vouchers (public)
const getAllVouchers = async (req, res) => {
    try {
        const now = new Date();
        const vouchers = await voucherModel.find({
            isActive: true,
            startDate: { $lte: now },
            expiryDate: { $gte: now },
            $expr: { $lt: ['$usedCount', '$usageLimit'] }
        }).sort({ createdAt: -1 });
        res.json({ success: true, vouchers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Save voucher to user account
const saveVoucher = async (req, res) => {
    try {
        const { voucherId } = req.body;
        const userId = req.body.userId; // from authUser middleware

        const voucher = await voucherModel.findById(voucherId);
        if (!voucher) {
            return res.json({ success: false, message: 'Voucher not found' });
        }

        const now = new Date();
        if (voucher.expiryDate < now) {
            return res.json({ success: false, message: 'Voucher expired' });
        }

        const existing = await userVoucherModel.findOne({ userId, voucherId });
        if (existing) {
            return res.json({ success: false, message: 'Voucher already saved' });
        }

        const userVoucher = new userVoucherModel({ userId, voucherId, status: 'saved' });
        await userVoucher.save();

        res.json({ success: true, message: 'Voucher saved successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's vouchers with status
const getUserVouchers = async (req, res) => {
    try {
        const userId = req.body.userId; // from authUser middleware
        const now = new Date();

        const userVouchers = await userVoucherModel.find({ userId })
            .populate('voucherId')
            .sort({ savedAt: -1 });

        // Update expired and inactive vouchers
        for (let uv of userVouchers) {
            if (uv.voucherId) {
                // Check if voucher is inactive or expired
                if (!uv.voucherId.isActive || uv.voucherId.expiryDate < now) {
                    if (uv.status === 'saved') {
                        uv.status = 'expired';
                        await uv.save();
                    }
                }
            }
        }

        const active = userVouchers.filter(uv => 
            uv.status === 'saved' && 
            uv.voucherId && 
            uv.voucherId.isActive &&
            uv.voucherId.expiryDate >= now
        );
        const used = userVouchers.filter(uv => uv.status === 'used' && uv.voucherId);
        const expired = userVouchers.filter(uv => 
            (uv.status === 'expired' && uv.voucherId) ||
            (uv.voucherId && (!uv.voucherId.isActive || uv.voucherId.expiryDate < now))
        );

        res.json({ success: true, active, used, expired });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Validate voucher - supports both cart and order validation
const validateVoucher = async (req, res) => {
    try {
        const { code, cartTotal, categories } = req.body;

        const voucher = await voucherModel.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            return res.json({ success: false, message: 'Invalid voucher code' });
        }

        if (!voucher.isActive) {
            return res.json({ success: false, message: 'This voucher is no longer active' });
        }

        const now = new Date();
        if (now > new Date(voucher.expiryDate)) {
            return res.json({ success: false, message: 'This voucher has expired' });
        }

        if (now < new Date(voucher.startDate)) {
            return res.json({ success: false, message: 'This voucher is not yet valid' });
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            return res.json({ success: false, message: 'This voucher has reached its usage limit' });
        }

        if (cartTotal < voucher.minOrderAmount) {
            return res.json({ 
                success: false, 
                message: `Minimum order amount of $${voucher.minOrderAmount} required` 
            });
        }

        // Check category applicability
        if (!voucher.applicableCategories.includes('All')) {
            const hasValidCategory = categories.some(cat => 
                voucher.applicableCategories.includes(cat)
            );
            if (!hasValidCategory) {
                return res.json({ 
                    success: false, 
                    message: 'This voucher is not applicable to your cart items' 
                });
            }
        }

        // Calculate discount
        let discount = 0;
        if (voucher.discountType === 'percentage') {
            discount = (cartTotal * voucher.discountValue) / 100;
            if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
                discount = voucher.maxDiscountAmount;
            }
        } else {
            discount = voucher.discountValue;
        }

        discount = Math.min(discount, cartTotal);

        res.json({ 
            success: true, 
            message: 'Voucher applied successfully!',
            voucher: {
                _id: voucher._id,
                code: voucher.code,
                description: voucher.description,
                discountType: voucher.discountType,
                discountValue: voucher.discountValue,
                discount: discount
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Create voucher
const createVoucher = async (req, res) => {
    try {
        const voucherData = req.body;
        const voucher = new voucherModel(voucherData);
        await voucher.save();
        res.json({ success: true, message: 'Voucher created successfully', voucher });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Update voucher
const updateVoucher = async (req, res) => {
    try {
        const { voucherId, ...updateData } = req.body;
        const voucher = await voucherModel.findByIdAndUpdate(voucherId, updateData, { new: true });
        res.json({ success: true, message: 'Voucher updated successfully', voucher });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Delete voucher
const deleteVoucher = async (req, res) => {
    try {
        const { voucherId } = req.body;
        await voucherModel.findByIdAndDelete(voucherId);
        res.json({ success: true, message: 'Voucher deleted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Get all vouchers
const listVouchers = async (req, res) => {
    try {
        const vouchers = await voucherModel.find().sort({ createdAt: -1 });
        res.json({ success: true, vouchers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    getAllVouchers,
    saveVoucher,
    getUserVouchers,
    validateVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    listVouchers
};
