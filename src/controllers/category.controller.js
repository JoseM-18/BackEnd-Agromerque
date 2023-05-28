const pool = require('../database');

const getAllCategories = async (req, res) => { 
  
      try {
          const result = await pool.query('SELECT * FROM "Category";')
          res.send(result.rows)
      } catch (error) {
          console.log(error.message)
          res.status(500).json({ message: "Internal server error getAllCategories" });
      }
  }

const getCategoryById = async (req, res) => {
    try {
        const { idCategory } = req.params;
        const result = await pool.query('SELECT * FROM "Category" WHERE "idCategory" = $1', [idCategory]);
        
        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "Category doesn't found" }
            )
        }

        res.send(result.rows[0])

    } catch (error) {
        console.log(error.message)
    }
}

const createCategory = async (req, res) => {
    try {

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Please. Send all data" })
        }
        const result = await pool.query('INSERT INTO "Category" ("name") VALUES ($1)', [name]);
        console.log(result)
        res.send("creating a category")

    } catch (error) {

        if (error.code === '23505') {
            res.status(400).json({ message: "the category is already in the database" })
        } else {
            console.error(error);
            res.status(500).json({ message: "Internal server error createCategory" })
        }

    }
}

const updateCategory = async (req, res) => {
    try {
        const { idCategory } = req.params;
        const { name } = req.body;
        if (!idCategory || !name) {
            return res.status(404).json({ message: "Please. Send all data" })
        }

        const result = await pool.query(
            'UPDATE "Category" SET "name" = $1 WHERE "idCategory" = $2',
            [name, idCategory]
        );
        console.log(result)
        res.send("updating a category")
    } catch (error) {
        console.log(error.message)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { idCategory } = req.params;
        const result = await pool.query('DELETE FROM "Category" WHERE "idCategory" = $1', [idCategory]);
        console.log(result)
        res.send("deleting a category")
    } catch (error) {
        console.log(error.message)
    }
}

const getProductByNameCategory = async (req, res) => {
    try {
        const { name } = req.params;
        const result = await pool.query('SELECT * FROM "Category" NATURAL JOIN "Product" NATURAL JOIN "ProductDetail" WHERE "Category.""name" = $1', [name]);
        console.log(result)
        res.send("getting a category")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getProductByNameCategory }