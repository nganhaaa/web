/**
 * Optimize Cloudinary image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {string} transformation - Transformation parameters (default: w_600,q_auto,f_auto)
 * @returns {string} Optimized URL
 */
export const optimizeCloudinaryImage = (url, transformation = "w_600,q_auto,f_auto") => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace("/upload/", `/upload/${transformation}/`);
};

/**
 * Get optimized URL for product thumbnail (200x200)
 */
export const getProductThumbnail = (url) => {
  return optimizeCloudinaryImage(url, "w_200,h_200,c_fill,q_auto,f_auto");
};

/**
 * Get optimized URL for product card (400x400)
 */
export const getProductCard = (url) => {
  return optimizeCloudinaryImage(url, "w_400,h_400,c_fill,q_auto,f_auto");
};

/**
 * Get optimized URL for product detail (800px width)
 */
export const getProductDetail = (url) => {
  return optimizeCloudinaryImage(url, "w_800,q_auto,f_auto");
};

/**
 * Get optimized URL for hero/banner images (1200px width)
 */
export const getHeroImage = (url) => {
  return optimizeCloudinaryImage(url, "w_1200,q_auto,f_auto");
};

/**
 * Optimize Cloudinary video URL with transformations
 * @param {string} url - Original Cloudinary video URL
 * @param {string} transformation - Transformation parameters (default: w_720,q_auto,f_auto)
 * @returns {string} Optimized URL
 */
export const optimizeCloudinaryVideo = (url, transformation = "w_720,q_auto,f_auto") => {
  if (!url || !url.includes('cloudinary.com')) return url;
  // Check if it's a video URL
  if (url.includes('/video/upload/')) {
    return url.replace("/video/upload/", `/video/upload/${transformation}/`);
  }
  return url;
};

/**
 * Get optimized URL for review video (720px width)
 */
export const getReviewVideo = (url) => {
  return optimizeCloudinaryVideo(url, "w_720,q_auto,f_auto");
};

/**
 * Get thumbnail from video (first frame at 2 seconds)
 * @param {string} videoUrl - Cloudinary video URL
 * @returns {string} Thumbnail image URL
 */
export const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes('cloudinary.com')) return '';
  // Extract the video transformation and add thumbnail generation
  return videoUrl.replace(
    "/video/upload/",
    "/video/upload/so_2,w_200,h_150,c_fill,f_jpg/"
  );
};

