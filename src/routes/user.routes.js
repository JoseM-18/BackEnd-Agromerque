const {Router} = require('express');
const {getUser, getUserById, createUser, deleteUser, updateUser} = require('../controllers/user.controller')
const router = Router();

router.get('/user', getUser)

router.get('/user/:idUser', getUserById)

router.post('/user', createUser)

router.delete('/user/:idUser', deleteUser)

router.put('/user/:idUser', updateUser)

module.exports = router;