const jwt = require('jsonwebtoken');

/**
 * funcion que verifica el token de acceso
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns Status 403 si no hay token
 * @returns Status 401 si el token no es valido
 */
const verifyToken = async (req, res, next) => {
    try {
    
    } catch (error) {
        return res.status(401).send({ message: 'Unauthorized!. Please sigIn' });
    }
};


//funcion que verifica si el usuario es administrador 
const isAdmin = async (req, res, next) => {
   
    return res.status(403).json({message:"Require admin Role!"})
};

module.exports = { verifyToken, isAdmin };