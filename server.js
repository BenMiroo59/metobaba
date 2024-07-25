require('dotenv').config();
const express = require('express');
const { Client } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL veritabanı bağlantısı
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('PostgreSQL veritabanına bağlandım'))
  .catch(err => console.error('Bağlantı hatası:', err.stack));

app.use(express.json());
app.use(express.static('public'));

// Mesajları al ve gönder
app.get('/messages', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM messages ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Sorgu hatası:', err.stack);
    res.status(500).json({ error: 'Mesajları alırken hata oluştu' });
  }
});

app.post('/messages', async (req, res) => {
  const { username, message } = req.body;
  const timestamp = new Date().toISOString();
  try {
    await client.query('INSERT INTO messages (username, message, timestamp) VALUES ($1, $2, $3)', [username, message, timestamp]);
    res.status(201).json({ message: 'Mesaj başarıyla kaydedildi' });
  } catch (err) {
    console.error('Sorgu hatası:', err.stack);
    res.status(500).json({ error: 'Mesajı kaydederken hata oluştu' });
  }
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
