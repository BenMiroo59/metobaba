require('dotenv').config();  // .env dosyasını yükler
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('PostgreSQL veritabanına bağlandım'))
  .catch(err => console.error('Bağlantı hatası:', err.stack));

// Örnek bir veri sorgusu
client.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Sorgu hatası:', err.stack);
  } else {
    console.log('Sorgu sonucu:', res.rows[0]);
  }
  client.end();
});
