const {Router} = require('express');
const pool = require('../database');
const router = Router();

router.get('/task',async (req,res) => {
  client.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error al ejecutar la consulta', err);
    } else {
      console.log(res.rows);
    }
  
    client.end(); // Cierra la conexión después de usarla
  });
  
})

router.get('/task/10',(req,res) => {
  res.send("receiving a single task")
})

router.post('/',(req,res) => {
  res.send("creating a task")
})

router.delete('/',(req,res) => {
  res.send("deleting a task")
})

router.put('/',(req,res) => {
  res.send("updating a task")
})

module.exports = router;