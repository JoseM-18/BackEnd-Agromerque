const {Pool} = require('pg')


const pool = new Pool({
  user: 'agromerque',
  password: 'agromerque',
  host: 'localhost',
  port: 5432,
  database: 'agromerque',
});



module.exports = pool;