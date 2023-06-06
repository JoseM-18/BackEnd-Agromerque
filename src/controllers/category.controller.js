const pool = require('../database');

/**
 * funcion que devuelve todas las categorias de la base de datos
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getAllCategories = async (req, res) => {

    try {
        const result = await pool.query('SELECT * FROM "Category";')
        res.json(result.rows)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getAllCategories" });
    }
}

/**
 * funcion que devuelve una categoria por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getCategoryById = async (req, res) => {
    try {
        const { idCategory } = req.params;
        const result = await pool.query('SELECT * FROM "Category" WHERE "idCategory" = $1', [idCategory]);

        if (result.rowCount === 0) {
            return res.status(404).json(
                { message: "Category doesn't found" }
            )
        }

        res.json(result.rows);

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal server error getCategoryById" });
    }
}

/**
 * obtiene una categoria por su nombre
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getCategoryByName = async (req, res) => {
    const { name } = req.params;
    const nameFormat = format(name);
    const result = await pool.query('SELECT * FROM "Category" WHERE "nameCategory" = $1', [nameFormat]);
    if (result.rowCount === 0) {
        return res.status(404).json(
            { message: "Category doesn't found" }
        )
    }

    res.json(result.rows);
}


/**
 * funcion que crea una categoria en la base de datos
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createCategory = async (req, res) => {
    try {

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Please. Send all data" })
        }
        const nameFormat = format(name);
        await pool.query('INSERT INTO "Category" ("nameCategory") VALUES ($1)', [nameFormat]);

        res.json("category " + nameFormat + " created")

    } catch (error) {

        if (error.code === '23505') {
            res.status(400).json({ message: "the category is already in the database" })
        } else {
            console.error(error);
            res.status(500).json({ message: "Internal server error createCategory" })
        }

    }
}

/**
 * funcion que actualiza una categoria por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateCategory = async (req, res) => {
    try {
        const { idCategory } = req.params;
        const { name } = req.body;
        if (!idCategory || !name) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const nameFormat = format(name);
        const result = await pool.query(
            'UPDATE "Category" SET "nameCategory" = $1 WHERE "idCategory" = $2',
            [nameFormat, idCategory]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Category doesn't found" })
        }

        res.json("category " + nameFormat + " updated")
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error updateCategory" })
    }
}

/**
 * funcion que elimina una categoria por su id
 * @param {*} req 
 * @param {*} res 
 */
const deleteCategory = async (req, res) => {
    try {
        const { idCategory } = req.params;
        const result = await pool.query('DELETE FROM "Category" WHERE "idCategory" = $1', [idCategory]);
        console.log(result)

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Category doesn't found" })
        }
        res.json("category deleted")
    } catch (error) {
        return res.status(500).json({ message: "Internal server error deleteCategory" })
    }
}

//---------------------------------------------funciones que no se exportan pero se usan en las funciones principales-------------

/**
 * genera un string con la primera letra en mayuscula y el resto en minuscula como formato 
 * @param {*} name 
 * @returns 
 */
const format = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

module.exports = { getAllCategories, getCategoryById, getCategoryByName, createCategory, updateCategory, deleteCategory }