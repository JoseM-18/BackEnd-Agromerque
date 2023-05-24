const pool = require('../database');
const { createProduct } = require('./product.controller');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getAllCustomers = async (req, res) => {

    try {
        const result = await pool.query('SELECT * FROM "Customer";')
        res.send(result.rows)
    } catch (error) {
        console.log(error.message)
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getCustomerById = async (req, res) => { 
    try {
        const { idCustomer } = req.params;
        const result = await pool.query('SELECT * FROM "Customer" WHERE "idCustomer" = $1', [idCustomer]);
        
        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "Customer doesn't found" }
            )
        }

        res.send(result.rows[0])

    } catch (error) {
        console.log(error.message)
    }
}


