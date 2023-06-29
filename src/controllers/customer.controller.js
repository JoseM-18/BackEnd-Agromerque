const pool = require('../database');

/**
 * Devuelve todos los clientes
 * @param {*} req 
 * @param {*} res 
 */
const getAllCustomers = async (req, res) => {

    try {
        const result = await pool.query('SELECT * FROM "Customer";')
        res.json(result.rows)
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
        const idUser = req.params.idCustomer;
        console.log(idUser);
        const result = await pool.query('SELECT name, lastname, email, phone, password, address FROM "Customer" INNER JOIN "User" ON "Customer"."idUser" = "User"."idUser" WHERE "Customer"."idUser" = $1', [idUser]);
        /** 
       const result = await pool.query('SELECT * FROM "Customer" WHERE "idCustomer" = $1', [idCustomer]);
        * 
        */

        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "Customer doesn't found" }
            )
        }

        res.json(result.rows[0])

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error getCustomerById" });
    }
}

/**
 * funcion que actualiza un cliente por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateCustomer = async (req, res) => {
    try {
        const { idCustomer } = req.params;
        const { name, lastname, phone, address } = req.body;
        if (!idCustomer || !name || !lastname || !phone || !address) {
            return res.status(404).json({ message: "Please. Send all data" })
        }
        const nameFormat = format(name);
        const lastnameFormat = format(lastname);

        const result = await pool.query(
            'UPDATE "Customer" SET "name" = $1, "lastname" = $2, "phone" = $3, "address" = $4 WHERE "idCustomer" = $5',
            [nameFormat, lastnameFormat, phone, address, idCustomer]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Customer doesn't found" })
        }

        res.json({ message: "Customer Updated" })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error updateCustomer" })
    }
}
/**
 * Crea un cliente
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createCustomer = async (idUser, name, lastname, address, birthdate, phone) => {

    try {

        if (!idUser || !name || !lastname || !phone || !address || !birthdate) {
            return "Please. Send all data"
        }

        await pool.query(
            'INSERT INTO "Customer" ("idUser", "name", "lastname", "address", "birthdate", "phone") VALUES ($1, $2, $3, $4, $5, $6) ',
            [idUser, name, lastname, address, birthdate, phone]
        );

        return "Customer " + name + " created"
    } catch (error) {
        if (error.code === '23505') {
            return "the customer is already in the database"
        } else {
            console.error(error);
            return "Internal server error createCustomer"
        }
    }
}

/**
 * Elimina un cliente por su id
 * @param {*} req 
 * @param {*} res 
 */
const deleteCustomer = async (req, res) => {
    try {

        const { idCustomer } = req.params;

        const result = await pool.query('DELETE FROM "Customer" WHERE "idCustomer" = $1', [idCustomer]);

        if (result.rowCount === 0) {
            return res.status(404).json(
                { message: "Customer doesn't found" }
            )
        }

        res.json({ message: "Customer Deleted" })
    }
    catch (error) {

        console.log(error.message)
        return res.status(500).json({ message: "Internal server error deleteCustomer" });

    }
}

//---------------------------------------funciones que no se exportan pero que se usan en este archivo---------------------------------------//

const format = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

module.exports = { getAllCustomers, getCustomerById, createCustomer, deleteCustomer, updateCustomer }
