const pool = require('../database');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * agrega un producto al carrito de compras en la tabla ShoppingCartProduct de la base de datos
 * @param {*} req
 * @param {*} res
 * @returns 
 */
const createShoppingCartProduct = async (req, res) => {
    try {
        const { idShoppingCart, idProduct, quantity } = req.body;

        if(!idShoppingCart || !idProduct || !quantity){
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const isInCart = await pool.query('SELECT * FROM "ShoppingCartProduct" WHERE "idShoppingCart" = $1 AND "idProduct" = $2', [idShoppingCart, idProduct]);
        if (isInCart.rows.length !== 0) {
            return res.status(400).json({ message: "the product is already in the cart" })
        }
 
        await pool.query('INSERT INTO "ShoppingCartProduct" ("idShoppingCart","idProduct","quantity") VALUES ($1,$2,$3)', [idShoppingCart, idProduct, quantity]);
        res.send("the product " + idProduct + " was added to the cart " + idShoppingCart )

    } catch (error) {

        if (error.code === '23505') {
            res.status(400).json({ message: "the cart product is already in the database" })
        } else {
            console.error(error);
            res.status(500).json({ message: "Internal server error createCartProduct" })
        }

    }
}

/**
 * obtiene un producto del carrito de compras por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getShoppingCartProductById = async (req, res) => {
    try {
        const { idShoppingCartProduct } = req.params;
        const result = await pool.query('SELECT * FROM "ShoppingCartProduct" WHERE "idShoppingCartProduct" = $1', [idShoppingCartProduct]);

        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "Cart product doesn't found" }
            )
        }

        res.send(result.rows[0])

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getCartProductById" })
    }
}

/**
 * obtiene todos los productos del carrito de compras en la tabla ShoppingCartProduct de la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const getShoppingCartProduct = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "ShoppingCartProduct"');
        res.send(result.rows)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getCartProduct" })
    }
}

/**
 * elimina un producto del carrito de compras en la tabla ShoppingCartProduct de la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const deleteShoppingCartProduct = async (req, res) => {
    try {
        const { idShoppingCartProduct } = req.params;
        const result = await pool.query('DELETE FROM "ShoppingCartProduct" WHERE "idShoppingCartProduct" = $1', [idShoppingCartProduct]);
        
        if(result.rowCount === 0){
            return res.status(404).json({ message: "Cart product doesn't found" })
        }

        
        res.send(`Cart product ${idShoppingCartProduct} deleted succesfully`)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error deleteCartProduct" })
    }
}

/**
 * actualiza un producto del carrito de compras en la tabla ShoppingCartProduct de la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const updateShoppingCartProduct = async (req, res) => {
    try {
        const { idShoppingCartProduct } = req.params;
        const { idShoppingCart, idProduct, quantity } = req.body;
        if(!idShoppingCartProduct || !idShoppingCart || !idProduct || !quantity){
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const resul = await pool.query('UPDATE "ShoppingCartProduct" SET "idShoppingCart" = $1, "idProduct" = $2, "quantity" = $3 WHERE "idShoppingCartProduct" = $4', [idShoppingCart, idProduct, quantity, idShoppingCartProduct]);
        
        if(resul.rowCount === 0){
            return res.status(404).json({ message: "Cart product doesn't found" })
        }
        
        res.send("cart " + idShoppingCartProduct + " updated succesfully")
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error updateCartProduct" })
    }
}

module.exports = { createShoppingCartProduct, getShoppingCartProductById, getShoppingCartProduct, updateShoppingCartProduct,deleteShoppingCartProduct };