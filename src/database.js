const {Pool} = require('pg')


const pool = new Pool({
  user: 'agromerque',
  password: 'agromerque',
  host: '0.0.0.0',
  port: 5432,
  database: 'agromerque',
});



module.exports = pool;