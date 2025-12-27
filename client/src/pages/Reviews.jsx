import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import { getReviewVideo } from '../utils/imageOptimizer';

const Reviews = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null); // For editing existing review
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    images: [],
    existingImages: [], // For edit mode - existing images from server
    videos: [],
    existingVideos: [] // For edit mode - existing videos from server
  });

  // Fetch pending reviews
  const fetchPendingReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/review/pending`, {
        headers: { token }
      });
      if (response.data.success) {
        setPendingReviews(response.data.pendingReviews);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  // Fetch user's submitted reviews
  const fetchUserReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/review/user`, {
        headers: { token }
      });
      if (response.data.success) {
        setUserReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingReviews();
      fetchUserReviews();
    }
  }, [token]);

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      if (editingReview) {
        // Update existing review
        formData.append('rating', reviewData.rating);
        formData.append('comment', reviewData.comment);
        
        // Append only new images and videos
        reviewData.images.forEach((file) => {
          formData.append('images', file);
        });
        reviewData.videos.forEach((file) => {
          formData.append('images', file);
        });

        const response = await axios.put(
          `${backendUrl}/api/review/update/${editingReview._id}`, 
          formData, 
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success('Review updated successfully!');
          setShowReviewForm(false);
          setEditingReview(null);
          setSelectedProduct(null);
          setReviewData({ rating: 5, comment: '', images: [], existingImages: [], videos: [], existingVideos: [] });
          fetchUserReviews();
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Add new review
        formData.append('productId', selectedProduct.productId);
        formData.append('orderId', selectedProduct.orderId);
        formData.append('rating', reviewData.rating);
        formData.append('comment', reviewData.comment);
        
        reviewData.images.forEach((file) => {
          formData.append('images', file);
        });
        reviewData.videos.forEach((file) => {
          formData.append('images', file);
        });

        const response = await axios.post(`${backendUrl}/api/review/add`, formData, {
          headers: { token }
        });

        if (response.data.success) {
          toast.success('Review submitted successfully!');
          setShowReviewForm(false);
          setSelectedProduct(null);
          setReviewData({ rating: 5, comment: '', images: [], existingImages: [], videos: [], existingVideos: [] });
          fetchPendingReviews();
          fetchUserReviews();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review? You can write a new review after deletion.')) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/review/delete/${reviewId}`, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchPendingReviews(); // Refresh pending reviews (product will appear here)
        fetchUserReviews(); // Refresh user reviews
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  // Handle edit review button click
  const handleEditReview = (review) => {
    setEditingReview(review);
    setSelectedProduct({
      productId: review.productId._id,
      orderId: review.orderId,
      name: review.productId.name,
      image: review.productId.image,
      price: review.productId.price
    });
    setReviewData({
      rating: review.rating,
      comment: review.comment || '',
      images: [],
      existingImages: review.images || [],
      videos: [],
      existingVideos: review.videos || []
    });
    setShowReviewForm(true);
  };

  // Remove existing image from server
  const removeExistingImage = async (imageUrl) => {
    if (!editingReview) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/review/remove-image/${editingReview._id}`,
        { imageUrl },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Image removed');
        setReviewData(prev => ({
          ...prev,
          existingImages: prev.existingImages.filter(img => img !== imageUrl)
        }));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = reviewData.images.length + reviewData.existingImages.length;
    
    if (files.length + totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setReviewData({ ...reviewData, images: [...reviewData.images, ...files] });
  };

  // Remove image preview (new images only)
  const removeImage = (index) => {
    const newImages = [...reviewData.images];
    newImages.splice(index, 1);
    setReviewData({ ...reviewData, images: newImages });
  };

  // Handle video upload with size validation
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    const totalVideos = reviewData.videos.length + reviewData.existingVideos.length;
    
    if (files.length + totalVideos > 2) {
      toast.error('Maximum 2 videos allowed');
      return;
    }

    // Check file sizes (max 30MB per video)
    const maxSize = 30 * 1024 * 1024; // 30MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('Video files must be under 30MB each');
      return;
    }

    setReviewData({ ...reviewData, videos: [...reviewData.videos, ...files] });
  };

  // Remove video preview (new videos only)
  const removeVideo = (index) => {
    const newVideos = [...reviewData.videos];
    newVideos.splice(index, 1);
    setReviewData({ ...reviewData, videos: newVideos });
  };

  // Remove existing video from server
  const removeExistingVideo = async (videoUrl) => {
    if (!editingReview) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/review/remove-video/${editingReview._id}`,
        { videoUrl },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Video removed');
        setReviewData(prev => ({
          ...prev,
          existingVideos: prev.existingVideos.filter(vid => vid !== videoUrl)
        }));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Failed to remove video');
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-6">
        <Title text1={'MY'} text2={'REVIEWS'} />
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-6 text-sm ${
            activeTab === 'pending' 
              ? 'border-b-2 border-black font-bold' 
              : 'text-gray-500'
          }`}
        >
          To Review ({pendingReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`py-3 px-6 text-sm ${
            activeTab === 'reviewed' 
              ? 'border-b-2 border-black font-bold' 
              : 'text-gray-500'
          }`}
        >
          Reviewed ({userReviews.length})
        </button>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Write Your Review</h3>
            
            {/* Product Info */}
            <div className="flex gap-4 mb-4 pb-4 border-b">
              <img src={selectedProduct.image[0]} alt="" className="w-20 h-20 object-cover" />
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">{currency}{selectedProduct.price}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                    >
                      <img
                        src={star <= reviewData.rating ? assets.star_icon : assets.star_dull_icon}
                        alt=""
                        className="w-8 h-8 cursor-pointer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Review (optional)</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  className="w-full border rounded p-2 text-sm"
                  rows="4"
                />
              </div>

              {/* Images */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Add Photos (optional, max 5 total)
                </label>
                
                {/* Existing images (edit mode only) */}
                {editingReview && reviewData.existingImages.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Existing images:</p>
                    <div className="flex gap-2 flex-wrap">
                      {reviewData.existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt="existing"
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(imageUrl)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New image upload */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={reviewData.images.length + reviewData.existingImages.length >= 5}
                  className="text-sm w-full"
                />
                
                {/* New images preview */}
                {reviewData.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {reviewData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Add Videos (optional, max 2 videos, 30MB each)
                </label>
                
                {/* Existing videos (edit mode only) */}
                {editingReview && reviewData.existingVideos.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Existing videos:</p>
                    <div className="flex gap-2 flex-wrap">
                      {reviewData.existingVideos.map((videoUrl, index) => (
                        <div key={index} className="relative">
                          <video
                            src={getReviewVideo(videoUrl)}
                            className="w-32 h-20 object-cover rounded"
                            muted
                            playsInline
                            preload="none"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingVideo(videoUrl)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New video upload */}
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  disabled={reviewData.videos.length + reviewData.existingVideos.length >= 2}
                  className="text-sm w-full mb-1"
                />
                <p className="text-xs text-gray-500">Accepted formats: MP4, WebM, MOV</p>
                
                {/* New videos preview */}
                {reviewData.videos.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {reviewData.videos.map((file, index) => (
                      <div key={index} className="relative">
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-32 h-20 object-cover rounded"
                          muted
                          playsInline
                          preload="none"
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-6 py-2 text-sm"
                >
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedProduct(null);
                    setEditingReview(null);
                    setReviewData({ rating: 5, comment: '', images: [], existingImages: [], videos: [], existingVideos: [] });
                  }}
                  className="flex-1 border border-gray-300 px-6 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Reviews Tab */}
      {activeTab === 'pending' && (
        <div>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products to review</p>
              <button
                onClick={() => navigate('/collection')}
                className="bg-black text-white px-6 py-2 text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 flex gap-4 items-center">
                  <img 
                    src={item.image[0]} 
                    alt="" 
                    className="w-20 h-20 object-cover rounded cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  />
                  <div className="flex-1">
                    <p 
                      className="font-medium cursor-pointer hover:text-gray-600"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">{currency}{item.price}</p>
                    <p className="text-xs text-gray-400">
                      Delivered on {new Date(item.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(item);
                      setShowReviewForm(true);
                    }}
                    className="bg-black text-white px-6 py-2 text-sm whitespace-nowrap"
                  >
                    Write Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviewed Tab */}
      {activeTab === 'reviewed' && (
        <div>
          {userReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't reviewed any products yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex gap-4 mb-3">
                    <img 
                      src={review.productId?.image[0]} 
                      alt="" 
                      className="w-20 h-20 object-cover rounded cursor-pointer"
                      onClick={() => navigate(`/product/${review.productId._id}`)}
                    />
                    <div className="flex-1">
                      <p 
                        className="font-medium cursor-pointer hover:text-gray-600"
                        onClick={() => navigate(`/product/${review.productId._id}`)}
                      >
                        {review.productId?.name}
                      </p>
                      <p className="text-sm text-gray-500">{currency}{review.productId?.price}</p>
                    </div>
                    
                    {/* Edit and Delete buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="px-4 py-2 bg-red-500 text-white text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <img
                        key={star}
                        src={star <= review.rating ? assets.star_icon : assets.star_dull_icon}
                        alt=""
                        className="w-4 h-4"
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                  )}
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="review"
                          className="w-20 h-20 object-cover rounded cursor-pointer"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  
                  {review.videos && review.videos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.videos.map((vid, idx) => (
                        <video
                          key={idx}
                          src={getReviewVideo(vid)}
                          className="w-48 h-32 object-cover rounded"
                          controls
                          muted
                          playsInline
                          preload="none"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
