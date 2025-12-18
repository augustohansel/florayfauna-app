const { searchTaxons, getTaxonById } = require('../services/elasticsearchService');

async function search(req, res) {
  try {
    const { q, family, genus, locationID } = req.query;

    const filters = {};
    if (family) filters.family = family;
    if (genus) filters.genus = genus;
    if (locationID) filters.locationID = locationID;

    if (!q && Object.keys(filters).length === 0) {
      return res.status(400).json({ message: 'Pelo menos um parâmetro de busca (q) ou filtro é obrigatório.' });
    }

    const taxons = await searchTaxons(q, filters);
    
    res.status(200).json(taxons);

  } catch (error) {
    console.error('Erro na busca:', error);
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
    console.error('Erro ao obter detalhes do táxon:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

module.exports = { search, getDetails };
