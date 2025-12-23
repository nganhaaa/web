import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' }, // Admin nào tạo
    isActive: { type: Boolean, default: true }
});

const adminModel = mongoose.models.admin || mongoose.model('admin', adminSchema);

export default adminModel;
