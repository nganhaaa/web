import dailySpinModel from '../models/dailySpinModel.js';
import voucherModel from '../models/voucherModel.js';
import userVoucherModel from '../models/userVoucherModel.js';

// Check if user can spin today
const checkSpinStatus = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const userSpin = await dailySpinModel.findOne({ userId });
        
        if (!userSpin) {
            return res.json({ success: true, canSpin: true, message: 'Spin available!' });
        }
        
        const lastSpinDate = new Date(userSpin.lastSpinDate);
        lastSpinDate.setHours(0, 0, 0, 0);
        
        const canSpin = lastSpinDate < today;
        
        res.json({ 
            success: true, 
            canSpin, 
            message: canSpin ? 'Spin available!' : 'Come back tomorrow!' 
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Spin the wheel
const spinWheel = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if already spun today
        const userSpin = await dailySpinModel.findOne({ userId });
        
        if (userSpin) {
            const lastSpinDate = new Date(userSpin.lastSpinDate);
            lastSpinDate.setHours(0, 0, 0, 0);
            
            if (lastSpinDate >= today) {
                return res.json({ 
                    success: false, 
                    message: 'You already spun today! Come back tomorrow 🎁' 
                });
            }
        }
        
        // Random spin result with weighted probability
        // 40% - Better luck next time
        // 30% - 1% OFF
        // 20% - 2% OFF
        // 8% - 5% OFF
        // 2% - 10% OFF
        const random = Math.random() * 100;
        let result;
        
        if (random < 40) {
            result = { type: 'nothing', discount: 0, message: '😢 Better luck next time!' };
        } else if (random < 70) {
            result = { type: 'voucher', discount: 1, message: '🎉 You won 1% OFF!' };
        } else if (random < 90) {
            result = { type: 'voucher', discount: 2, message: '🎉 You won 2% OFF!' };
        } else if (random < 98) {
            result = { type: 'voucher', discount: 5, message: '🎊 Amazing! You won 5% OFF!' };
        } else {
            result = { type: 'voucher', discount: 10, message: '🎁 JACKPOT! You won 10% OFF!' };
        }
        
        // Update or create spin record
        if (userSpin) {
            userSpin.lastSpinDate = new Date();
            userSpin.spinCount += 1;
            await userSpin.save();
        } else {
            await dailySpinModel.create({
                userId,
                lastSpinDate: new Date(),
                spinCount: 1
            });
        }
        
        // Create voucher if won
        if (result.type === 'voucher') {
            const voucherCode = `SPIN${result.discount}P-${Date.now().toString().slice(-6)}`;
            
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            
            const voucher = await voucherModel.create({
                code: voucherCode,
                description: `Daily Spin ${result.discount}% Discount - Valid Today Only!`,
                discountType: 'percentage',
                discountValue: result.discount,
                minOrderAmount: 0,
                usageLimit: 1,
                usedCount: 0,
                startDate: new Date(),
                expiryDate: endOfDay,
                isActive: true,
                applicableCategories: ['All']
            });
            
            // Auto-save voucher to user
            await userVoucherModel.create({
                userId,
                voucherId: voucher._id,
                status: 'saved'
            });
            
            result.voucherCode = voucherCode;
            result.voucherId = voucher._id;
        }
        
        res.json({ success: true, result });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    checkSpinStatus,
    spinWheel
};
