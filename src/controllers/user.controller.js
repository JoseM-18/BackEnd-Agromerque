const pool = require('../database');
const jwt = require('jsonwebtoken');

/* PROXIMAMENTE */
const signup = async (req, res) => {


}

const signin = async (req, res) => {

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

        const { id, password, registrationDate } = req.body;
        if (!id || !password || !registrationDate) {
            return res.status(400).json({ message: "Please. Send all data" })
        }
        const result = await pool.query('INSERT INTO "User" ("id","password","registrationDate","role") VALUES ($1, $2, $3, $4)', [id, password, registrationDate, role]);
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

module.exports = {getUser, getUserById, createUser, updateUser, deleteUser};