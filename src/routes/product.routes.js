const {Router} = require('express');
const pool = require('../database');
const router = Router();

const { getProduct, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controllers')

router.get('/product', getProduct)

router.get('/product/idProduct', getProductById)

router.post('/product', createProduct)

router.delete('/product/idProduct', deleteProduct)

router.put('/product/idProduct', updateProduct)

module.exports = router;