const jwt = require('jsonwebtoken');

/**
 * obtener todos los productos de la base de datos
 * params: req, res
 * return: json
*/
const getProduct = async (req, res) => {
    const response = await pool.query('SELECT * FROM product');
    res.status(200).json(response.rows);
}

/**
 * obtener un producto por id
 * params: req, res
 * return: json
 */
const getProductById = async (req, res) => {
    const id = req.params.id;
    const response = await pool.query('SELECT * FROM product WHERE id = $1', [id]);
    res.json(response.rows);
}

/**
 * crear un producto en la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const createProduct = async (req, res) => {
    const { name, description, price, image } = req.body;
    const response = await pool.query('INSERT INTO product (name, description, price, image) VALUES ($1, $2, $3, $4)', [name, description, price, image]);
    res.json({
        message: 'Product Added successfully',
        body: {
            product: { name, description, price, image }
        }
    })
}

/**
 * actualizar un producto en la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const updateProduct = async (req, res) => {
    const id = req.params.id;
    const { name, description, price, image } = req.body;

    const response = await pool.query('UPDATE product SET name = $1, description = $2, price = $3, image = $4 WHERE id = $5', [
        name,
        description,
        price,
        image,
        id
    ]);
    res.json('Product Updated Successfully');
}

/**
 * eliminar un producto en la base de datos
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deleteProduct = async (req, res) => {
    const id = req.params.id;
    const response = await pool.query('DELETE FROM product where id = $1', [id]);
    res.json(`Product ${id} deleted Successfully`);
}

module.exports = {getProduct, getProductById, createProduct, updateProduct, deleteProduct};