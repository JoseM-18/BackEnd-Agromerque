const jwt = require('jsonwebtoken');
const pool = require('../database');

/**
 * Funcion para obtener todos los productos
 * @param {*} req 
 * @param {*} res 
 */
const getProduct = async (req, res) => {

  const result = await pool.query('SELECT * FROM "Product" NATURAL JOIN "ProductDetail"')
  console.log(result)

  res.send(result.rows);
}

/**
 * Funcion para obtener un producto por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getProductById = async (req, res) => {

  try {
    const { idProduct } = req.params;
    const result = await pool.query('SELECT * FROM "Product" NATURAL JOIN "ProductDetail" WHERE "idProduct" = $1', [idProduct]);
    console.log(result)

    if (result.rows.length === 0) {
      return res.status(404).json(
        { message: "Product doesn't found" }
      )
    }
    res.json(result.rows);
  } catch (error) {
    console.log(error)
  }
}

/**
 * Funcion que obtiene un producto por su nombre
 * @param {*} req 
 * @param {*} res 
 */
const getProductByName = async (req, res) => {
  const { name } = req.params;
  const result = await pool.query('SELECT * FROM "Product" NATURAL JOIN "Product" NATURAL JOIN "ProductDetail" WHERE "name" = $1', [name]);
  console.log(result)
  res.send(result.rows);
}

/**
 * Crear un producto en la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const createProduct = async (req, res) => {
  try {

    const { idProduct, category } = req.body;

    if (!verificarProducto(req)) {
      return res.status(400).json({ message: "Please. Send all data" })
    }

    const categoryExists = await pool.query(
      'SELECT * FROM "Category" WHERE "name" = $1 ',
      [category]
    );

    if (categoryExists.rows.length === 0) {
      return res.status(400).json({ message: "Category doesn't exists" })
    }

    const idCategory = categoryExists.rows[0].idCategory;

    // Insertar el detalle del producto en la tabla ProductDetail
    const idDetail = await insertInDetailProduct(req);
    console.log(idDetail);

    // Insertar el producto en la tabla Product
    const productResult = await insertInProduct(req, idDetail);
    console.log(productResult);

    // Insertar el producto en la tabla ProductCategory
    const productCategory = await insertInProductCategory(idProduct, idCategory);
    console.log(productCategory);

    res.send("creating a product")
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ message: "Product already exists" })
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error createProduct" });
    }
  }

};

/**
 * Actualizar un producto en la base de datos
 * @param {*} req 
 * @param {*} res 
*/
const updateProduct = async (req, res) => {

  if (req.params.idProduct === undefined) {
    return res.status(400).json({ message: "Please. Send id product" })
  }
  const { idProduct } = req.params;
  console.log("id en uppro" + idProduct)

  if (!verificarActualizarProducto(req)) {
    return res.status(400).json({ message: "Please. Send all data" })
  }

  const updateProduct = await updateInProduct(req, idProduct);
  if (updateProduct !== "ok") {
    return res.status(400).json({ message: updateProduct })
  }

  const updateProductDetail = await updateInProductDetail(req, idProduct);
  console.log(updateProductDetail)
  res.send("updating a product")
}

/**
 * Eliminar un producto en la base de datos
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deleteProduct = async (req, res) => {
  const idProduct = req.params.idProduct;

  let idDetail = null;
  // Obtener el idDetail correspondiente al producto
  const detailResult = await pool.query(
    'SELECT "idDetail" FROM "Product" WHERE "idProduct" = $1',
    [idProduct]
  );
  console.log(detailResult);
  if (detailResult.rows.length > 0) {
    idDetail = detailResult.rows[0].idDetail;
    // Eliminar el producto de la tabla "Product" (incluye el idDetail relacionado)
    const productDeleteResult = await pool.query(
      'DELETE FROM "Product" WHERE "idProduct" = $1',
      [idProduct]
    );

    console.log(productDeleteResult);
  } else {
    return res.send("El producto no esta registrado")
  }

  // Eliminar el detalle del producto de la tabla "ProductDetail"
  const detailDeleteResult = await pool.query(
    'DELETE FROM "ProductDetail" WHERE "idDetail" = $1',
    [idDetail]
  );

  console.log(detailDeleteResult);

  
  res.send("Deleting a product");
};

//---------------------------------------------------- funciones que no se exportan pero se usan en las principales---------------------------------------------------------//

/**
 * Funcion que verifica si los datos del producto estan completos
 * @param {*} req
 * @returns boolean
 * 
 */
const verificarProducto = (req) => {
  const { name, description, purchasePrice, salePrice, stock, color, size, weight, image, harvestDate, category } = req.body;

  if (!name || !purchasePrice || !salePrice || !stock || !color || !size || !weight || !description || !image || !harvestDate || !category) {
    return false;
  }
  return true;
}

const verificarActualizarProducto = (req) => {
  const { name, purchasePrice, salePrice, stock, color, size, weight, description, image, harvestDate } = req.body;
  if (!name || !purchasePrice || !salePrice || !stock || !color || !size || !weight || !description || !image || !harvestDate) {
    return false;
  }
  return true;
}

/**
 * Funcion que inserta el detalle del producto en la tabla ProductDetail y retorna el idDetail
 * @param {*} req
 * @returns idDetail
*/
const insertInDetailProduct = async (req) => {
  const { color, size, weight, description, image, harvestDate } = req.body;
  const result = await pool.query(
    'INSERT INTO "ProductDetail" ("color", "size", "weight", "description", "image ", "harvestDate") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "idDetail"',
    [color, size, weight, description, image, harvestDate]
  );
  return result.rows[0].idDetail;
}

/**
 * Funcion que inserta el producto en la tabla Product
 * @param {*} req 
 * @param {*} idDetail 
 * @returns 
 */
const insertInProduct = async (req, idDetail) => {
  const { idProduct, name, purchasePrice, salePrice, stock } = req.body;
  await pool.query(
    'INSERT INTO "Product" ("idProduct", "idDetail", "name",  "purchasePrice", "salePrice", "stock") VALUES ($1, $2, $3, $4, $5, $6)',
    [idProduct, idDetail, name, purchasePrice, salePrice, stock]
  );
  return "ok";
}

/**
 * Funcion que inserta el producto en la tabla ProductCategory
 * @param {*} idProduct 
 * @param {*} idCategory 
 * @returns 
 */
const insertInProductCategory = async (idProduct, idCategory) => {
  await pool.query(
    'INSERT INTO "ProductCategory" ("idProduct", "idCategory") VALUES ($1, $2)',
    [idProduct, idCategory]
  );
  return "ok";
}

/**
 * Funcion que actualiza el producto en la tabla Product
 * @param {*} req 
 * @param {*} idProduct 
 * @returns 
 */
const updateInProduct = async (req, idProduct) => {
  const { name, purchasePrice, salePrice, stock } = req.body;
  console.log(idProduct)
  const isIdInDB = await pool.query('SELECT * FROM "Product" WHERE "idProduct" = $1', [idProduct]);
  if (isIdInDB.rows.length === 0) {
    return "El producto no esta registrado"
  }
  await pool.query('UPDATE "Product" SET "name" = $1, "purchasePrice" = $2, "salePrice" = $3, "stock" = $4 WHERE "idProduct" = $5', [
    name,
    purchasePrice,
    salePrice,
    stock,
    idProduct
  ]);
  return "ok";
}

/**
 * Funcion que actualiza el producto en la tabla ProductDetail
 * @param {*} req 
 * @param {*} idProduct 
 * @returns 
 */
const updateInProductDetail = async (req, idProduct) => {
  const { color, size, weight, description, image, harvestDate } = req.body;
  await pool.query('UPDATE "ProductDetail" SET "color" = $1, "size" = $2, "weight" = $3, "description" = $4, "image " = $5, "harvestDate" = $6 WHERE "idDetail" = $7', [
    color,
    size,
    weight,
    description,
    image,
    harvestDate,
    idProduct
  ]);
  return "ok";
}

module.exports = { getProduct, getProductById, createProduct, updateProduct, deleteProduct, getProductByName };