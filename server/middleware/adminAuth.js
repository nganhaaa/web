import jwt from 'jsonwebtoken';
import adminModel from '../models/adminModel.js';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({success: false, message: 'Not authorized Login Again'});
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Tìm admin theo ID từ token
        const admin = await adminModel.findById(token_decode.id);
        
        if (!admin || !admin.isActive) {
            return res.json({success: false, message: 'Not authorized - Admin access required'});
        }
        
        req.admin = admin; // Attach admin info to request
        next();
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
};

export default adminAuth;