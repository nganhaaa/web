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
        
        // PRIZES array matching frontend (MUST BE IDENTICAL)
        const PRIZES = [
            { label: '10%', discount: 10, probability: 2 },   // index 0
            { label: '5%', discount: 5, probability: 8 },     // index 1
            { label: '2%', discount: 2, probability: 20 },    // index 2
            { label: '1%', discount: 1, probability: 30 },    // index 3
            { label: 'Try Again', discount: 0, probability: 10 }, // index 4
            { label: '10%', discount: 10, probability: 0 },   // index 5 (duplicate, won't be selected)
            { label: '2%', discount: 2, probability: 0 },     // index 6 (duplicate, won't be selected)
            { label: 'Try Again', discount: 0, probability: 30 }, // index 7
        ];
        
        // Create weighted array for random selection
        const weightedPrizes = [];
        PRIZES.forEach((prize, index) => {
            for (let i = 0; i < prize.probability; i++) {
                weightedPrizes.push(index);
            }
        });
        
        // Random selection
        const randomIndex = weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)];
        const selectedPrize = PRIZES[randomIndex];
        
        let result = {
            index: randomIndex, // IMPORTANT: Return index for frontend
            discount: selectedPrize.discount
        };
        
        if (selectedPrize.discount === 0) {
            result.type = 'nothing';
            result.message = '😢 Better luck next time!';
        } else {
            result.type = 'voucher';
            result.message = `🎉 You won ${selectedPrize.discount}% OFF!`;
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

// ⚠️ QUAN TRỌNG: Phải có export ở cuối file
export {
    checkSpinStatus,
    spinWheel
};