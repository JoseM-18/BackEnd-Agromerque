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
        const token = req.headers['x-access-token'];

        if(!token) return res.status(401).json({message: "No token provided"});

        const decoded = jwt.verify(token, config.SECRET);
        const idUser = decoded.idUser;
        console.log(req.body);

        const idCustomerBd = await pool.query('SELECT "idCustomer" FROM "Customer" WHERE "idUser" = $1', [idUser]);

        if (idCustomerBd.rows.length === 0) {
            return res.status(404).json({ message: "the customer is not in the database" })
        }

        const idCustomer = idCustomerBd.rows[0].idCustomer;

        const idShoppingCartBd = await pool.query('SELECT "idShoppingCart" FROM "ShoppingCart" WHERE "idCustomer" = $1', [idCustomer]);

        if (idShoppingCartBd.rows.length === 0) {
            return res.status(404).json({ message: "the shopping cart is not in the database" })
        }


        const idShoppingCart = idShoppingCartBd.rows[0].idShoppingCart;
    
        const { idProduct, amount } = req.body;
        console.log(idProduct, amount);
        if (!idShoppingCart || !idProduct || !amount) {
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const avaiableStock = await pool.query('SELECT "stock" FROM "Product" WHERE "idProduct" = $1', [idProduct]);
        if (avaiableStock.rows[0].stock < amount) {
            return res.status(400).json({ message: "the product is not available in the stock" })
        }
        const isInCart = await pool.query('SELECT * FROM "ShoppingCartProduct" WHERE "idShoppingCart" = $1 AND "idProduct" = $2', [idShoppingCart, idProduct]);
        if (isInCart.rows.length !== 0) {
            
            const currentAmount = parseInt(isInCart.rows[0].amount, 10);
            const newAmount = currentAmount + parseInt(amount, 10);
            await pool.query('UPDATE "ShoppingCartProduct" SET "amount" = $1 WHERE "idShoppingCart" = $2 AND "idProduct" = $3', [newAmount, idShoppingCart, idProduct]);
            
            const newStock = avaiableStock.rows[0].stock - amount;
            await pool.query('UPDATE "Product" SET "stock" = $1 WHERE "idProduct" = $2', [newStock, idProduct]);
            return res.json("the product was added to the cart ")
        }



        await pool.query('INSERT INTO "ShoppingCartProduct" ("idShoppingCart","idProduct","amount") VALUES ($1,$2,$3)', [idShoppingCart, idProduct, amount]);
        res.json("the product was added to the cart ")

        const newStock = avaiableStock.rows[0].stock - amount;
        await pool.query('UPDATE "Product" SET "stock" = $1 WHERE "idProduct" = $2', [newStock, idProduct]);



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
        const token = req.headers["x-access-token"];
        if (!token) {
            return res.status(403).json({ message: "No token provided" })
        }
        const decoded = jwt.verify(token, config.SECRET);
        const idCartProduct = decoded.idUser;
        const result = await pool.query('SELECT * FROM "ShoppingCartProduct" WHERE "idShoppingCartProduct" = $1', [idCartProduct]);

        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "Cart product doesn't found" }
            )
        }

        res.json(result.rows)

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
        res.json(result.rows)
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

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart product doesn't found" })
        }


        res.json(`Cart product ${idShoppingCartProduct} deleted succesfully`)
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
        if (!idShoppingCartProduct || !idShoppingCart || !idProduct || !quantity) {
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const resul = await pool.query('UPDATE "ShoppingCartProduct" SET "idShoppingCart" = $1, "idProduct" = $2, "quantity" = $3 WHERE "idShoppingCartProduct" = $4', [idShoppingCart, idProduct, quantity, idShoppingCartProduct]);

        if (resul.rowCount === 0) {
            return res.status(404).json({ message: "Cart product doesn't found" })
        }

        res.json("cart " + idShoppingCartProduct + " updated succesfully")
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error updateCartProduct" })
    }
}

module.exports = { createShoppingCartProduct, getShoppingCartProductById, getShoppingCartProduct, updateShoppingCartProduct, deleteShoppingCartProduct };