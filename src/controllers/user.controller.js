const pool = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const customer = require('../controllers/customer.controller');

/**
 * Funcion para obtener todos los usuarios
 * @param {*} req 
 * @param {*} res 
 */
const signUp = async (req, res) => {
    try {
        //variables para crear un usuario en la base de datos, encriptar la contraseña y obtener la fecha actual
        let result = null;
        const { username, password, email, name, lastname, phone, address, birthdate } = req.body;
        let role = req.body.role;
        const plainPassword = password;
        const encripPassword = await bcrypt.hash(plainPassword, 10);
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

        if (!username || !password || username === "" || password === "") {
            return res.status(400).json({ message: "Please. Send all data" })
        }

        const isUsernameinBD = await pool.query('SELECT * FROM "User" WHERE "username" = $1', [req.body.username]);

        //si el rol no existe reemplazelo por customer
        if (role === null || role === undefined || role === "") {
            role = 'Customer';
        }

        //verificar si el nombre de usuario ya existe en la base de datos

        if (isUsernameinBD.rows.length === 0) {
            const roleFormat = format(role);
            result = await pool.query('INSERT INTO "User" ("username","password","email","registrationDate","role") VALUES ($1, $2, $3, $4, $5) RETURNING "idUser"',
                [username, encripPassword, email, formattedDate, roleFormat]);
            const idUser = result.rows[0].idUser;
            if (roleFormat === 'Admin') {
                const { username, password, email, role } = req.body;
                if (!username || !password || !email || !role || username === "" || password === "" || email === "" || role === "") {
                    return res.status(400).json({ message: "Please. Send all data" })
                }
                result = await pool.query('INSERT INTO "Admin" ("idUser") VALUES ($1)', [idUser]);
            }

            if (roleFormat === 'Customer') {
                if (!name || !lastname || !address || !birthdate || !phone || name === "" || lastname === "" || address === "" || birthdate === "" || phone === "") {
                    return res.status(400).json({ message: "Please. Send all data" })
                }
                //si no es admin, entonces es un cliente y se crea en la base de datos, tanto en la tabla User como en la tabla Customer
                const result = await customer.createCustomer(idUser, name, lastname, address, birthdate, phone);
                if (result !== "Customer " + name + " created") {
                    return res.status(400).json({ message: "Please. Send all data" })
                }
                if (result === "the customer is already in the database") {
                    return res.status(400).json({ message: "the customer is already in the database" })
                }
            }
            res.json({ message: "User created" })
        } else {
            return res.status(400).json({ message: "user already exists" })
        }


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
        if (!username || !password || username === "" || password === "") {
            return res.status(400).json({ message: "Please. Send all data" })
        }
        const result = await pool.query('SELECT * FROM "User"  WHERE "username" = $1', [username]);
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

        if (role === 'Customer') {

            const idCustomerBD = await pool.query('SELECT "idCustomer" FROM "Customer" WHERE "idUser" = $1', [idUser]);
            const idCustomer = idCustomerBD.rows[0].idCustomer;

            const token = jwt.sign({ username: usrname, idUser: idUser, idCustomer: idCustomer, role: role }, config.SECRET, {
                expiresIn: time // 24 hours
            });
            return res.json({ token });
        } else {
            const token = jwt.sign({ username: usrname, idUser: idUser, role: role }, config.SECRET, {
                expiresIn: time // 24 hours
            });
            return res.json({ token });
        }

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

        res.json(info.rows)

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error getUser" })
    }

}

/**
 * Funcion para obtener un usuario por su id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getUserById = async (req, res) => {
    console.log(req.params)
    try {

        const id = req.params.idUser;
        const result = await pool.query('SELECT * FROM "User" WHERE "idUser" = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "User doesn't found" }
            )
        }
        const password = result.rows[0].password;


        return res.json(result.rows[0])
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error getUserById" })
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
        return res.json({ message: "User Updated" })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error updateUser" })
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
        res.json({ message: "User deleted" })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Internal server error deleteUser" })
    }

}

//-----------------------------funciones que no se exportan pero que se usan en este archivo-----------------------------//
const format = (string) => {
    try {

        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    } catch (error) {
        console.log(error.message)


    }
}
/** 
const actualizar = async (req, res ) => { 
    try{
        

    
     }
    
}
*/

module.exports = { getUser, getUserById, updateUser, deleteUser, signUp, signIn };