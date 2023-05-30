const express = require('express');
const morgan = require('morgan');
const app = express();

const productRoutes = require ('./routes/product.routes')
const userRoutes = require ('./routes/user.routes')
const customerRoutes = require ('./routes/customer.routes')
const categoryRoutes = require ('./routes/category.routes')
const shoppingCartRoutes = require ('./routes/shoppingCart.routes')
const paymentMethodRoutes = require ('./routes/paymentMethod.routes')
const orderRoutes = require ('./routes/order.routes')
const cors = require('cors')

app.use(morgan('dev'));
app.use(cors())
app.use(express.json());
app.use(productRoutes)
app.use(userRoutes)
app.use(customerRoutes)
app.use(categoryRoutes)
app.use(shoppingCartRoutes)
app.use(paymentMethodRoutes)
app.use(orderRoutes)
app.listen(4000);

console.log('Server is running on port 4000');