import mongoose from 'mongoose';

const dailySpinSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    lastSpinDate: { 
        type: Date, 
        required: true 
    },
    spinCount: { 
        type: Number, 
        default: 0 
    }
});

const dailySpinModel = mongoose.models.dailyspin || mongoose.model('dailyspin', dailySpinSchema);

export default dailySpinModel;
