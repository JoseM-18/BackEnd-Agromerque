const {Router} = require('express');
const router = Router();
const {jsonwt,verifySignUp} = require('../middlewares')

const { 
    getShoppingCart, 
    getShoppingCartById, 
    createShoppingCart, 
    updateShoppingCart, 
    deleteShoppingCart 
} = require('../controllers/shoppingCart.controller')

router.get('/shoppingCart', getShoppingCart)

router.get('/shoppingCart/:idShoppingCart', [jsonwt.verifyToken], getShoppingCartById)

router.post('/shoppingCart', createShoppingCart)

router.delete('/shoppingCart/:idShoppingCart',deleteShoppingCart)

router.put('/shoppingCart/:idShoppingCart', updateShoppingCart)

module.exports = router;