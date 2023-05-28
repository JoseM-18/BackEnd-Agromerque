const {Router} = require('express');
const {getUser, getUserById, createUser, deleteUser, updateUser, signup, signin} = require('../controllers/user.controller')
const {jsonwt,verifySignUp} = require('../middlewares/index')
const router = Router();

router.post('/signup', signup)

router.post('/signin', signin)

router.get('/user', getUser)

router.get('/user/:idUser', getUserById)


router.delete('/user/:idUser',deleteUser)

router.put('/user/:idUser', updateUser)

module.exports = router;