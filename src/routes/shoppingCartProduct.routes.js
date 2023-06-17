const {Router} = require('express');
const router = Router();
const {jsonwt,verifySignUp} = require('../middlewares')

const {
    getShoppingCartProduct,
    getShoppingCartProductById,
    createShoppingCartProduct,
    updateShoppingCartProduct,
    deleteShoppingCartProduct
} = require('../controllers/shoppingCartProduct.controller')

router.get('/shoppingCartProduct', getShoppingCartProduct)

router.get('/shoppingCartProduct/:idShoppingCartProduct', getShoppingCartProductById)

router.post('/shoppingCartProduct',[jsonwt.verifyToken], createShoppingCartProduct)

router.delete('/shoppingCartProduct/:idShoppingCartProduct',deleteShoppingCartProduct)

router.put('/shoppingCartProduct/:idShoppingCartProduct', updateShoppingCartProduct)

module.exports = router;