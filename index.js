const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabaseUrl = 'https://fosjqvczkulmivpdqfyo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvc2pxdmN6a3VsbWl2cGRxZnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQxOTA5NTUsImV4cCI6MTk5OTc2Njk1NX0.0fZJ4KU-SVBiH0usGWesnWjpAj2LE2CQ_NJSPKbMguA';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// Configurar cabeçalhos CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002'); // Substitua com o domínio do Front-End
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// Servir arquivos estáticos do front-end
const publicPath = path.join(__dirname, 'front-end');
app.use(express.static(publicPath));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
});

app.post('/products', async (req, res) => {
  const product = req.body;
  const { status, statusText, data, error } = await supabase
    .from('products')
    .insert([product])
  if (error) return res.status(500).json({ error: error.message });
  if (!data && statusText) return res.status(status).json({ message: statusText });
  res.status(201).json(data[0]);
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = req.body;
  const { status, statusText, data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
  if (error) return res.status(500).json({ error: error.message });
  if (!data && statusText) return res.status(status).json({ message: statusText });
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json(data[0]);
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { status, statusText, data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  if (!data && statusText) return res.status(status).json({ message: statusText })
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted successfully' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
