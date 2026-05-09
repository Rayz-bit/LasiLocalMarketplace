const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getProductStats = catchAsync(async (req, res, next) => {
    const stats = await Product.aggregate([
        {
            $match: { price: { $lt: 1000 } }
        },
        {
            $group: {
                _id: '$category',
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: { stats }
    });
});

exports.aliasTopCheapest = (req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: {
            limit: '3',
            sort: 'price',
            fields: 'name,price,category,seller'
        },
        writable: true,
        configurable: true,
        enumerable: true
    });
    next();
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let query = Product.find(queryObj);

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products }
    });
});

exports.createProduct = catchAsync(async (req, res, next) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({ status: 'success', data: { product: newProduct } });
    } catch (err) {
        next(err);
    }
});

exports.getSingleProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('No product found with that ID', 404));
    res.status(200).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!product) return next(new AppError('No product found with that ID', 404));
    res.status(200).json({ status: 'success', data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError('No product found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
});