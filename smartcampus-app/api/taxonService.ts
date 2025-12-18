import { BASE_URL } from '../constants/Api';

export interface VernacularName {
  name: string;
  language: string;
}

export interface HigherClassification {
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
}

export interface Metadata {
  references?: string;
}

export interface Distribution {
  locationID?: string;
  establishmentMeans?: string;
}

export interface Sinonym {
  scientificName?: string;
  taxonomicStatus?: string;
}

export interface Taxon {
  id: string;
  scientificName: string;
  taxonRank?: string;
  higherClassification?: HigherClassification;
  metadata?: Metadata;
  vernacularNames?: VernacularName[];
  distribution?: Distribution[];
  sinonyms?: Sinonym[];
  taxonomicStatus?: string;
  acceptedNameUsageID?: string;
}

/**
 * Realiza uma busca textual de táxons.
 * @param {string} query - O termo de busca.
 * @returns {Promise<Taxon[]>} - Um array de táxons encontrados.
 */
export async function searchTaxons(query: string): Promise<Taxon[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/taxons/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Falha ao buscar dados da API');
    }
    const data: Taxon[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erro em searchTaxons:', error);
    throw error;
  }
}

