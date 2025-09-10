// src/routes/taxonRoutes.js

const express = require('express');
const { search, getDetails } = require('../controllers/taxonController');

const router = express.Router();

// Rota para buscar táxons
// Exemplo: GET /api/taxons/search?q=myrciaria
router.get('/search', search);

// Rota para buscar detalhes de um táxon específico
// Exemplo: GET /api/taxons/details/5155
router.get('/details/:id', getDetails);

module.exports = router;