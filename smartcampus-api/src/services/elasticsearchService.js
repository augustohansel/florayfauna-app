// src/services/elasticsearchService.js

const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  tls: {
    // Desabilite a verificação do certificado SSL para um ambiente de desenvolvimento
    // Em produção, use um certificado válido ou configure corretamente.
    rejectUnauthorized: false
  }
});

// Função de busca
async function searchTaxons(query) {
  try {
    const result = await client.search({
      index: 'flora_funga_taxonomy', // O nome do seu índice
      body: {
        query: {
          multi_match: {
            query: query,
            fields: [
              'scientificName^3', // Aumenta a relevância para nomes científicos
              'vernacularNames.name^2', // Nomes populares
              'acceptedNameUsage',
              'higherClassification.*' // Busca em todos os campos da hierarquia
            ]
          }
        }
      }
    });
    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error("Erro na busca do Elasticsearch:", error);
    throw error;
  }
}

// Função de buscar um táxon por ID
async function getTaxonById(id) {
  try {
    const result = await client.get({
      index: 'flora_funga_taxonomy',
      id: id
    });
    return result._source;
  } catch (error) {
    console.error("Erro ao buscar táxon por ID:", error);
    return null;
  }
}

module.exports = {
  searchTaxons,
  getTaxonById
};