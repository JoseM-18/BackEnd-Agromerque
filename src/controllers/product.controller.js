const jwt = require('jsonwebtoken');
const pool = require('../database');
/**
 * obtener todos los productos de la base de datos
 * params: req, res
 * return: json
*/
const getProduct = async (req, res) => {

  const result = await pool.query('SELECT * FROM public."Product";')
  const result2 = await pool.query('SELECT * FROM public."ProductDetail";')
  console.log(result)
  console.log(result2)
  res.send(result.rows);
}

/**
 * obtener un producto por id
 * params: req, res
 * return: json
 */
const getProductById = async (req, res) => {

  try {
    const { idProduct } = req.params;
    const result = await pool.query('SELECT * FROM public."Product" WHERE "idProduct" = $1', [idProduct]);
    if (result.rows.length != 0) {
      const idDetail = result.rows[0].idDetail;
      const result2 = await pool.query('SELECT * FROM public."ProductDetail" WHERE "idDetail" = $1', [idDetail]);
      console.log(result2)
      res.send(result2.rows)
    } else {
      res.send("El producto no esta registrado")
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * crear un producto en la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const createProduct = async (req, res) => {
  try {

    const { idProduct, name, description, purchasePrice, salePrice, stock, color, size, weight, image, harvestDate } = req.body;
    if (!idProduct || !name || !description || !purchasePrice || !salePrice || !stock || !color || !size || !weight || !image || !harvestDate) {
      return res.status(400).json({ message: "Please. Send all data" })
    }
    // Insertar el detalle del producto en la tabla ProductDetail
    const detailResult = await pool.query(
      'INSERT INTO public."ProductDetail" ("color", "size", "weight", "description", "image ", "harvestDate") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "idDetail"',
      [color, size, weight, description, image, harvestDate]
    );

    const idDetail = detailResult.rows[0].idDetail;
    // Insertar el producto en la tabla Product
    const productResult = await pool.query(
      'INSERT INTO public."Product" ("idProduct", "idDetail", "name",  "purchasePrice", "salePrice", "stock") VALUES ($1, $2, $3, $4, $5, $6)',
      [idProduct, idDetail, name, purchasePrice, salePrice, stock]
    );
    console.log(productResult);

  } catch (error) {
    console.log(error)
  }

  res.send("Creating a product");
};

/**
 * actualizar un producto en la base de datos
 * @param {*} req 
 * @param {*} res 
*/
const updateProduct = async (req, res) => {
  const id = req.params.idProduct;
  const { name, purchasePrice, salePrice, stock, color, size, weight, description, image, harvestDate } = req.body;
  if(!name || !purchasePrice || !salePrice || !stock || !color || !size || !weight || !description || !image || !harvestDate){
    return res.status(400).json({ message: "Please. Send all data (name, purchasePrice, salePrice, stock, color, size, weight, description, image, harvestDate)" })
  }
  const result = await pool.query('UPDATE public."Product" SET "name" = $1, "purchasePrice" = $2, "salePrice" = $3, "stock" = $4 WHERE "idProduct" = $5', [
    name,
    purchasePrice,
    salePrice,
    stock,
    id
  ]);
  const idDetailP = await pool.query('SELECT "idDetail" FROM public."Product" WHERE "idProduct" = $1', [id]);
  const idDetail = idDetailP.rows[0].idDetail;
  console.log(idDetail)
  const result2 = await pool.query('UPDATE public."ProductDetail" SET "color" = $1, "size" = $2, "weight" = $3, "description" = $4, "image " = $5, "harvestDate" = $6 WHERE "idDetail" = $7', [
    color,
    size,
    weight,
    description,
    image,
    harvestDate,
    idDetail
  ]);
  console.log(result2)
  res.send("updating a product")
}

/**
 * eliminar un producto en la base de datos
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deleteProduct = async (req, res) => {
  const idProduct = req.params.idProduct;
  let idDetail = null;
  // Obtener el idDetail correspondiente al producto
  const detailResult = await pool.query(
    'SELECT "idDetail" FROM public."Product" WHERE "idProduct" = $1',
    [idProduct]
  );
  console.log(detailResult);
  if (detailResult.rows.length > 0) {
    idDetail = detailResult.rows[0].idDetail;
    // Eliminar el producto de la tabla "Product" (incluye el idDetail relacionado)
    const productDeleteResult = await pool.query(
      'DELETE FROM public."Product" WHERE "idProduct" = $1',
      [idProduct]
    );

    console.log(productDeleteResult);
  } else {
    return res.send("El producto no esta registrado")
  }

  // Eliminar el detalle del producto de la tabla "ProductDetail"
  const detailDeleteResult = await pool.query(
    'DELETE FROM public."ProductDetail" WHERE "idDetail" = $1',
    [idDetail]
  );

  console.log(detailDeleteResult);

  res.send("Deleting a product");
};

module.exports = { getProduct, getProductById, createProduct, updateProduct, deleteProduct };