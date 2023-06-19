const pool = require('../database');

/**
 * obtiene todos los pedidos
 * @param {*} req 
 * @param {*} res 
 */
const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Order";')
        res.json(result.rows)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getAllOrders" });
    }
}

/**
 * obtiene un pedido por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getOrderById = async (req, res) => {
    try {
        const { idOrder } = req.params;
        const result = await pool.query('SELECT * FROM "Order" WHERE "idOrder" = $1', [idOrder]);
        
        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "Order doesn't found" }
            )
        }

        res.json(result.rows);

    } catch (error) {
        console.log(error.message)
    }
}

/**
 * crea un pedido 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createOrder = async (req, res) => {
    try {

        const { idCustomer,idPaymentMethod,idShoppingCart, date, orderTotal} = req.body;
        if (!idCustomer || !idPaymentMethod || !date || !orderTotal) {
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const isCartExist = await pool.query('SELECT * FROM "Order" WHERE "idOrder" = $1', [idOrder]);
        if (isCartExist.rows.length === 0) {
            return res.status(400).json({ message: "shopping cart does not exist" })
        }

        const ShoppingCartHasProducts = await pool.query('SELECT * FROM "ShoppingCartProduct" WHERE "idShoppingCart" = $1', [idShoppingCart]);
        if (ShoppingCartHasProducts.rows.length === 0) {
            return res.status(400).json({ message: "shopping cart does not have products" })
        }

        const result = await pool.query('INSERT INTO "Order" ("idCustomer","idPaymentMethod","idShoppingCart","date", "orderTotal") VALUES ($1, $2, $3, $4, $5)', 
        [idCustomer, idPaymentMethod, idShoppingCart,date, orderTotal]);
        res.json("creating a order")

    } catch (error) {

        if (error.code === '23505') {
            res.status(400).json({ message: "the order is already in the database" })
        } else {
            console.error(error);
            res.status(500).json({ message: "Internal server error createOrder" })
        }

    }
  }

  /**
   * actualiza un pedido por su id
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
const updateOrder = async (req, res) => {
    try {
        const { idOrder } = req.params;
        const { idPaymentMethod, date, orderTotal} = req.body;
        if ( !idPaymentMethod || !date || !orderTotal) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const result = await pool.query(
            'UPDATE "Order" SET "" = $1, "idPaymentMethod" = $2, "date" = $3, "orderTotal" = $4 WHERE "idOrder" = $5',
            [idPaymentMethod, date, orderTotal, idOrder]
        );
        res.json(`Order updated successfully`)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error updateOrder" })
    }
}

/**
 * borra un pedido por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteOrder = async (req, res) => {
    try{

        const { idOrder } = req.params;
        
        const result = await pool.query('DELETE FROM "Order" WHERE "idOrder" = $1', [idOrder]);
        
        if(result.rowCount === 0) {
            return res.status(404).json(
                { message: "Order doesn't found" }
            )
        }

        res.json(`Order deleted successfully`)
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error deleteOrder" })
    }
}



module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder }
