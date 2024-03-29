const {Router} = require('express');

const router = Router();

const {jsonwt,verifySignUp} = require('../middlewares')

const { 
    getProduct, 
    getProductById, 
    getProductByCategory,
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getProductByName 
} = require('../controllers/product.controller')

router.get('/product', getProduct)

router.get('/product/:idProduct', [jsonwt.verifyToken], getProductById)

router.get('/product/name/:name', getProductByName)

router.get('/product/category/:category', getProductByCategory)

router.post('/product', [jsonwt.verifyToken,jsonwt.isAdmin], createProduct)

router.delete('/product/:idProduct',deleteProduct)

router.put('/product/:idProduct', updateProduct)

module.exports = router;