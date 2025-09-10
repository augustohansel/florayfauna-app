// src/app.js

const express = require('express');
const taxonRoutes = require('./routes/taxonRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir JSON no corpo das requisições
app.use(express.json());

// Middleware para as rotas da API
app.use('/api/taxons', taxonRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API para o Smart Campus está no ar!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});