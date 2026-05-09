const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const router = express.Router();

router.route('/top-3-cheapest')
    .get(productController.aliasTopCheapest, productController.getAllProducts);

router.route('/product-category')
    .get(productController.getProductStats);

router.get('/', (req, res, next) => {
    next();
}, authController.protect, productController.getAllProducts);

router.post('/', productController.createProduct);

router.route('/:id')
    .get(productController.getSingleProduct)
    .patch(productController.updateProduct)
    .delete(authController.protect, authController.restrictTo('admin'), productController.deleteProduct);

module.exports = router;