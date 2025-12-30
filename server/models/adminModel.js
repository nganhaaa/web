import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.googleId; } }, // Optional if using Google
    googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID for admin
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' }, // Admin nào tạo
    isActive: { type: Boolean, default: true }
});

const adminModel = mongoose.models.admin || mongoose.model('admin', adminSchema);

export default adminModel;
