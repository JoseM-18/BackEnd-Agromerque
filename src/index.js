const express = require('express');
const morgan = require('morgan');
const app = express();

const productRoutes = require ('./routes/product.routes')

app.use(morgan('dev'));

app.use(productRoutes)
app.listen(4000);

console.log('Server is running on port 4000');