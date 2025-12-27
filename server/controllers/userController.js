import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import adminModel from '../models/adminModel.js';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

//Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({ success: true, token, userId: user._id });
        }
        else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: 'User already exists' });
        }

        //validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email address' });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a password of at least 8 characters' });
        }

        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({ success: true, token, userId: user._id });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//Route for admin login - Check từ adminModel
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await adminModel.findOne({ email });

        if (!admin) {
            return res.json({ success: false, message: 'Admin not found' });
        }

        if (!admin.isActive) {
            return res.json({ success: false, message: 'Admin account is inactive' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            const token = createToken(admin._id);
            res.json({ 
                success: true, 
                token,
                name: admin.name
            });
        }
        else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route để tạo admin mới (chỉ admin hiện tại mới được tạo)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // req.admin được set từ adminAuth middleware
        const exists = await adminModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: 'Admin already exists' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email address' });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a password of at least 8 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new adminModel({
            name,
            email,
            password: hashedPassword,
            createdBy: req.admin._id // Lưu admin nào tạo
        });

        await newAdmin.save();

        res.json({ 
            success: true, 
            message: 'Admin account created successfully' 
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route để list tất cả admin
const listAdmins = async (req, res) => {
    try {
        const admins = await adminModel.find({}).select('-password').populate('createdBy', 'name email');
        res.json({ success: true, admins });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route để list tất cả users (admin only)
const listAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    loginUser, 
    registerUser, 
    loginAdmin, 
    createAdmin,
    listAdmins,
    listAllUsers
};