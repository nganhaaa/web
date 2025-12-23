import { useState } from 'react';
import axios from 'axios';

const VoucherCard = ({ voucher, isSaved, onSaveToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async () => {
    setLoading(true);
    try {
      if (isSaved) {
        await axios.delete(`/api/vouchers/${voucher._id}/save`);
      } else {
        await axios.post(`/api/vouchers/${voucher._id}/save`);
      }
      onSaveToggle?.();
    } catch (error) {
      console.error('Error toggling voucher save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voucher-card">
      {/* ...existing code... */}
      <button 
        onClick={handleSaveToggle}
        disabled={loading}
        className={isSaved ? 'saved' : 'save'}
      >
        {isSaved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
};

export default VoucherCard;
