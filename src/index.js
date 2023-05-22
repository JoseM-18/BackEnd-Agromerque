const express = require('express');
const morgan = require('morgan');
const app = express();

const productRoutes = require ('./routes/product.routes')
const userRoutes = require ('./routes/user.routes')

app.use(morgan('dev'));
app.use(express.json());
app.use(productRoutes)
app.use(userRoutes)
app.listen(4000);

console.log('Server is running on port 4000');