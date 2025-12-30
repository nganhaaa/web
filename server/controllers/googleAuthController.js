import { OAuth2Client } from 'google-auth-library';
import userModel from '../models/userModel.js';
import adminModel from '../models/adminModel.js';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
            audience: process.env.GOOGLE_CLIENT_ID,
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

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
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
        console.log(error);
        res.json({ success: false, message: 'Google authentication failed' });
    }
};

export { googleLogin, googleLoginAdmin };
