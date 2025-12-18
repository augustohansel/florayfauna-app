import { BASE_URL } from '../constants/Api';
import { Taxon } from './taxonService';

export interface LocationCoords {
  lat: number;
  lon: number;
}

export interface Instance {
  instance_id: string;
  location: LocationCoords;
  description?: string; 
  observed_at: string;
  user_id?: string;
  image_url?: string;
  species: Taxon;
}

export interface GeoBounds {
  top_left: {
    lat: number;
    lon: number;
  };
  bottom_right: {
    lat: number;
    lon: number;
  };
}

export interface CreateInstanceDto {
  location: LocationCoords;
  species: Taxon;
  description?: string;
  user_id?: string;
}

export async function fetchInstancesByGeo(
  bounds: GeoBounds
): Promise<Instance[]> {
  const params = new URLSearchParams({
    topLeftLat: String(bounds.top_left.lat),
    topLeftLon: String(bounds.top_left.lon),
    bottomRightLat: String(bounds.bottom_right.lat),
    bottomRightLon: String(bounds.bottom_right.lon),
  });

  try {
    const response = await fetch(
      `${BASE_URL}/instances/search/geo?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao buscar instâncias por geo:', errorData);
      throw new Error(
        `Falha ao buscar dados das instâncias: ${response.statusText}`
      );
    }

    const data: Instance[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erro em fetchInstancesByGeo:', error);
    throw error;
  }
}

export async function createInstance(
  instanceData: CreateInstanceDto
): Promise<Instance> {
  try {
    const response = await fetch(`${BASE_URL}/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instanceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao criar instância:', errorData);
      throw new Error(`Falha ao criar instância: ${response.statusText}`);
    }

    const newInstance: Instance = await response.json();
    return newInstance;
  } catch (error) {
    console.error('Erro em createInstance:', error);
    throw error;
  }
}