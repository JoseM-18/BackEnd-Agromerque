const {Client} = require('pg')

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'agromerque',
  password: 'agromerque',
  port: 5432,
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