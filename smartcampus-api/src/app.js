require('dotenv').config();
const express = require('express');
const taxonRoutes = require('./routes/taxonRoutes');
const instanceRoutes = require('./routes/instanceRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Rotas principais
app.use('/api/taxons', taxonRoutes);
app.use('/api/instances', instanceRoutes);

app.get('/', (req, res) => {
  res.send('API para o Smart Campus está no ar!');
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
