import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: function() { return !this.googleId; }}, // Optional if using Google
    googleId: {type: String, unique: true, sparse: true}, // Google OAuth ID
    avatar: {type: String}, // Profile picture from Google
    cartData: {type: Object, default: {}},
    favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }]
}, {minimize: false});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;