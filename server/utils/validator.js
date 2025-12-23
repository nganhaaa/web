import validator from 'validator';

const validateEmail = (email) => {
    if (!validator.isEmail(email)) {
        return 'Invalid email format';
    }
    return null;
};

const validatePassword = (password) => {
    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return 'Password must contain lowercase letters';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return 'Password must contain uppercase letters';
    }
    if (!/(?=.*\d)/.test(password)) {
        return 'Password must contain numbers';
    }
    return null;
};

const validateProductInput = (data) => {
    const { name, price, category, subCategory } = data;
    
    if (!name || name.trim().length < 3) {
        return 'Product name must be at least 3 characters';
    }
    if (!price || price <= 0) {
        return 'Price must be greater than 0';
    }
    if (!['Men', 'Women', 'Kids'].includes(category)) {
        return 'Invalid category';
    }
    if (!['Topwear', 'Bottomwear', 'Winterwear'].includes(subCategory)) {
        return 'Invalid subcategory';
    }
    return null;
};

const validateReviewInput = (data) => {
    const { rating, comment } = data;
    
    if (!rating || rating < 1 || rating > 5) {
        return 'Rating must be between 1 and 5';
    }
    if (comment && comment.length > 1000) {
        return 'Comment must not exceed 1000 characters';
    }
    return null;
};

export { validateEmail, validatePassword, validateProductInput, validateReviewInput };
