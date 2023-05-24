const pool = require('../database');

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

/**
 * Create a new customer
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createCustomer = async (req, res) => {
    
    const { idCustomer, name, lastName, phone, address, email } = req.body;
    
    try {

        if (!idCustomer || !name || !lastName || !phone || !address || !email) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const result = await pool.query(
            'INSERT INTO "Customer" ("idCustomer", "name", "lastName", "phone", "address", "email") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
            [idCustomer, name, lastName, phone, address, email]
        );

        res.json(result.rows[0])
    } catch (error) {
        res.json({ error: error.message })
    }
}