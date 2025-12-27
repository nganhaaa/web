import productModel from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        // Lấy các ảnh từ req.files
        const images = [];
        if (req.files.image1 && req.files.image1[0]) images.push(req.files.image1[0]);
        if (req.files.image2 && req.files.image2[0]) images.push(req.files.image2[0]);
        if (req.files.image3 && req.files.image3[0]) images.push(req.files.image3[0]);
        if (req.files.image4 && req.files.image4[0]) images.push(req.files.image4[0]);

        // Kiểm tra nếu không có ảnh nào được gửi
        if (images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required." });
        }

        // Upload các ảnh đã gửi lên Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        console.log(name, description, price, category, subCategory, sizes, bestseller);
        console.log(imagesUrl);

        // Tạo dữ liệu sản phẩm
        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true",
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now(),
        };
        console.log(productData);

        // Lưu sản phẩm vào cơ sở dữ liệu
        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// function for list product
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// function for removing product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.query;
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// function for update product
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body;

        // Tìm sản phẩm hiện tại
        const existingProduct = await productModel.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Bắt đầu với ảnh cũ
        let imagesUrl = [...existingProduct.image];

        // Upload và thay thế từng ảnh mới tại vị trí tương ứng
        if (req.files.image1 && req.files.image1[0]) {
            const result = await cloudinary.uploader.upload(req.files.image1[0].path, { resource_type: 'image' });
            imagesUrl[0] = result.secure_url;
        }
        if (req.files.image2 && req.files.image2[0]) {
            const result = await cloudinary.uploader.upload(req.files.image2[0].path, { resource_type: 'image' });
            imagesUrl[1] = result.secure_url;
        }
        if (req.files.image3 && req.files.image3[0]) {
            const result = await cloudinary.uploader.upload(req.files.image3[0].path, { resource_type: 'image' });
            imagesUrl[2] = result.secure_url;
        }
        if (req.files.image4 && req.files.image4[0]) {
            const result = await cloudinary.uploader.upload(req.files.image4[0].path, { resource_type: 'image' });
            imagesUrl[3] = result.secure_url;
        }

        // Cập nhật dữ liệu sản phẩm
        const updatedData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true",
            sizes: JSON.parse(sizes),
            image: imagesUrl,
        };

        // Cập nhật sản phẩm trong database
        const updatedProduct = await productModel.findByIdAndUpdate(id, updatedData, { new: true });

        res.json({ success: true, message: "Product Updated", product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export {
    addProduct,
    listProducts,
    removeProduct,
    singleProduct,
    updateProduct
};
