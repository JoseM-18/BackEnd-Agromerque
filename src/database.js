const {Client} = require('pg')


const client = new Client({
  user: 'agromerque',
  password: 'agromerque',
  host: 'localhost',
  port: 5432,
  database: 'agromerque',
});
client.connect((err) => {
  if (err) {
    console.error('Error al conectar a PostgreSQL', err);
  } else {
    console.log('Conexión exitosa a PostgreSQL');
    // Aquí puedes realizar operaciones en la base de datos
  }
});


module.exports = client;