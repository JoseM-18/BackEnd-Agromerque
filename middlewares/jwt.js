const jwt = require('jsonwebtoken');
const config = require('../config');

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
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ message: 'No token provided!' });
    const decoded = jwt.verify(token, config.SECRET);
    req.userId = decoded.id;
    const user = await userSchema.findById(req.userId, { password: 0 });
    if(!user) return res.status(404).send({ message: 'No user found!' });
    next();
    } catch (error) {
        return res.status(401).send({ message: 'Unauthorized!. Please sigIn' });
    }
};



module.exports = {verifyToken,isModerator,isAdmin};