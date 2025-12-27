import { useEffect, useState } from "react"
import { assets } from "../assets/assets"
import axios from 'axios'
import {backendUrl} from '../App'
import { toast } from "react-toastify"
import BeatLoader from "react-spinners/BeatLoader";
import '../components/ChristmasForm.css'
import { useNavigate, useParams } from "react-router-dom";


const Edit = ({token}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [existingImages, setExistingImages] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/single?productId=${id}`);
        if (res.data.success) {
          const product = res.data.product;
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price);
          setCategory(product.category);
          setSubCategory(product.subCategory);
          setBestseller(product.bestseller || false);
          setSizes(product.sizes);
          setExistingImages(product.image);
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true)
    try {
      const formData = new FormData();

      formData.append("id", id)
      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes))

      image1 && formData.append("image1",image1)
      image2 && formData.append("image2",image2)
      image3 && formData.append("image3",image3)
      image4 && formData.append("image4",image4)
      
      const res = await axios.put(backendUrl + '/api/product/update', formData, {headers : {token}})

      if(res.data.success) {
        toast.success(res.data.message)
        navigate('/list')
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <BeatLoader
        color='#c586a5'
        loading={true}
        cssOverride={{
          display: "flex",
          position: "absolute",
          top:"0",
          left:"0",
          bottom:"0",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
        size={26}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col w-full items-start gap-3 my-8">
        <h2 className="christmas-form-title">✏️ Edit Product</h2>
        
        <div>
          <p className="christmas-label mb-2">Upload Image (Leave blank to keep existing images)</p>

          <div className="flex gap-2">
            <label htmlFor="image1" className="christmas-upload-area">
              <img 
                className="w-20" 
                src={image1 ? URL.createObjectURL(image1) : (existingImages[0] || assets.upload_area)} 
                alt="" 
              />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2" className="christmas-upload-area">
              <img 
                className="w-20" 
                src={image2 ? URL.createObjectURL(image2) : (existingImages[1] || assets.upload_area)} 
                alt="" 
              />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3" className="christmas-upload-area">
              <img 
                className="w-20" 
                src={image3 ? URL.createObjectURL(image3) : (existingImages[2] || assets.upload_area)} 
                alt="" 
              />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4" className="christmas-upload-area">
              <img 
                className="w-20" 
                src={image4 ? URL.createObjectURL(image4) : (existingImages[3] || assets.upload_area)} 
                alt="" 
              />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
            </label>
          </div>
        </div>

        <div className="w-full">
          <p className="christmas-label mb-2">Product name</p>
          <input onChange={(e) => setName(e.target.value)} value={name} className="christmas-input" type="text" placeholder="Type here" required/>
        </div>

        <div className="w-full">
          <p className="christmas-label mb-2">Product description</p>
          <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="christmas-textarea" type="text" placeholder="Write content here" required/>
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-8">
          <div>
            <p className="christmas-label mb-2">Product category</p>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="christmas-select px-3 py-2">
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div>
            <p className="christmas-label mb-2">Sub category</p>
            <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="christmas-select px-3 py-2">
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>
          <div>
            <p className="christmas-label mb-2">Product price</p>
            <input onChange={(e) => setPrice(e.target.value)} value={price} className="christmas-input sm:w-[120px]" type="number" placeholder="26" required />
          </div>
        </div>

        <div>
          <p className="christmas-label mb-2">Product Sizes</p>
          <div className="flex gap-2">
            <div onClick={() => setSizes(prev => prev.includes("S") ? prev.filter(item =>item !== "S") : [...prev,"S"])}>
              <p className={`christmas-size-btn ${sizes.includes("S") ? 'active' : ''}`}>S</p>
            </div>

            <div onClick={() => setSizes(prev => prev.includes("M") ? prev.filter(item =>item !== "M") : [...prev,"M"])}>
              <p className={`christmas-size-btn ${sizes.includes("M") ? 'active' : ''}`}>M</p>
            </div>

            <div onClick={() => setSizes(prev => prev.includes("L") ? prev.filter(item =>item !== "L") : [...prev,"L"])}>
              <p className={`christmas-size-btn ${sizes.includes("L") ? 'active' : ''}`}>L</p>
            </div>

            <div onClick={() => setSizes(prev => prev.includes("XL") ? prev.filter(item =>item !== "XL") : [...prev,"XL"])}>
              <p className={`christmas-size-btn ${sizes.includes("XL") ? 'active' : ''}`}>XL</p>
            </div>

            <div onClick={() => setSizes(prev => prev.includes("XXL") ? prev.filter(item =>item !== "XXL") : [...prev,"XXL"])}>
              <p className={`christmas-size-btn ${sizes.includes("XXL") ? 'active' : ''}`}>XXL</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="christmas-submit-btn">UPDATE ✅</button>
          <button type="button" onClick={() => navigate('/list')} className="christmas-submit-btn bg-gray-500 hover:bg-gray-600">CANCEL ❌</button>
        </div>
      </form>

      <BeatLoader
        color='#c586a5'
        loading={loading}
        cssOverride={
          {display: "flex",
          position: "absolute",
          top:"0",
          left:"0",
          bottom:"0",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          }
        }
        size={26}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </>
  )
}

export default Edit
