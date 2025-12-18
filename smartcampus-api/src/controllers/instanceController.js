const instanceService = require('../services/instanceService');

async function create(req, res) {
  try {
    const instanceData = req.body;
    
    if (!instanceData.location || !instanceData.species) {
        return res.status(400).json({ message: 'Dados de localização e espécie são obrigatórios.' });
    }

    const newInstance = await instanceService.createInstance(instanceData);
    res.status(201).json(newInstance);
  } catch (error) {
    console.error('Erro no controller ao criar instância:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar instância.' });
  }
}

async function searchByGeo(req, res) {
  try {
    const { topLeftLat, topLeftLon, bottomRightLat, bottomRightLon } = req.query;
    
    if (!topLeftLat || !topLeftLon || !bottomRightLat || !bottomRightLon) {
      return res.status(400).json({ message: 'Todos os quatro parâmetros de coordenadas são obrigatórios.' });
    }

    const bounds = {
      top_left: { lat: parseFloat(topLeftLat), lon: parseFloat(topLeftLon) },
      bottom_right: { lat: parseFloat(bottomRightLat), lon: parseFloat(bottomRightLon) }
    };
    
    const instances = await instanceService.findInstancesInGeoBounds(bounds);
    res.status(200).json(instances);
  } catch (error) {
    console.error('Erro no controller ao buscar instâncias por geo:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar instâncias.' });
  }
}

module.exports = {
  create,
  searchByGeo
};
