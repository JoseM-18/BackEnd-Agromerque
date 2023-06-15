const {Router} = require('express');
const router = Router();
const {jsonwt,verifySignUp} = require('../middlewares')

const { 
    getShoppingCart, 
    getShoppingCartByIdUser, 
    createShoppingCart, 
    updateShoppingCart, 
    deleteShoppingCart ,
    getAllShoppingCartProducts
} = require('../controllers/shoppingCart.controller')


router.get('/shoppingCart', [jsonwt.verifyToken], getShoppingCartByIdUser)

router.post('/shoppingCart',[jsonwt.verifyToken], createShoppingCart)

router.delete('/shoppingCart/:idShoppingCart',deleteShoppingCart)

router.get('/shoppingCart/products', getAllShoppingCartProducts)

router.put('/shoppingCart/:idShoppingCart', updateShoppingCart)

module.exports = router;