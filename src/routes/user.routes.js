const { Router } = require('express');

const router = Router();

const { jsonwt, verifySignUp } = require('../middlewares/index')

const { 
    getUser, 
    getUserById, 
    deleteUser, 
    updateUser, 
    signUp, 
    signIn 
} = require('../controllers/user.controller')

router.post('/signup', signUp)

router.post('/signin', signIn)

router.get('/user', getUser)

router.get('/user/:idUser', getUserById)

router.delete('/user/:idUser', deleteUser)

router.put('/user/:idUser', updateUser)

module.exports = router;