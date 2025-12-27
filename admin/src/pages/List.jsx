import axios from 'axios';
import { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import Pagination from '../components/Pagination';
import '../components/ChristmasForm.css';
import { useNavigate } from 'react-router-dom';

const List = ({token}) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterList, setFilterList] = useState([]);
  const [category, setCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const fetchList = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/product/list')
      if(res.data.success) {
        const products = res.data.products.reverse();
        setList(products);
        
        // Extract unique categories and subCategories
        const uniqueCategories = [...new Set(products.map(item => item.category))];
        const uniqueSubCategories = [...new Set(products.map(item => item.subCategory))];
        setCategories(uniqueCategories);
        setSubCategories(uniqueSubCategories);
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/product/remove`, {
        data: { id },
        headers: { token }
      });

      if(res.data.success) {
        toast.success(res.data.message);
        await fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };
  
  useEffect(() => {
    fetchList();
  }, []);

  const applyFilter = () => {
    let ordersCopy = list.slice();

    if (search) {
      ordersCopy = ordersCopy.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      ordersCopy = ordersCopy.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      ordersCopy = ordersCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    setFilterList(ordersCopy);
  };
  
  useEffect(() => {
    applyFilter();
  }, [list, search, category, subCategory]);

  // Reset trang chỉ khi search hoặc filter thay đổi, không reset khi list CRUD
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, subCategory]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filterList.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };


  return (
    <div className='my-8'>
      <div className='flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4'>
        <h2 className="christmas-form-title">📋 All Products List</h2>
        
        {/* Search Box */}
        <div className="christmas-search-box inline-flex items-center justify-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="christmas-search-input flex-1 text-sm"
            type="text"
            placeholder="Search products..."
          />
          <img className="w-4" src={assets.search_icon} alt="" />
        </div>
      </div>

      {/* Filters Row */}
      <div className='flex flex-wrap items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg'>
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-xs font-semibold text-gray-600'>Category:</span>
            <button
              onClick={() => setCategory([])}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category.length === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const count = list.filter(item => item.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    if (category.includes(cat)) {
                      setCategory(prev => prev.filter(item => item !== cat));
                    } else {
                      setCategory(prev => [...prev, cat]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    category.includes(cat)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Divider */}
        {categories.length > 0 && subCategories.length > 0 && (
          <div className='h-6 w-px bg-gray-300'></div>
        )}

        {/* SubCategory Filter */}
        {subCategories.length > 0 && (
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-xs font-semibold text-gray-600'>Type:</span>
            <button
              onClick={() => setSubCategory([])}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                subCategory.length === 0
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {subCategories.map((subCat) => {
              const count = list.filter(item => item.subCategory === subCat).length;
              return (
                <button
                  key={subCat}
                  onClick={() => {
                    if (subCategory.includes(subCat)) {
                      setSubCategory(prev => prev.filter(item => item !== subCat));
                    } else {
                      setSubCategory(prev => [...prev, subCat]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    subCategory.includes(subCat)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {subCat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Clear All Filters - Inline */}
        {(category.length > 0 || subCategory.length > 0) && (
          <>
            <div className='flex-1'></div>
            <button
              onClick={() => {
                setCategory([]);
                setSubCategory([]);
              }}
              className='px-3 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-full font-medium transition-all'
            >
              Clear All ✕
            </button>
          </>
        )}
      </div>

      <div className='flex flex-col gap-2'>

        <div className='christmas-table-header hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Actions</b>
        </div>

        {currentItems.map((item, index) => (
          <div className='christmas-table-row grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-3 px-4 text-sm' key={index}>
            <img className='w-12 rounded-lg' src={item.image[0]} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p className="font-semibold">{currency}{item.price}</p>
            <div className='flex gap-2 justify-center items-center'>
              <button 
                onClick={() => navigate(`/edit/${item._id}`)} 
                className='christmas-edit-btn cursor-pointer text-blue-600 hover:text-blue-800 font-bold'
                title="Edit product"
              >
                ✏️
              </button>
              <button 
                onClick={() => removeProduct(item._id)} 
                className='christmas-delete-btn cursor-pointer text-red-600 hover:text-red-800 font-bold'
                title="Delete product"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filterList.length > 0 && (
        <Pagination 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={filterList.length}
        currentPageFirstItem={indexOfFirstItem + 1}
        currentPageLastItem={Math.min(indexOfLastItem, filterList.length)}
      />
      )}
    </div>
  )
}

export default List