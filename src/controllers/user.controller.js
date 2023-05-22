const pool = require('../database');
const jwt = require('jsonwebtoken');
const getUser = async (req,res) => {
    const result = await pool.query('SELECT * FROM public."User";')
    console.log(result)
    res.send(result.rows)
    
}

const getUserById = async(req,res) => {
    const id = req.params.idUser;
    const result = await pool.query('SELECT * FROM public."User" WHERE "idUser" = $1', [id]);
    console.log(result)
    res.send("receiving a single user")
}

const createUser = async(req,res) => {
    const {id,password,registrationDate} = req.body;
    if (!id || !password || !registrationDate) {
      return res.status(400).json({ message: "Please. Send all data" })
    }
    const result = await pool.query('INSERT INTO public."User" ("id","password","registrationDate") VALUES ($1, $2, $3)', [id,password,registrationDate]);
    console.log(result)
    res.send("creating a user")
}

const updateUser = async(req,res) => {
    const id = req.params.id;
    const {password,registrationDate} = req.body;
    const result = await pool.query('UPDATE public."User" SET "password" = $1, "registrationDate" = $2 WHERE "idUser" = $3', [
          password,
          registrationDate,
          id
      ]);
    console.log(result)
    res.send("updating a product")
}

const deleteUser = async(req,res) => {
    const id = req.params.idUser;
    const result = await pool.query('DELETE FROM public."User" WHERE "idUser" = $1', [id]);
    console.log(result)
    res.send("deleting a user")
}

module.exports = {getUser, getUserById, createUser, updateUser, deleteUser};