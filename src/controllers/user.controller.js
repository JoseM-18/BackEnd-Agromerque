const pool = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

/* PROXIMAMENTE */
const signup = async (req, res) => {
    createUser(req, res);

}

const signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM "User" WHERE "username" = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json(
                { message: "invalid access, verify your username" }
            )
        }
        const passwordBD = result.rows[0].password;
        const usrname = result.rows[0].username;
        const role = result.rows[0].role;
        const isPasswordValid = await bcrypt.compare(password, passwordBD);
        const time = '86400s';
        if (!isPasswordValid) {
            return res.status(401).json(
                { message: "Invalid Password" }
            )
        }
        console.log(config.SECRET)
        const token = jwt.sign({ username: usrname, role: role }, config.SECRET, {
            expiresIn: time // 24 hours
        });
        
        console.log(token);
        const decoded = jwt.verify(token, config.SECRET);
        const expTime = decoded.exp;
        const expData = new Date(expTime * 1000);
        console.log(decoded.username, decoded.role);
        res.json({ token,username:usrname,role:role,expData:expData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error signin" });
    }
}


const getUser = async (req,res) => {
    try{

        const result = await pool.query('SELECT * FROM "User";')
        console.log(result)
        res.send(result.rows)

    }catch(error){
        console.log(error.message)
    }
    
}

const getUserById = async(req,res) => {
    try{

        const id = req.params.idUser;
        const result = await pool.query('SELECT * FROM "User" WHERE "idUser" = $1', [id]);
        console.log(result)
        if(result.rows.length === 0){
            return res.status(404).json(
                {message:"User doesn't found"}
            )
        }
    }catch(error){
        console.log(error.message)
    }
}

const createUser = async (req, res) => {
    try {
        let result = null;
        const plainPassword = req.body.password;
        const encripPassword = await bcrypt.hash(plainPassword, 10);
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

        if(req.body.role === 'Admin'){
        const {  username ,password, email,role } = req.body;
        if ( !username || !password || !email || !role) {
            return res.status(400).json({ message: "Please. Send all data" })
        }
        result = await pool.query('INSERT INTO "User" ("username","password","email","registrationDate","role") VALUES ($1, $2, $3, $4, $5) RETURNING "idUser"', 
        [username, encripPassword, email, formattedDate, role]);
        const idUser = result.rows[0].idUser;
        result = await pool.query('INSERT INTO "Admin" ("idUser") VALUES ($1)', [idUser]);  
        }else{
            const { username ,password, email,role, name, lastname,phone,address,birthdate  } = req.body;
            if (!username || !password || !email || !role || !name || !lastname || !phone || !address || !birthdate) {
                return res.status(400).json({ message: "Please. Send all data" })
            }
            result = await pool.query('INSERT INTO "User" ("username","password","email","registrationDate","role") VALUES ($1, $2, $3, $4, $5) RETURNING "idUser"',
             [username, encripPassword, email, formattedDate, role]);
            const idUser = result.rows[0].idUser;
            result = await pool.query('INSERT INTO "Customer" ("idUser","name","lastname","phone","address","birthdate") VALUES ($1, $2, $3, $4, $5, $6)',
                [idUser, name, lastname, phone, address, birthdate]);
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

const updateUser = async(req,res) => {
    try{

        const id = req.params.id;
        const {password,registrationDate} = req.body;
        const result = await pool.query('UPDATE "User" SET "password" = $1, "registrationDate" = $2, "role" = $3 WHERE "idUser" = $4', [
            password,
            registrationDate,
            role,
            id
        ]);
        console.log(result)
        
    }catch(error){
        console.log(error.message)
    }
}

const deleteUser = async(req,res) => {
    try{

        const id = req.params.idUser;
        const result = await pool.query('DELETE FROM "User" WHERE "idUser" = $1', [id]);
        console.log(result)
        res.send("deleting a user")
    }catch(error){
        console.log(error.message)
    }

}

module.exports = {getUser, getUserById, createUser, updateUser, deleteUser, signup, signin};