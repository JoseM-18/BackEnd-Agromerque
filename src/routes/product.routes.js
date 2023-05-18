const {Router} = require('express');
const pool = require('../database');
const router = Router();

router.get('/product',async (req,res) => {
  const result = pool.query('SELECT NOW()')
  console.log(result)
  res.send("receiving all tasks")
  
})

router.get('/product/10',(req,res) => {
  res.send("receiving a single product")
})

router.post('/product',(req,res) => {
  res.send("creating a product")
})

router.delete('/product/10',(req,res) => {
  res.send("deleting a product")
})

router.put('/product/10',(req,res) => {
  res.send("updating a product")
})

module.exports = router;