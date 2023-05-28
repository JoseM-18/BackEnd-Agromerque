const pool = require('../database');

const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Order";')
        res.send(result.rows)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getAllOrders" });
    }
}

const getOrderById = async (req, res) => {
    try {
        const { idOrder } = req.params;
        const result = await pool.query('SELECT * FROM "Order" WHERE "idOrder" = $1', [idOrder]);
        
        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "Order doesn't found" }
            )
        }

        res.send(result.rows[0])

    } catch (error) {
        console.log(error.message)
    }
}

const createOrder = async (req, res) => {
    try {

        const { idCustomer,idPaymentMethod, date, orderTotal} = req.body;
        if (!idCustomer || !idPaymentMethod || !date || !orderTotal) {
            return res.status(400).json({ message: "Please. Send all data" })
        }
        const result = await pool.query('INSERT INTO "Order" ("idCustomer","idPaymentMethod","date", "orderTotal") VALUES ($1, $2, $3, $4)', 
        [idCustomer, idPaymentMethod, date, orderTotal]);
        console.log(result)
        res.send("creating a order")

    } catch (error) {

        if (error.code === '23505') {
            res.status(400).json({ message: "the order is already in the database" })
        } else {
            console.error(error);
            res.status(500).json({ message: "Internal server error createOrder" })
        }

    }
  }

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
        console.log(result)
        res.send("updating a order")
    } catch (error) {
        console.log(error.message)
    }
}

const deleteOrder = async (req, res) => {
    try{

        const { idOrder } = req.params;
        
        const result = await pool.query('DELETE FROM "Order" WHERE "idOrder" = $1', [idOrder]);
        
        if(result.rowCount === 0) {
            return res.status(404).json(
                { message: "Order doesn't found" }
            )
        }

        res.send(`Order ${idOrder} deleted successfully`)
    }catch(error){
        console.log(error.message)
    }
}

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder }
