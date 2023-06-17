const pool = require('../database');
const jwt = require('jsonwebtoken');

/**
 * funcion que verifica si el id existe en la base de datos
 * 
 */
const isIdInDB = async (req, res, next) => {
    try{
        const { idCustomer } = req.params;
        const result = await pool.query('SELECT * FROM "Customer" WHERE "idCustomer" = $1', [idCustomer]);
        
        if (result.rows.length === 1) {
            return res.status(404).json(
                { message: "the user is already in the database" }
            )
        }
        next();
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error isIdInDB" });
    }
}

module.exports = {isIdInDB};