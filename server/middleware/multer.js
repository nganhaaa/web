import multer from "multer";

const storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

// File filter to accept both images and videos
const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        callback(null, true);
    } else {
        callback(new Error('Only image and video files are allowed'), false);
    }
};

// Increase file size limit for videos (30MB)
const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 30 * 1024 * 1024 // 30MB
    }
});

export default upload;
