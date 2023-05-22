const {Router} = require('express');
const pool = require('../database');
const router = Router();

router.get('/user',async (req,res) => {
  const result = await pool.query('SELECT * FROM public."User";')
  console.log(result)
  res.send("receiving all Users")
  
})

router.get('/user/idUser',async(req,res) => {
  const id = req.params.id;
  const result = await pool.query('SELECT * FROM public."User" WHERE id = $1', [id]);
  console.log(result)
  res.send("receiving a single user")
})

router.post('/user',async(req,res) => {
  const {id,password,registrationDate} = req.body;
  const result = await pool.query('INSERT INTO public."User" (id,password,registrationDate) VALUES ($1, $2, $3)', [id,password,registrationDate]);
  console.log(result)
  res.send("creating a user")
})

router.delete('/user/idUser',async(req,res) => {
  const id = req.params.id;
  const result = await pool.query('DELETE FROM public."User" WHERE id = $1', [id]);
  console.log(result)
  res.send("deleting a user")
})

router.put('/user/idUser',async(req,res) => {
  const id = req.params.id;
  const {password,registrationDate} = req.body;
  const result = await pool.query('UPDATE public."User" SET password = $1, registrationDate = $2 WHERE id = $3', [
        password,
        registrationDate,
        id
    ]);
  console.log(result)
  res.send("updating a product")
})

module.exports = router;