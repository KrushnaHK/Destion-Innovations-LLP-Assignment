// server/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { products: [], invoices: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// Products API (Full CRUD)
app.get('/products', (req, res) => {
  const db = readDb();
  res.json(db.products || []);
});

app.get('/products/:id', (req, res) => {
  const db = readDb();
  const product = db.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/products', (req, res) => {
  const db = readDb();
  const newProduct = { ...req.body, id: Date.now() };
  db.products = db.products || [];
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const db = readDb();
  const index = db.products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  db.products[index] = { ...req.body, id: parseInt(req.params.id) };
  writeDb(db);
  res.json(db.products[index]);
});

app.delete('/products/:id', (req, res) => {
  const db = readDb();
  const index = db.products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  db.products.splice(index, 1);
  writeDb(db);
  res.sendStatus(204);
});

// Invoices API (GET only)
app.get('/invoices', (req, res) => {
  const db = readDb();
  res.json(db.invoices || []);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});