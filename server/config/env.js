const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'CLOUDINARY_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'MOMO_PARTNER_CODE',
    'MOMO_ACCESS_KEY',
    'MOMO_SECRET_KEY'
];

const checkEnvVars = () => {
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing);
        process.exit(1);
    }
    
    console.log('✅ All environment variables loaded');
};

export default checkEnvVars;
