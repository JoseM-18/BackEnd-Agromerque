const {Router} = require('express');
const pool = require('../database');
const router = Router();

router.get('/product',async (req,res) => {
  const result = await pool.query('SELECT * FROM public."Product";')
  console.log(result)
  res.send("receiving all tasks")
  
})

router.get('/product/idProduct',async(req,res) => {
  const id = req.params.id;
  const result = await pool.query('SELECT * FROM public."Product" WHERE id = $1', [id]);
  console.log(result)
  res.send("receiving a single product")
})

router.post('/product',async(req,res) => {
  const {idProduct,idDetail,name,description,purchasePrice,salePrice,stock} = req.body;
  const result = await pool.query(
    'INSERT INTO public."Product" (idProduct,idDetail,name,description,purchasePrice,salePrice,stock) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
  [idProduct,
    idDetail,
    name,
    description,
    purchasePrice,
    salePrice,
    stock]);
  console.log(result)
  res.send("creating a product")
})

router.delete('/product/idProduct',async(req,res) => {
  const id = req.params.id;
  const result = await pool.query('DELETE FROM public."Product" WHERE id = $1', [id]);
  console.log(result)
  res.send("deleting a product")
})

router.put('/product/idProduct',async(req,res) => {
  const id = req.params.id;
  const {idProduct,idDetail,name,description,purchasePrice,salePrice,stock} = req.body;
  const result = await pool.query('UPDATE public."Product" SET idProduct = $1, idDetail = $2, name = $3, description = $4, purchasePrice = $5, salePrice = $6, stock = $7 WHERE id = $8', [
        idProduct,
        idDetail,
        name,
        description,
        purchasePrice,
        salePrice,
        stock,
        id
    ]);
  console.log(result)
  res.send("updating a product")
})

module.exports = router;