const pool = require('../database');
const jwt = require('jsonwebtoken');
const config = require('../config');


/**
 * Funcion que crea un carrito en la base de datos
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createShoppingCart = async (req, res) => {
    try {
        const token = req.headers['x-access-token']
        const decoded = jwt.verify(token, config.SECRET);
        const idUser = decoded.idUser;
        const idCustomerQuey = await pool.query('SELECT "idCustomer" FROM "Customer" WHERE "idUser" = $1', [idUser]);
        const idCustomer = idCustomerQuey.rows[0].idCustomer;
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        if (!idCustomer) {
            return res.status(400).json({ message: "Please. Send all data" })
        }
        const result = await pool.query('INSERT INTO "ShoppingCart" ("idCustomer","creationDate") VALUES ($1,$2)', [idCustomer, formattedDate]);
        console.log(result)
        res.json("cart created")

    } catch (error) {

        if (error.code === '23505') {
            res.status(400).json({ message: "the cart is already in the database" })
        } else {
            console.error(error);
            res.status(500).json({ message: "Internal server error createCart" })
        }

    }
}

/**
 * Funcion que obtiene un carrito por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getShoppingCartByIdUser = async (req, res) => {
    try {
        const token = req.headers['x-access-token']
        const decoded = jwt.verify(token, config.SECRET);
        const idUser = decoded.idUser;
        const idCustomerQuey = await pool.query('SELECT "idCustomer" FROM "Customer" WHERE "idUser" = $1', [idUser]);
        const idCustomer = idCustomerQuey.rows[0].idCustomer;

        if (!idCustomer) {
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const result = await pool.query('SELECT * FROM "ShoppingCart" WHERE "idCustomer" = $1', [idCustomer]);
 
        if(result.rowCount === 0){
            return res.status(404).json({message: "Cart doesn't found"})
        }
        const productsInCart = await pool.query('SELECT * FROM "ShoppingCartProduct" WHERE "idShoppingCart" = $1', [result.rows[0].idShoppingCart]);
        result.rows[0].products = productsInCart.rows;
        
        res.json(result.rows[0]);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error getCarts" });
    }

}



/**
 * Funcion que obtiene todos los carritos
 * @param {*} req 
 * @param {*} res 
 */
const getShoppingCart = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "ShoppingCart" NATURAL JOIN "ShoppingCartProduct";')
        res.json(result.rows);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getCarts" });
    }
}

/**
 * Funcion que actualiza un carrito por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateShoppingCart = async (req, res) => {
    try {
        const { idShoppingCart } = req.params;
        const { creationDate } = req.body;
        if (!idShoppingCart || !creationDate) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const result = await pool.query(
            'UPDATE "ShoppingCart" SET "creationDate" = $1 WHERE "idShoppingCart" = $2',
            [creationDate, idShoppingCart]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart doesn't found" })
        }

        console.log(result)
        res.json("the cart " + idShoppingCart + " has been updated")
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error updateCart" })
    }
}

/**
 * Funcion que elimina un carrito por su id
 * @param {*} req 
 * @param {*} res 
 */
const deleteShoppingCart = async (req, res) => {
    try {
        const { idShoppingCart } = req.params;
        const result = await pool.query('DELETE FROM "ShoppingCart" WHERE "idShoppingCart" = $1', [idShoppingCart]);
        console.log(result)
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart doesn't found" })
        }

        res.json("deleting a cart")
    } catch (error) {
        console.log(error.message)
    }
}

const subTotal = async (req, res) => {
    try {
        const { idShoppingCart } = req.params;
        const result = await pool.query('SELECT SUM("price" * "quantity") AS "subTotal" FROM "ShoppingCartProduct" NATURAL JOIN "Product" WHERE "idShoppingCart" = $1',
            [idShoppingCart]);
        console.log(result)
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart doesn't found" })

        }
        res.json(result.rows[0])
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error subTotal" })
    }
}

const getAllShoppingCartProducts = async (req, res) => {
    try {

        
        if (!req.headers['x-access-token']) {
            return res.status(400).json({ message: "signing again" })
        }
        const token = req.headers['x-access-token']
        const decoded = jwt.verify(token, config.SECRET);
        const idCustomer = decoded.idCustomer;
        const result = await pool.query('SELECT "idProduct", "amount" FROM "ShoppingCart" NATURAL JOIN "ShoppingCartProduct" WHERE "idCustomer" = $1', [idCustomer]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart doesn't found" })
        }
        res.json(result.rows);
        console.log(result.rows)
    }catch (error){
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error getAllShoppingCartProducts" })
    }

}


module.exports = { createShoppingCart, getShoppingCartByIdUser, getShoppingCart, updateShoppingCart, deleteShoppingCart,getAllShoppingCartProducts }