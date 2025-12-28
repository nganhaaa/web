import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import axios from 'axios';
import { toast } from 'react-toastify';
import { getProductDetail, getProductThumbnail, getReviewVideo } from '../utils/imageOptimizer';

const Product = () => {
  const { id } = useParams();
  const { products, currency, addToCart, addToFavourite, favouriteItems, deleteFavorite, backendUrl, token } =
    useContext(ShopContext);

  const [product, setProduct] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [isFavourite, setIsFavourite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null); // Current user's review if exists
  const [editingReview, setEditingReview] = useState(false); // Editing mode flag
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    images: [],
    existingImages: [],
    videos: [],
    existingVideos: []
  });

  const fetchData = async () => {
    products.map((item) => {
      if (item._id === id) {
        setProduct(item);
        setImage(item.image[0]);
        return null;
      }
    });
  };

  const checkFavorite = async () => {
    setIsFavourite(false);
    favouriteItems.map((item) => {
      if (item._id === id) {
        setIsFavourite(true);
      }
    });
  };

  const handleFavourite = async () => {
    if(isFavourite) {
      await deleteFavorite(product._id);
      setIsFavourite(false);
    } else {
      await addToFavourite(product._id);
      setIsFavourite(true);
    }
  }

  // Fetch product reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/review/product/${id}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
        
        // Find current user's review if logged in
        if (token) {
          const myReview = response.data.reviews.find(
            review => review.userId?._id && localStorage.getItem('userId') === review.userId._id
          );
          setUserReview(myReview || null);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Check if user can review
  const checkCanReview = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${backendUrl}/api/review/can-review/${id}`, {
        headers: { token }
      });
      if (response.data.success) {
        setCanReview(response.data.canReview);
        setOrderId(response.data.orderId);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      const formData = new FormData();
      
      if (editingReview && userReview) {
        // Update existing review
        formData.append('rating', reviewData.rating);
        formData.append('comment', reviewData.comment);
        reviewData.images.forEach((file) => {
          formData.append('images', file);
        });
        reviewData.videos.forEach((file) => {
          formData.append('images', file);
        });

        const response = await axios.put(
          `${backendUrl}/api/review/update/${userReview._id}`, 
          formData, 
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success('Review updated successfully!');
          setShowReviewForm(false);
          setEditingReview(false);
          setReviewData({ rating: 5, comment: '', images: [], existingImages: [], videos: [], existingVideos: [] });
          fetchReviews();
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Add new review
        formData.append('productId', id);
        formData.append('orderId', orderId);
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
          setReviewData({ rating: 5, comment: '', images: [], existingImages: [], videos: [], existingVideos: [] });
          fetchReviews();
          checkCanReview();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  // Handle edit review
  const handleEditReview = () => {
    if (!userReview) return;
    setEditingReview(true);
    setReviewData({
      rating: userReview.rating,
      comment: userReview.comment || '',
      images: [],
      existingImages: userReview.images || [],
      videos: [],
      existingVideos: userReview.videos || []
    });
    setShowReviewForm(true);
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!userReview || !confirm('Are you sure you want to delete your review? You can write a new one after deletion.')) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/review/delete/${userReview._id}`, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setUserReview(null);
        fetchReviews();
        checkCanReview();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  // Remove existing image from server
  const removeExistingImage = async (imageUrl) => {
    if (!userReview) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/review/remove-image/${userReview._id}`,
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

  // Remove existing video from server
  const removeExistingVideo = async (videoUrl) => {
    if (!userReview) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/review/remove-video/${userReview._id}`,
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

  // Remove image preview (new images only)
  const removeImage = (index) => {
    const newImages = [...reviewData.images];
    newImages.splice(index, 1);
    setReviewData({ ...reviewData, images: newImages });
  };

  // Remove video preview (new videos only)
  const removeVideo = (index) => {
    const newVideos = [...reviewData.videos];
    newVideos.splice(index, 1);
    setReviewData({ ...reviewData, videos: newVideos });
  };

  useEffect(() => {
    fetchData();
    checkFavorite();
    fetchReviews();
    checkCanReview();
    setSize("");
    window.scrollTo(0, 0);
  }, [id, products, token]);

  return product ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* group image product */}
        <div className="flex flex-1 flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {product.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                key={index}
                src={getProductThumbnail(item)}
                alt=""
                className="w-[24%] cursor-pointer sm:w-full sm:mb-3 flex-shrink-0"
                loading="lazy"
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={getProductDetail(image)} className="w-full h-auto" alt="" loading="lazy" />
          </div>
        </div>

        {/* info product */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl">{product.name}</h1>
          <div className="flex gap-1 mt-4 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <img 
                key={star}
                src={star <= Math.round(averageRating) ? assets.star_icon : assets.star_dull_icon} 
                alt="" 
                className="w-3" 
              />
            ))}
            <p className="pl-2">({totalReviews})</p>
          </div>
          <p className="font-medium text-3xl mt-5">
            {currency}
            {product.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-[80%]">{product.description}</p>
          <div className="flex flex-col gap-3 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {product.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  key={index}
                  className={`border py-2 px-4 bg-gray-100 hover:border-orange-400 ${
                    item === size ? "bg-orange-400" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => addToCart(product._id, size)}
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            >
              ADD TO CART
            </button>
            <button
              onClick={() => {handleFavourite()}}
              className="border-black border px-6 py-1 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                height="26"
                width="30"
                fill={isFavourite ? `#FF204E` : `white`}
                stroke="black"
                strokeWidth="12"
              >
                {" "}
                <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
              </svg>
            </button>
          </div>
          <hr className="my-8 sm:w-4/5" />
          <div className="flex flex-col gap-1 text-gray-500 text-sm ">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('description')}
            className={`py-3 px-4 text-sm ${activeTab === 'description' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-sm ${activeTab === 'reviews' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            Reviews ({totalReviews})
          </button>
        </div>

        {activeTab === 'description' ? (
          <div className="flex flex-col gap-4 border p-5 text-sm text-gray-500">
            <p>
              An e-commerce website is an online platform that facilitates the
              buying and selling of products or services over the internet. It
              serves as a virtual marketplace where businesses and individuals can
              showcase their products, interact with customers, and conduct
              transactions without the need for a physical presence. E-commerce
              websites have gained immense popularity due to their convenience,
              accessibility, and the global reach they offer.
            </p>
            <p>
              E-commerce websites typically display products or services along
              with detailed descriptions, images, prices, and any available
              variations (e.g., sizes, colors). Each product usually has its own
              dedicated page with relevant information.
            </p>
          </div>
        ) : (
          <div className="border p-5">
            {/* User's existing review with Edit/Delete buttons */}
            {userReview && !showReviewForm && (
              <div className="mb-4 p-4 border rounded bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">Your Review</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditReview}
                      className="px-4 py-1 border border-gray-300 text-sm hover:bg-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="px-4 py-1 bg-red-500 text-white text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <img
                      key={star}
                      src={star <= userReview.rating ? assets.star_icon : assets.star_dull_icon}
                      alt=""
                      className="w-4 h-4"
                    />
                  ))}
                </div>
                {userReview.comment && (
                  <p className="text-sm text-gray-700 mb-2">{userReview.comment}</p>
                )}
                {userReview.images && userReview.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {userReview.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="review"
                        className="w-24 h-24 object-cover rounded cursor-pointer"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Write Review button */}
            {canReview && !showReviewForm && !userReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-black text-white px-6 py-2 text-sm mb-4"
              >
                Write a Review
              </button>
            )}

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-6 p-4 border rounded bg-gray-50">
                <h3 className="font-bold text-lg mb-4">Write Your Review</h3>
                
                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
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
                          className="w-6 h-6 cursor-pointer"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Comment (optional)</label>
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
                    Photos (optional, max 5 total)
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
                    className="text-sm"
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
                    className="text-sm mb-1"
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
                    className="bg-black text-white px-6 py-2 text-sm"
                  >
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(false);
                      setReviewData({ rating: 5, comment: '', images: [], existingImages: [], videos: [], existingVideos: [] });
                    }}
                    className="border border-gray-300 px-6 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.userId?.name || 'Anonymous'}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <img
                            key={star}
                            src={star <= review.rating ? assets.star_icon : assets.star_dull_icon}
                            alt=""
                            className="w-4 h-4"
                          />
                        ))}
                      </div>
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
                            className="w-24 h-24 object-cover rounded cursor-pointer"
                            onClick={() => window.open(img, '_blank')}
                            loading="lazy"
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

      <RelatedProducts
        category={product.category}
        subCategory={product.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
