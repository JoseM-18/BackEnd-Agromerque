const {Router} = require('express');

const router = Router();

const { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer.controller')

router.get('/Customer', getAllCustomers)

router.get('/Customer/:idCustomer', getCustomerById)

router.post('/Customer', createCustomer)

router.delete('/Customer/:idCustomer', deleteCustomer)

router.put('/user/:idUser', updateCustomer)

module.exports = router;