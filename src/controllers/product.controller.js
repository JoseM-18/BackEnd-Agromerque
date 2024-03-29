const jwt = require('jsonwebtoken');
const pool = require('../database');

/**
 * Funcion para obtener todos los productos
 * @param {*} req 
 * @param {*} res 
 */
const getProduct = async (req, res) => {

  const isActive = await pool.query('SELECT * FROM "Product" WHERE "active" = true');

  if (isActive.rowCount === 0) {
    return res.status(404).json(
      { message: "Product doesn't found" }
    )

  }
  const result = await pool.query('SELECT p."idProduct",pd."idDetail",p."name" AS name,p."purchasePrice",p."salePrice",p."stock",pd."color",pd."size",pd."weight",pd."description",pd."image",pd."harvestDate", c."nameCategory" AS categoryName FROM "Product" AS p INNER JOIN "ProductDetail" AS pd ON p."idDetail" = pd."idDetail" INNER JOIN "categoryAssignment" AS ca ON p."idProduct" = ca."idProduct" INNER JOIN "Category" AS c ON ca."idCategory" = c."idCategory" WHERE p."active" = true;');

  res.json(result.rows)
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
    if (result.rows.length === 0) {
      return res.status(404).json(
        { message: "Product doesn't found" }
      )
    }
    res.json(result.rows);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error getProductById" });
  }
}

/**
 * Funcion que obtiene un producto por su nombre
 * @param {*} req 
 * @param {*} res 
 */
const getProductByName = async (req, res) => {
  const { name } = req.params;
  const nameFormat = format(name);
  const productExists = await pool.query('SELECT * FROM "Product" WHERE "name" LIKE $1', [`%${nameFormat}%`]);

  const result = await pool.query('SELECT * FROM "Product" NATURAL JOIN "ProductDetail" WHERE "name" LIKE $1', [`%${nameFormat}%`]);
  
  if (productExists.rowCount === 0) {
    console.log("no hay productos")
    return res.status(404).json( { message: "Product doesn't found" })
  }
 
  res.json(result.rows);
}

const getProductByCategory = async (req, res) => {
  const { category } = req.params;
  const result = await 
  pool.query('SELECT * FROM "Product" p JOIN "ProductCategory" pc ON p."idProduct" = pc."idProduct" JOIN "Category" c ON pc."idCategory" = c."idCategory" WHERE c."nameCategory" = $1', 
  [category]);
  if(result.rows.length === 0){
    return res.status(404).json(
      { message: "Product doesn't found" }
    )
  }
  res.json(result.rows);
}


/**
 * Crear un producto en la base de datos
 * @param {*} req 
 * @param {*} res 
 */
const createProduct = async (req, res) => {
  try {
    const { idProduct, category } = req.body;

    const productExists = await pool.query(
      'SELECT * FROM "Product" WHERE "idProduct" = $1 ',
      [idProduct]
    );

    if (productExists.rows.length > 0) { 
      return res.status(400).json({ message: "Product already exists" })
    }

    if (!verificarProducto(req)) {
      return res.status(400).json({ message: "Please. Send all data" })

    }

    const categoryExists = await pool.query(
      'SELECT * FROM "Category" WHERE "idCategory" = $1 ',
      [category]
    );

    if (categoryExists.rows.length === 0) {
      return res.status(400).json({ message: "Category doesn't exists" })
    }


    // Insertar el detalle del producto en la tabla ProductDetail
    const idDetail = await insertInDetailProduct(req);

    // Insertar el producto en la tabla Product
    const productResult = await insertInProduct(req, idDetail);

    // Insertar el producto en la tabla ProductCategory
    const productCategory = await insertInProductCategory(idProduct, category);

    res.json({ message: "Product created successfully" });
  } catch (error) {
    // Rollback de la transacción en caso de error
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

  try{

    if (req.params.idProduct === undefined) {
      return res.status(400).json({ message: "Please. Send id product" })
    }
    const { idProduct } = req.params;
    const updateProduct = await updateInProduct(req, idProduct);
    if(updateProduct.rowCount === 0){
      return res.status(400).json({ message: "Product doesn't exists" })
    }
    const updateProductDetail = await updateInProductDetail(req, idProduct);
    if(updateProductDetail.rowCount === 0){
      return res.status(400).json({ message: "Product doesn't exists" })
    }
    res.json({ message: "Product updated successfully" });
  }catch  (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error updateProduct" });
  } 
}

/**
 * Eliminar un producto en la base de datos
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deleteProduct = async (req, res) => {
  
  const idProduct = req.params.idProduct;

  try {

    // Obtener el idDetail correspondiente al producto
    const product = await pool.query('SELECT * FROM "Product" WHERE "idProduct" = $1', [idProduct]);

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Product doesn't exists" })
    }

    const deactivate = await pool.query('UPDATE "Product" SET "active" = false WHERE "idProduct" = $1', [idProduct]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error deleteProduct" });
  }
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


/**
 * verifica si los datos del producto a actualizar estan completos-
 * @param {*} req 
 * @returns 
 */
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
    'INSERT INTO "ProductDetail" ("color", "size", "weight", "description", "image", "harvestDate") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "idDetail"',
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
  const nameFormat = format(name);
  const active = true;
  await pool.query(
    'INSERT INTO "Product" ("idProduct", "idDetail", "name",  "purchasePrice", "salePrice", "stock","active") VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [idProduct, idDetail, nameFormat, purchasePrice, salePrice, stock, active]
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
    'INSERT INTO "categoryAssignment" ("idProduct", "idCategory") VALUES ($1, $2)',
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
let idDetail = '';
const updateInProduct = async (req, idProduct) => {
  const { name, purchasePrice, salePrice, stock } = req.body;
  const isIdInDB = await pool.query('SELECT * FROM "Product" WHERE "idProduct" = $1', [idProduct]);
  if (isIdInDB.rows.length === 0) {
    return "El producto no esta registrado"
  }
  await pool.query('UPDATE "Product" SET "name" = $1, "purchasePrice" = $2, "salePrice" = $3, "stock" = $4 WHERE "idProduct" = $5 RETURNING "idDetail"', [
    name,
    purchasePrice,
    salePrice,
    stock,
    idProduct
  ]);
  idDetail = isIdInDB.rows[0].idDetail;
  return "ok";
}

/**
 * Funcion que actualiza el producto en la tabla ProductDetail
 * @param {*} req 
 * @param {*} idProduct
 * @returns 
 */
const updateInProductDetail = async (req, idProduct) => {


  const { weight, description, image, harvestDate } = req.body;
  const resul = await pool.query('UPDATE "ProductDetail" SET "weight" = $1, "description" = $2, "image" = $3, "harvestDate" = $4 WHERE "idDetail" = $5', [
    weight,
    description,
    image,
    harvestDate,
    idDetail
  ]);
  console.log(resul);
  return resul;
}

//----------------------------------------------------funciones que no se exportan pero se usan en las principales---------------------------------------------------------//

const isAvailable = async (idProduct) => {
  const result = await pool.query('SELECT "stock" FROM "Product" WHERE "idProduct" = $1', [idProduct]);
  if (result.rows[0].stock > 0) {
    return true;
  }
  return false;
}

const format = (string) => {
  try{

      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }catch(error){
      console.log(error.message)

  }
}


module.exports = { getProduct, getProductById, createProduct, updateProduct, deleteProduct, getProductByName,getProductByCategory };