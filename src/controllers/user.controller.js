const pool = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');


/**
 * Funcion para obtener todos los usuarios
 * @param {*} req 
 * @param {*} res 
 */
const signUp = async (req, res) => {
    try {
        //variables para crear un usuario en la base de datos, encriptar la contraseña y obtener la fecha actual
        let result = null;
        const plainPassword = req.body.password;
        const encripPassword = await bcrypt.hash(plainPassword, 10);
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        const isUsernameinBD = await pool.query('SELECT * FROM "User" WHERE "username" = $1', [req.body.username]);
        const role = (req.body.role).toLowerCase();

        //verificar si el nombre de usuario ya existe en la base de datos

        if (isUsernameinBD.rows.length === 0) {
            result = await pool.query('INSERT INTO "User" ("username","password","email","registrationDate","role") VALUES ($1, $2, $3, $4, $5) RETURNING "idUser"',
                [username, encripPassword, email, formattedDate, "Admin"]);
            const idUser = result.rows[0].idUser;
            if (role === 'admin') {
                const { username, password, email, role } = req.body;
                if (!username || !password || !email || !role) {
                    return res.status(400).json({ message: "Please. Send all data" })
                }

                result = await pool.query('INSERT INTO "Admin" ("idUser") VALUES ($1)', [idUser]);


            } else if (role === 'customer') {
                //si no es admin, entonces es un cliente y se crea en la base de datos, tanto en la tabla User como en la tabla Customer
                const { username, password, email, role, name, lastname, phone, address, birthdate } = req.body;
                if (!username || !password || !email || !role || !name || !lastname || !phone || !address || !birthdate) {
                    return res.status(400).json({ message: "Please. Send all data" })
                }

                result = await pool.query('INSERT INTO "Customer" ("idUser","name","lastname","phone","address","birthdate") VALUES ($1, $2, $3, $4, $5, $6)',
                    [idUser, name, lastname, phone, address, birthdate]);
            }
        } else {
            return res.status(400).json({ message: "the username already exists, please create another one " })
        }

        console.log(result)
        res.send("creating a user")

    } catch (error) {

        if (error.code === '23505') {
            res.status(400).json({ message: "the user is already in the database" })
        } else {
            console.error(error);
            res.status(500).json({ message: "Internal server error createUser" })
        }

    }

}

/**
 * Funcion para obtener un usuario por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM "User" WHERE "username" = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "invalid access, verify your username" }
            )
        }
        const passwordBD = result.rows[0].password;
        const idUser = result.rows[0].idUser;
        const usrname = result.rows[0].username;
        const role = result.rows[0].role;
        const isPasswordValid = await bcrypt.compare(password, passwordBD);
        const time = '86400s';
        if (!isPasswordValid) {
            return res.status(401).json(
                { message: "Invalid Password" }
            )
        }

        const token = jwt.sign({ username: usrname, idUser: idUser, role: role }, config.SECRET, {
            expiresIn: time // 24 hours
        });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error signin" });
    }
}


/**
 * Funcion para obtener todos los usuarios
 * @param {*} req 
 * @param {*} res 
 */
const getUser = async (req, res) => {
    try {



        const result = await pool.query('SELECT * FROM "User";')

        let info = null;
        if (result.rows[0].role === 'Admin') {
            info = await pool.query('SELECT * FROM "User" NATURAL JOIN "Admin";')

        } else if (result.rows[0].role === 'Customer') {
            info = await pool.query('SELECT * FROM "User" NATURAL JOIN "Customer";')
        }

        console.log(info)
        res.send(info.rows)

    } catch (error) {
        console.log(error.message)
    }

}

/**
 * Funcion para obtener un usuario por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getUserById = async (req, res) => {
    try {

        const id = req.params.idUser;
        const result = await pool.query('SELECT * FROM "User" WHERE "idUser" = $1', [id]);
        console.log(result)
        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "User doesn't found" }
            )
        }
    } catch (error) {
        console.log(error.message)
    }
}


/**
 * Funcion que actualiza un usuario por su id
 * @param {*} req 
 * @param {*} res 
 */
const updateUser = async (req, res) => {
    try {

        const id = req.params.id;
        const { password, registrationDate } = req.body;
        const result = await pool.query('UPDATE "User" SET "password" = $1, "registrationDate" = $2, "role" = $3 WHERE "idUser" = $4', [
            password,
            registrationDate,
            role,
            id
        ]);
        console.log(result)

    } catch (error) {
        console.log(error.message)
    }
}

/**
 * Funcion que elimina un usuario por su id
 * @param {*} req 
 * @param {*} res 
 */
const deleteUser = async (req, res) => {
    try {

        const id = req.params.idUser;
        const result = await pool.query('DELETE FROM "User" WHERE "idUser" = $1', [id]);
        console.log(result)
        res.send("deleting a user")
    } catch (error) {
        console.log(error.message)
    }

}

module.exports = { getUser, getUserById, updateUser, deleteUser, signUp, signIn };