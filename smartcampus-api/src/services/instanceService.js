const { v4: uuidv4 } = require('uuid');
const { client } = require('./elasticsearchService'); 
const INDEX_NAME = 'flora_funga_taxonomy_instances';

/**
 * Cria um novo documento de instância no Elasticsearch.
 * @param {object} instanceData 
 * @returns {Promise<object>}
 */
async function createInstance(instanceData) {
  const instanceId = uuidv4();
  const document = {
    instance_id: instanceId,
    observed_at: new Date().toISOString(),
    ...instanceData
  };

  try {
    await client.index({
      index: INDEX_NAME,
      id: instanceId,
      document: document,
      refresh: true
    });
    console.log(`[Instance Service] Instância ${instanceId} criada com sucesso.`);
    return document;
  } catch (error) {
    console.error(`[Instance Service] Erro ao criar instância:`, error);
    throw error;
  }
}

/**
 * Busca instâncias dentro de uma área geográfica (bounding box).
 * @param {object} bounds 
 * @returns {Promise<Array<object>>}
 */
async function findInstancesInGeoBounds(bounds) {
  try {
    const result = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            filter: {
              geo_bounding_box: {
                location: {
                  top_left: bounds.top_left,
                  bottom_right: bounds.bottom_right
                }
              }
            }
          }
        },
        size: 1000
      }
    });
    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error(`[Instance Service] Erro ao buscar instâncias por geo bounds:`, error);
    throw error;
  }
}

module.exports = {
  createInstance,
  findInstancesInGeoBounds
};
