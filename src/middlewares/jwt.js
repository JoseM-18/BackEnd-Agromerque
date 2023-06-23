const pool = require('../database');
const jwt = require('jsonwebtoken');
const config = require('../config'); // Archivo de configuración con la clave secreta


const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    
    if (!token) return res.status(403).send({ message: 'No token provided!' });
    const decoded = jwt.verify(token, config.SECRET);
    
    req.username = decoded.username;

    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM "User" WHERE "username" = $1';
      const values = [req.username];
      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        return res.status(404).send({ message: 'No user found!' });
      }

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    if(error.name === 'TokenExpiredError'){
      return res.status(401).send({ message: 'Token expired!' });
    }else{

      return res.status(401).send({ message: 'Unauthorized!' });
    }
  }
};
 

/**
 * funcion que verifica si el usuario es administrador
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isAdmin = async (req, res, next) => {
    try{
    //obtener el token del header y sacar el rol del usuario
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ message: 'No token provided!' });
    const decoded = jwt.verify(token, config.SECRET);
    const role = decoded.role;

    if (role === 'Admin') {
      next();
      return;
    }else{  
      return res.status(403).json({message:"Require admin Role!"})
    }

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error isAdmin" });
    }
 
};

module.exports = {verifyToken,isAdmin};