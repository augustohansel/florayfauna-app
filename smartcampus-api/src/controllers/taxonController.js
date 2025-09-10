// src/controllers/taxonController.js

const { searchTaxons, getTaxonById } = require('../services/elasticsearchService');

async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Parâmetro de busca "q" é obrigatório.' });
    }
    const taxons = await searchTaxons(q);
    res.status(200).json(taxons);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

async function getDetails(req, res) {
  try {
    const { id } = req.params;
    const taxon = await getTaxonById(id);
    if (!taxon) {
      return res.status(404).json({ message: 'Táxon não encontrado.' });
    }
    res.status(200).json(taxon);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

module.exports = {
  search,
  getDetails
};