const { Router } = require('express');

const router = Router();

const { 
    createPaymentMethod,
    getPaymentMethod, 
    getPaymentMethodById, 
    updatePaymentMethod, 
    deletePaymentMethod 
} = require("../controllers/paymentMethod.controller");

router.get('/paymentMethod', getPaymentMethod);

router.get('/paymentMethod/:idpaymentMethod', getPaymentMethodById);

router.post('/paymentMethod', createPaymentMethod);

router.put('/paymentMethod/:idpaymentMethod', updatePaymentMethod);

router.delete('/paymentMethod/:idpaymentMethod', deletePaymentMethod);

module.exports = router;