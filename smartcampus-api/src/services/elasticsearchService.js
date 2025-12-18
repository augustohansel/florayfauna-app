const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Realiza uma busca textual e/ou por filtros no índice de táxons.
 * @param {string} query 
 * @param {object} filters
 * @returns {Promise<Array<object>>}
 */
async function searchTaxons(query, filters = {}) {
  const mustClauses = [];
  const filterClauses = [];

  if (query) {
    mustClauses.push({
      bool: {
        should: [
          { match: { scientificName: { query: query, boost: 5 } } },
          { nested: { path: 'vernacularNames', query: { match: { 'vernacularNames.name': { query: query, boost: 3 } } } } },
          { nested: { path: 'sinonyms', query: { match: { 'sinonyms.scientificName': { query: query, boost: 1 } } } } }
        ]
      }
    });
  }

  if (filters.family) {
    filterClauses.push({ match: { 'higherClassification.family': filters.family } });
  }
  if (filters.genus) {
    filterClauses.push({ match: { 'higherClassification.genus': filters.genus } });
  }
  if (filters.locationID) {
    filterClauses.push({
      nested: {
        path: 'distribution',
        query: {
          match: { 'distribution.locationID': filters.locationID }
        }
      }
    });
  }

  try {
    const result = await client.search({
      index: 'flora_funga_taxonomy',
      body: {
        query: {
          bool: {
            must: mustClauses.length > 0 ? mustClauses : { match_all: {} },
            filter: filterClauses
          }
        }
      },
      size: 1000 // <-- ADICIONADO: Aumenta o limite de resultados para 500
    });
    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error('[ES Service] Erro na busca do Elasticsearch:', error);
    throw error;
  }
}

/**
 * Busca um único táxon pelo seu ID exato.
 * @param {string} id 
 * @returns {Promise<object|null>}
 */
async function getTaxonById(id) {
  try {
    const result = await client.get({
      index: 'flora_funga_taxonomy',
      id: String(id)
    });
    return result._source;
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      return null;
    }
    console.error(`[ES Service] Erro ao buscar táxon por ID: ${id}:`, error.meta?.body?.error || error);
    throw error;
  }
}

module.exports = {
  client,
  searchTaxons,
  getTaxonById
};

