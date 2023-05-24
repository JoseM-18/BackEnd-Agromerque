const pool = require('../database');


/**
 * funcion que verifica si el rol es permitido
 */
const isPermitted = async (req, res, next) => {
    try{
    //obtener el token del header y sacar el rol del usuario
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ message: 'No token provided!' });
    const decoded = jwt.verify(token, config.SECRET);
    const role = decoded.role;

    if (role === 'Admin' || role === 'Customer') {
      next();
      return;
    }else{  
      return res.status(403).json({message:"Require admin Role!"})
    }

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error isAdmin" });
    }
 
}

/**
 * funcion que verifica si el id existe en la base de datos
 * 
 */
const isIdInDB = async (req, res, next) => {
    try{
        const { idCustomer } = req.params;
        const result = await pool.query('SELECT * FROM "Customer" WHERE "idCustomer" = $1', [idCustomer]);
        
        if (result.rows.length === 1) {
            return res.status(404).json(
                { message: "the user is already in the database" }
            )
        }
        next();
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error isIdInDB" });
    }
}

module.exports = {isPermitted,isIdInDB};