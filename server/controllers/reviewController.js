import reviewModel from '../models/reviewModel.js';
import orderModel from '../models/orderModel.js';
import { v2 as cloudinary } from 'cloudinary';
import { validateReviewInput } from '../utils/validator.js';
import { asyncHandler } from '../utils/errorHandler.js';

// Add a review
const addReview = asyncHandler(async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body;
        // Get userId from req (set by auth middleware) - works with FormData
        const userId = req.userId || req.body.userId;

        console.log('🔍 Review Request:', { productId, orderId, rating, userId });

        // Validation
        const validationError = validateReviewInput({ rating, comment });
        if (validationError) {
            return res.json({ success: false, message: validationError });
        }

        // Validate required fields
        if (!productId || !orderId || !rating) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        // Check if user has ordered this product with Delivered status
        const order = await orderModel.findOne({
            _id: orderId,
            userId: userId,
            status: 'Delivered',
            'items._id': productId
        });

        console.log('📦 Order found:', order ? `Yes (Status: ${order.status})` : 'No');
        
        if (!order) {
            // Debug: Check if order exists without status filter
            const anyOrder = await orderModel.findOne({
                _id: orderId,
                userId: userId
            });
            
            if (anyOrder) {
                console.log('⚠️ Order exists but status is:', anyOrder.status);
                return res.json({ 
                    success: false, 
                    message: `Order status is "${anyOrder.status}". Only delivered orders can be reviewed.` 
                });
            }
            
            // Check if product is in order
            const orderWithProduct = await orderModel.findOne({
                _id: orderId,
                userId: userId,
                'items._id': productId
            });
            
            if (!orderWithProduct) {
                console.log('⚠️ Product not found in order');
                return res.json({ 
                    success: false, 
                    message: 'Product not found in this order' 
                });
            }
            
            return res.json({ 
                success: false, 
                message: 'You can only review products from delivered orders' 
            });
        }

        // Check if user has already reviewed this product
        const existingReview = await reviewModel.findOne({ userId, productId });
        if (existingReview) {
            return res.json({ 
                success: false, 
                message: 'You have already reviewed this product' 
            });
        }

        // Handle image uploads (max 5 images)
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            if (req.files.length > 5) {
                return res.json({ 
                    success: false, 
                    message: 'Maximum 5 images allowed' 
                });
            }

            // Upload images to Cloudinary
            const uploadPromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path, { resource_type: 'image' })
            );
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.map(result => result.secure_url);
        }

        // Create review
        const review = new reviewModel({
            userId,
            productId,
            orderId,
            rating: Number(rating),
            comment: comment || '',
            images: imageUrls
        });

        await review.save();

        res.json({ success: true, message: 'Review added successfully', review });

    } catch (error) {
        console.error('Error adding review:', error);
        res.json({ success: false, message: error.message });
    }
});

// Get reviews for a product
const getProductReviews = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await reviewModel.find({ productId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        res.json({ 
            success: true, 
            reviews,
            averageRating,
            totalReviews: reviews.length
        });

    } catch (error) {
        console.error('Error getting reviews:', error);
        res.json({ success: false, message: error.message });
    }
});

// Get user's reviews (already reviewed products)
const getUserReviews = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        
        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        const reviews = await reviewModel.find({ userId })
            .populate('productId', 'name image price')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });

    } catch (error) {
        console.error('Error getting user reviews:', error);
        res.json({ success: false, message: error.message });
    }
});

// Get products pending review (delivered but not reviewed)
const getPendingReviews = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        // Get all delivered orders for this user
        const deliveredOrders = await orderModel.find({ 
            userId, 
            status: 'Delivered' 
        });

        // Get all products from delivered orders
        const deliveredProducts = [];
        deliveredOrders.forEach(order => {
            order.items.forEach(item => {
                deliveredProducts.push({
                    productId: item._id,
                    orderId: order._id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    orderDate: order.date
                });
            });
        });

        // Get all reviews by this user
        const userReviews = await reviewModel.find({ userId });
        const reviewedProductIds = userReviews.map(review => review.productId.toString());

        // Filter out already reviewed products
        const pendingReviews = deliveredProducts.filter(product => 
            !reviewedProductIds.includes(product.productId.toString())
        );

        // Remove duplicates (same product from different orders - only keep most recent)
        const uniquePending = [];
        const seenProductIds = new Set();
        
        pendingReviews.forEach(product => {
            const productIdStr = product.productId.toString();
            if (!seenProductIds.has(productIdStr)) {
                seenProductIds.add(productIdStr);
                uniquePending.push(product);
            }
        });

        res.json({ success: true, pendingReviews: uniquePending });

    } catch (error) {
        console.error('Error getting pending reviews:', error);
        res.json({ success: false, message: error.message });
    }
});

// Check if user can review a product
const canReview = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId || req.body.userId;
        
        if (!userId) {
            return res.json({ 
                success: true, 
                canReview: false, 
                reason: 'not_authenticated' 
            });
        }

        // Check if already reviewed
        const existingReview = await reviewModel.findOne({ userId, productId });
        if (existingReview) {
            return res.json({ 
                success: true, 
                canReview: false, 
                reason: 'already_reviewed' 
            });
        }

        // Check if user has delivered order with this product
        const order = await orderModel.findOne({
            userId,
            status: 'Delivered',
            'items._id': productId
        });

        if (!order) {
            return res.json({ 
                success: true, 
                canReview: false, 
                reason: 'not_purchased' 
            });
        }

        res.json({ 
            success: true, 
            canReview: true,
            orderId: order._id
        });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.json({ success: false, message: error.message });
    }
});

// Update a review
const updateReview = asyncHandler(async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        // Find review and verify ownership
        const review = await reviewModel.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.json({ 
                success: false, 
                message: 'Review not found or you do not have permission to edit it' 
            });
        }

        // Handle new image uploads
        let newImageUrls = [];
        if (req.files && req.files.length > 0) {
            // Check total images (existing + new)
            const totalImages = review.images.length + req.files.length;
            if (totalImages > 5) {
                return res.json({ 
                    success: false, 
                    message: `Maximum 5 images allowed. You have ${review.images.length} existing images.` 
                });
            }

            // Upload new images to Cloudinary
            const uploadPromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path, { resource_type: 'image' })
            );
            const uploadResults = await Promise.all(uploadPromises);
            newImageUrls = uploadResults.map(result => result.secure_url);
        }

        // Update review fields
        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        if (newImageUrls.length > 0) {
            review.images = [...review.images, ...newImageUrls];
        }

        await review.save();

        res.json({ 
            success: true, 
            message: 'Review updated successfully',
            review 
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.json({ success: false, message: error.message });
    }
});

// Delete a review
const deleteReview = asyncHandler(async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.userId || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        // Find review and verify ownership
        const review = await reviewModel.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.json({ 
                success: false, 
                message: 'Review not found or you do not have permission to delete it' 
            });
        }

        // Delete images from Cloudinary (optional - to save storage)
        if (review.images && review.images.length > 0) {
            const deletePromises = review.images.map(imageUrl => {
                const publicId = imageUrl.split('/').pop().split('.')[0];
                return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises).catch(err => 
                console.log('Some images could not be deleted:', err)
            );
        }

        // Delete the review
        await reviewModel.findByIdAndDelete(reviewId);

        res.json({ 
            success: true, 
            message: 'Review deleted successfully. You can now review this product again.' 
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.json({ success: false, message: error.message });
    }
});

// Remove a specific image from review
const removeReviewImage = asyncHandler(async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { imageUrl } = req.body;
        const userId = req.userId || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        // Find review and verify ownership
        const review = await reviewModel.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.json({ 
                success: false, 
                message: 'Review not found or you do not have permission to edit it' 
            });
        }

        // Remove image URL from array
        review.images = review.images.filter(img => img !== imageUrl);
        await review.save();

        // Delete image from Cloudinary
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId).catch(err => 
            console.log('Image could not be deleted from Cloudinary:', err)
        );

        res.json({ 
            success: true, 
            message: 'Image removed successfully',
            review 
        });

    } catch (error) {
        console.error('Error removing image:', error);
        res.json({ success: false, message: error.message });
    }
});

export { 
    addReview, 
    getProductReviews, 
    getUserReviews, 
    getPendingReviews,
    canReview,
    updateReview,
    deleteReview,
    removeReviewImage
};
