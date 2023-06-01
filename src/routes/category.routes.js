const { Router } = require('express');

const router = Router();

const {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');

router.get('/Category', getAllCategories)

router.get('/Category/:idCategory', getCategoryById)

router.get('/Category/name/:name', getCategoryByName)

router.post('/Category', createCategory)

router.delete('/Category/:idCategory', deleteCategory)

router.put('/Category/:idCategory', updateCategory)

module.exports = router;