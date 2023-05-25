const pool = require('../database');

/**
 * Devuelve todos los clientes
 * @param {*} req 
 * @param {*} res 
 */
const getAllCustomers = async (req, res) => {

    try {
        const result = await pool.query('SELECT * FROM "Customer";')
        res.send(result.rows)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getAllCustomers" });
    }
}

/**
 * Devuelve un cliente por su id
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

const updateCustomer = async (req, res) => {
    try {
        const { idCustomer } = req.params;
        const { name, lastName, phone, address } = req.body;
        if (!idCustomer || !name || !lastName || !phone || !address ) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const result = await pool.query(
            'UPDATE "Customer" SET "name" = $1, "lastName" = $2, "phone" = $3, "address" = $4, WHERE "idCustomer" = $5',
            [name, lastName, phone, address, idCustomer]
        );
        console.log(result)
        res.send("updating a customer")
    } catch (error) {
        console.log(error.message)
    }
}
/**
 * Crea un cliente
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createCustomer = async (req, res) => {
    
    const { idCustomer, name, lastName, phone, address } = req.body;
    
    try {

        if (!idCustomer || !name || !lastName || !phone || !address || !email) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const result = await pool.query(
            'INSERT INTO "Customer" ("idCustomer", "name", "lastName", "phone", "address") VALUES ($1, $2, $3, $4, $5, ) RETURNING *', 
            [idCustomer, name, lastName, phone, address]
        );

        res.json(result.rows[0])
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ message: "Customer already exists" })
        }else{
            console.error(error);
            res.status(500).json({ message: "Internal server error createCustomer" });
        }
    }
}

/**
 * Elimina un cliente por su id
 * @param {*} req 
 * @param {*} res 
 */
const deleteCustomer = async (req, res) => {
    try{

        const { idCustomer } = req.params;
        
        const result = await pool.query('DELETE FROM "Customer" WHERE "idCustomer" = $1', [idCustomer]);
        
        if(result.rowCount === 0) {
            return res.status(404).json(
                { message: "Customer doesn't found" }
                )
            }
            
            res.sendStatus(204);
        }
        catch(error){
            
            console.log(error.message)

        }
    }

module.exports = { getAllCustomers, getCustomerById, createCustomer, deleteCustomer, updateCustomer }
