import { useEffect, useState } from 'react'
import axios from "axios";
import {backendUrl, currency} from '../App'
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import Pagination from '../components/Pagination';
import '../components/ChristmasForm.css';

const Orders = ({token}) => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [filterOrders, setFilterOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const getAllOrders = async () => {
    if(!token) {
      return null;
    }

    try {
      const res = await axios.get(backendUrl + '/api/order/list',{ headers: { token } })
      if(res.status === 200) {
        const ordersData = res.data.reverse();
        setOrders(ordersData);
        
        // Extract unique statuses
        const uniqueStatuses = [...new Set(ordersData.map(item => item.status))];
        setStatuses(uniqueStatuses);
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleStatus = async (e, orderId) => {
    try {
      const res = await axios.put(backendUrl + '/api/order/status', 
        {orderId, status:e.target.value}, 
        {headers : {token} }
      );
      if(res.data.success) {
        await getAllOrders();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getAllOrders();
  }, [token]);
  

  const applyFilter = () => {
    let ordersCopy = orders.slice();

    if (search) {
      ordersCopy = ordersCopy.filter((item) => item._id.toLowerCase().includes(search.toLowerCase()));
    }

    if (statusFilter.length > 0) {
      ordersCopy = ordersCopy.filter((item) => statusFilter.includes(item.status));
    }

    setFilterOrders(ordersCopy);
  };
  
  useEffect(() => {
    applyFilter();
  }, [orders, search, statusFilter]);

  // Reset trang chỉ khi search hoặc filter thay đổi, không reset khi orders CRUD
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filterOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); 
  };


  return (
    <div className="my-8">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
        <h2 className="christmas-form-title">🛒 Order List</h2>
        
        {/* Search Box */}
        <div className="christmas-search-box inline-flex items-center justify-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="christmas-search-input flex-1 text-sm"
            type="text"
            placeholder="Search orders..."
          />
          <img className="w-4" src={assets.search_icon} alt="" />
        </div>
      </div>

      {/* Status Filter */}
      {statuses.length > 0 && (
        <div className='flex flex-wrap items-center gap-3 mb-4 bg-gray-50 p-3 rounded-lg'>
          <span className='text-xs font-semibold text-gray-600'>Status:</span>
          <button
            onClick={() => setStatusFilter([])}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter.length === 0
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            All ({orders.length})
          </button>
          {statuses.map((status) => {
            const count = orders.filter(item => item.status === status).length;
            return (
              <button
                key={status}
                onClick={() => {
                  if (statusFilter.includes(status)) {
                    setStatusFilter(prev => prev.filter(item => item !== status));
                  } else {
                    setStatusFilter(prev => [...prev, status]);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  statusFilter.includes(status)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
          {statusFilter.length > 0 && (
            <>
              <div className='flex-1'></div>
              <button
                onClick={() => setStatusFilter([])}
                className='px-3 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-full font-medium transition-all'
              >
                Clear ✕
              </button>
            </>
          )}
        </div>
      )}

      <div>
        {currentOrders.map((order, index) => (
          <div
            className="christmas-order-card grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />
            <div>
              <div>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return (
                      <p className="py-0.5" key={index}>
                        {item.name} x {item.quantity} <span>{item.size}</span>
                      </p>
                    );
                  } else {
                    return (
                      <p className="py-0.5" key={index}>
                        {item.name} x {item.quantity} <span>{item.size}</span> ,
                      </p>
                    );
                  }
                })}
              </div>
              <p className="my-3 font-medium">{order.address.name}</p>
              <div>
                <p>{order.address.address}</p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-base">
                Items: {order.items.length}
              </p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending"}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm sm:text-base font-semibold">
              {currency}
              {order.amount}
            </p>
            <select
              onChange={(e) => handleStatus(e, order._id)}
              value={order.status}
              className="christmas-status-select"
              disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
            >
              <option value="Order Placed" disabled={order.status !== 'Order Placed'}>Order Placed</option>
              <option value="Packing" disabled={['Shipped', 'Out for delivery', 'Delivered'].includes(order.status)}>Packing</option>
              <option value="Shipped" disabled={['Out for delivery', 'Delivered'].includes(order.status)}>Shipped</option>
              <option value="Out for delivery" disabled={order.status === 'Delivered'}>Out for delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled" className="text-red-600 font-semibold">Cancelled</option>
            </select>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {filterOrders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={filterOrders.length}
          currentPageFirstItem={indexOfFirstOrder + 1}
          currentPageLastItem={Math.min(indexOfLastOrder, filterOrders.length)}
        />
      )}
    </div>
  );
}

export default Orders