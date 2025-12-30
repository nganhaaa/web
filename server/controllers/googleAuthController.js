import { OAuth2Client } from 'google-auth-library';
import userModel from '../models/userModel.js';
import adminModel from '../models/adminModel.js';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Validate Client ID
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    console.error('❌ GOOGLE_CLIENT_ID chưa được cấu hình đúng trong file .env');
    console.error('Vui lòng thêm GOOGLE_CLIENT_ID vào server/.env');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Google Login for regular users
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists
        let user = await userModel.findOne({ email });

        if (user) {
            // Update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.avatar = picture;
                await user.save();
            }
        } else {
            // Create new user
            user = new userModel({
                name,
                email,
                googleId,
                avatar: picture,
                password: Math.random().toString(36).slice(-8), // Random password (not used)
            });
            await user.save();
        }

        const token = createToken(user._id);

        res.json({ 
            success: true, 
            token, 
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Google authentication failed' });
    }
};

// Google Login for admin
const googleLoginAdmin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.json({ success: false, message: 'Missing Google credential' });
        }

        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
            console.error('❌ GOOGLE_CLIENT_ID chưa được cấu hình');
            return res.json({ success: false, message: 'Server configuration error: Google Client ID not configured' });
        }

        console.log('🔍 Verifying Google token with Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if admin exists with this email
        let admin = await adminModel.findOne({ email });

        if (!admin) {
            return res.json({ 
                success: false, 
                message: 'No admin account found with this email. Please contact the super admin.' 
            });
        }

        if (!admin.isActive) {
            return res.json({ success: false, message: 'Admin account is inactive' });
        }

        // Update googleId if not set
        if (!admin.googleId) {
            admin.googleId = googleId;
            await admin.save();
        }

        const token = createToken(admin._id);

        res.json({ 
            success: true, 
            token,
            name: admin.name
        });

    } catch (error) {
        console.error('❌ Google Admin Login Error:', error.message);
        console.error('Error details:', error);
        
        // Provide more specific error messages
        if (error.message && error.message.includes('invalid_client')) {
            return res.json({ 
                success: false, 
                message: 'Google Client ID không hợp lệ. Vui lòng kiểm tra lại cấu hình trong Google Cloud Console và file .env' 
            });
        }
        
        if (error.message && error.message.includes('audience')) {
            return res.json({ 
                success: false, 
                message: 'Client ID không khớp. Đảm bảo Client ID trong frontend và backend giống nhau' 
            });
        }
        
        res.json({ success: false, message: 'Google authentication failed: ' + error.message });
    }
};

export { googleLogin, googleLoginAdmin };
