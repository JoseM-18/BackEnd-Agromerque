const {Router} = require('express');
const router = Router();

const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../controllers/order.controller')

router.get('/Order', getAllOrders)

router.get('/Order/:idOrder', getOrderById)

router.post('/Order', createOrder)

router.delete('/Order/:idOrder', deleteOrder)

router.put('/Order/:idOrder', updateOrder)

module.exports = router;
