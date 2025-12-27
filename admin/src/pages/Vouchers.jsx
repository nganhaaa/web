import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import '../components/ChristmasForm.css';

const Vouchers = ({ token }) => {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    expiryDate: '',
    isActive: true,
    applicableCategories: ['All']
  });

  const fetchVouchers = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/voucher/list', { headers: { token } });
      if (res.data.success) {
        setVouchers(res.data.vouchers);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch vouchers');
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (category) => {
    if (category === 'All') {
      setFormData(prev => ({ ...prev, applicableCategories: ['All'] }));
    } else {
      setFormData(prev => {
        const categories = prev.applicableCategories.filter(c => c !== 'All');
        if (categories.includes(category)) {
          const filtered = categories.filter(c => c !== category);
          return { ...prev, applicableCategories: filtered.length > 0 ? filtered : ['All'] };
        } else {
          return { ...prev, applicableCategories: [...categories, category] };
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode 
        ? backendUrl + '/api/voucher/update' 
        : backendUrl + '/api/voucher/create';
      
      const payload = editMode 
        ? { ...formData, voucherId: currentVoucher._id }
        : formData;

      const res = await axios({
        method: editMode ? 'put' : 'post',
        url,
        data: payload,
        headers: { token }
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchVouchers();
        resetForm();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleEdit = (voucher) => {
    setCurrentVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderAmount: voucher.minOrderAmount,
      maxDiscountAmount: voucher.maxDiscountAmount || '',
      usageLimit: voucher.usageLimit,
      startDate: voucher.startDate.split('T')[0],
      expiryDate: voucher.expiryDate.split('T')[0],
      isActive: voucher.isActive,
      applicableCategories: voucher.applicableCategories
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (voucherId) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;
    
    try {
      const res = await axios.delete(backendUrl + '/api/voucher/delete', {
        data: { voucherId },
        headers: { token }
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchVouchers();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: 0,
      maxDiscountAmount: '',
      usageLimit: '',
      startDate: '',
      expiryDate: '',
      isActive: true,
      applicableCategories: ['All']
    });
    setShowForm(false);
    setEditMode(false);
    setCurrentVoucher(null);
  };

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="christmas-form-title">🎟️ Voucher Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="christmas-submit-btn"
        >
          {showForm ? 'Cancel' : 'Add New Voucher'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="christmas-card mb-6 p-6">
          <h3 className="christmas-card-title mb-4">
            {editMode ? '✏️ Edit Voucher' : 'Create New Voucher'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="christmas-label">Voucher Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="christmas-input"
                placeholder="SUMMER2024"
                required
                disabled={editMode}
              />
            </div>

            <div>
              <label className="christmas-label">Description *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="christmas-input"
                placeholder="Summer Sale Discount"
                required
              />
            </div>

            <div>
              <label className="christmas-label">Discount Type *</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="christmas-select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="christmas-label">Discount Value *</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                className="christmas-input"
                placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                required
              />
            </div>

            <div>
              <label className="christmas-label">Min Order Amount ($)</label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleInputChange}
                className="christmas-input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="christmas-label">Max Discount Amount ($)</label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleInputChange}
                className="christmas-input"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="christmas-label">Usage Limit *</label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                className="christmas-input"
                placeholder="100"
                required
              />
            </div>

            <div>
              <label className="christmas-label">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="christmas-input"
                required
              />
            </div>

            <div>
              <label className="christmas-label">Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="christmas-input"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                id="isActive"
              />
              <label htmlFor="isActive" className="christmas-label cursor-pointer">
                Active
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="christmas-label mb-2">Applicable Categories</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Men', 'Women', 'Kids'].map(category => (
                <div
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`christmas-size-btn ${formData.applicableCategories.includes(category) ? 'active' : ''}`}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button type="submit" className="christmas-submit-btn">
              {editMode ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="christmas-delete-btn px-4">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="christmas-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="christmas-table-header">
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Categories</th>
                <th className="px-4 py-3 text-left">Usage</th>
                <th className="px-4 py-3 text-left">Valid Until</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher._id} className="christmas-table-row border-b">
                  <td className="px-4 py-3 font-bold text-red-600">{voucher.code}</td>
                  <td className="px-4 py-3">{voucher.description}</td>
                  <td className="px-4 py-3">
                    {voucher.discountType === 'percentage' 
                      ? `${voucher.discountValue}%` 
                      : `$${voucher.discountValue}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {voucher.applicableCategories?.join(', ') || 'All'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {voucher.usedCount}/{voucher.usageLimit}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(voucher.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${voucher.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {voucher.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEdit(voucher)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(voucher._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vouchers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No vouchers found. Create your first voucher!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
