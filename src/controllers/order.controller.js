const pool = require('../database');
const jwt = require('jsonwebtoken');
const config = require('../config');


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

    const { selectedPayment, productsToSend, total } = req.body;

    const idCustomer = selectedPayment.idCustomer;
    const idPaymentMethod = selectedPayment.idPaymentMethod;
    const currentDate = new Date();
    const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

    if (!idCustomer || !idPaymentMethod || !date || !total) {
      return res.status(400).json({ message: "Please. Send all data" })
    }

    const createOrderQuery = `
      INSERT INTO "Order" ("idCustomer", "idPaymentMethod", "date", "orderTotal")
      VALUES ($1, $2, $3, $4)
      RETURNING "idOrder"
    `;
    const orderValues = [idCustomer, idPaymentMethod, date, total];
    const createOrderResult = await pool.query(createOrderQuery, orderValues);

    if (createOrderResult.rowCount === 0) {
      return res.status(400).json({ message: "Order cannot be created" });
    }

    const idOrder = createOrderResult.rows[0].idOrder;

    const orderDetailValues = productsToSend.map((product) => [
      idOrder,
      product.idProduct,
      product.amount
    ]);

    // Crear los detalles del pedido en la base de datos (tabla OrderDetail) por medio de una consulta SQL con múltiples valores
    // (INSERT INTO ... VALUES ...), para evitar hacer múltiples consultas SQL (una por cada producto) y así mejorar el rendimiento de la aplicación
    const createOrderDetailQuery = `
      INSERT INTO "OrderDetail" ("idOrder", "idProduct", "amountProd")
      VALUES ${orderDetailValues.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(', ')}
    `;

    // El método flat() aplana un array de arrays en un solo array para poder pasarlo como parámetro a la consulta SQL (que recibe un array de valores)  
    const createOrderDetailValues = orderDetailValues.flat();

    // Ejecutar la consulta SQL para crear los detalles del pedido
    await pool.query(createOrderDetailQuery, createOrderDetailValues);

    // Actualizar el stock de los productos del pedido
    const updateProductStockQuery = `
      UPDATE "Product"
      SET "stock" = "stock" - "amountProd"
      FROM "OrderDetail"
      WHERE "Product"."idProduct" = "OrderDetail"."idProduct"
      AND "OrderDetail"."idOrder" = $1
    `;
    await pool.query(updateProductStockQuery, [idOrder]);

    //borrar los productos del carrito
    const deleteCartProductsQuery = `
    DELETE FROM "ShoppingCartProduct"
    WHERE "idShoppingCart" IN (
      SELECT "idShoppingCart"
      FROM "ShoppingCart"
      WHERE "idCustomer" = $1
    );
    `;
    await pool.query(deleteCartProductsQuery, [idCustomer]);


    // Obtener información completa de los productos del pedido (incluyendo su información de detalle) para enviarla en la respuesta
    const productIds = productsToSend.map((product) => product.idProduct);
    const getProductQuery = `
      SELECT P.*, PD.*
      FROM "Product" P
      JOIN "ProductDetail" PD ON P."idDetail" = PD."idDetail"
      WHERE P."idProduct" IN (${productIds.join(',')})
    `;

    // Ejecutar la consulta SQL para obtener la información de los productos del pedido
    const getProductResult = await pool.query(getProductQuery);

    // Crear un array con la información de los productos del pedido (incluyendo su información de detalle) para enviarla en la respuesta 
    const products = productsToSend.map((product) => {
      const productInfo = getProductResult.rows.find((row) => row.idProduct === product.idProduct);
      return {
        ...productInfo,
        amount: product.amount
      };
    });

    const orderData = {
      message: "Order created successfully",
      idOrder,
      idCustomer,
      idPaymentMethod,
      date,
      orderTotal: total,
      products
    };

    res.status(200).json(orderData);

  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ message: "The order is already in the database" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error createOrder" });
    }
  }
};

/**
 * actualiza un pedido por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateOrder = async (req, res) => {
  try {
    const { idOrder } = req.params;
    const { idPaymentMethod, date, orderTotal } = req.body;
    if (!idPaymentMethod || !date || !orderTotal) {
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
  try {

    const { idOrder } = req.params;

    const result = await pool.query('DELETE FROM "Order" WHERE "idOrder" = $1', [idOrder]);

    if (result.rowCount === 0) {
      return res.status(404).json(
        { message: "Order doesn't found" }
      )
    }

    res.json(`Order deleted successfully`)
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ message: "Internal server error deleteOrder" })
  }
}






module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder }
