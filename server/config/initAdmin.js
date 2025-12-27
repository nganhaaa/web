import bcrypt from 'bcrypt';
import adminModel from '../models/adminModel.js';

const initializeAdmin = async () => {
    try {
        // Kiểm tra xem đã có admin chưa
        const existingAdmin = await adminModel.findOne({});
        
        if (existingAdmin) {
            console.log('✅ Admin exists:', existingAdmin.email);
            return;
        }

        // Tạo admin đầu tiên
        const adminData = {
            name: 'Super Admin',
            email: 'admin@gmail.com',
            password: 'Admin@123'
        };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        const admin = new adminModel({
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword
        });

        await admin.save();
        
        console.log('🎉 First admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:   ', adminData.email);
        console.log('🔑 Password:', adminData.password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANT: Change password after first login!\n');

    } catch (error) {
        console.error('❌ Error initializing admin:', error.message);
    }
};

export default initializeAdmin;
