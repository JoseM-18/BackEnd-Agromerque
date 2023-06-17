const pool = require("../database");

/**
 * Funcion que crea un metodo de pago
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createPaymentMethod = async (req, res) => {
    try {

        const { idpaymentMethod, category, bank, accountNumber, owner, securityCode, paymentStatus } = req.body;

        if (!idpaymentMethod || !category || !bank || !accountNumber || !owner || !securityCode || !paymentStatus) {
            return res.status(400).json({ message: "Please. Send all data" });
        }

        await pool.query(
            'INSERT INTO "PaymentMethod" (idpaymentMethod, category, bank, accountNumber, owner, securityCode, paymentStatus) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [idpaymentMethod, category, bank, accountNumber, owner, securityCode, paymentStatus]
        );

        res.json({ message: "PaymentMethod created" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error createPaymentMethod" });
    }
}

/**
 * Funcion que obtiene todos los metodos de pago
 * @param {*} req 
 * @param {*} res  
 */
const getPaymentMethod = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "PaymentMethod"');
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error getPaymentMethod" });
    }
}

/**
 * Funcion que obtiene un metodo de pago por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getPaymentMethodById = async (req, res) => {

    try {

        const token = req.headers["x-access-token"];
        const decoded = jwt.verify(token, config.SECRET);
        const idCustomer = decoded.idCustomer;
        

        if (!idCustomer) {
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const idPaymentMethodbd = await pool.query('SELECT "idPaymentMethod" FROM "PaymentMethod" WHERE "idCustomer" = $1', [idCustomer]);
        const idpaymentMethod = idPaymentMethodbd.rows[0].idpaymentMethod;

        const result = await pool.query('SELECT * FROM "PaymentMethod" WHERE idpaymentMethod = $1', [idpaymentMethod]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Customer doesn't found" })
        }

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error getPaymentMethodById" });
    }
}

/**
 * Funcion que actualiza un metodo de pago por su id
 * @param {*} req 
 * @param {*} res
 * @returns 
 */
const updatePaymentMethod = async (req, res) => {
    try {
        const { idpaymentMethod } = req.params;
        const { category, bank, accountNumber, owner, securityCode, paymentStatus } = req.body;
        if (!idpaymentMethod || !category || !bank || !accountNumber || !owner || !securityCode || !paymentStatus) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const result = await pool.query(
            'UPDATE "PaymentMethod" SET category = $1, bank = $2, accountNumber = $3, owner = $4, securityCode = $5, paymentStatus = $6 WHERE idpaymentMethod = $7',
            [category, bank, accountNumber, owner, securityCode, paymentStatus, idpaymentMethod]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Customer doesn't found" })
        }

        res.json({ message: "PaymentMethod updated" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error updatePaymentMethod" });
    }
}

/**
 * Funcion que elimina un metodo de pago por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deletePaymentMethod = async (req, res) => {
    try {

        const { idpaymentMethod } = req.params;
        const result = await pool.query('DELETE FROM "PaymentMethod" WHERE idpaymentMethod = $1', [idpaymentMethod]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Customer doesn't found" })
        }

        res.json({ message: "PaymentMethod deleted" });

    } catch (error) {
        console.log(error);
    }
}

module.exports = { createPaymentMethod, getPaymentMethod, getPaymentMethodById, deletePaymentMethod, updatePaymentMethod };