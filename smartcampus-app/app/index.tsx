import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Modal, 
  TextInput, 
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import type { MapEvent } from 'react-native-maps'; 
import * as Location from 'expo-location';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import useDebounce from '../hooks/useDebounce'; 
import { searchTaxons, Taxon } from '../api/taxonService';
import {
  Instance,
  LocationCoords,
  GeoBounds,
  fetchInstancesByGeo,
  createInstance,
  CreateInstanceDto,
} from '../api/instanceService';
import CreateInstanceModal from '../components/CreateInstanceModal';
import InstanceDetailsModal from '../components/InstanceDetailsModal';

const INITIAL_REGION = {
  latitude: -29.717,
  longitude: -53.715,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const DEFAULT_COORDS: LocationCoords = {
  lat: -29.717,
  lon: -53.715,
};


export default function HomeScreen() {
  const [unfilteredInstances, setUnfilteredInstances] = useState<Instance[]>(
    []
  );
  const [instances, setInstances] = useState<Instance[]>([]);
  const [currentRegion, setCurrentRegion] =
    useState<Region>(INITIAL_REGION);
  const debouncedRegion = useDebounce(currentRegion, 500);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  const [markerCoords, setMarkerCoords] = useState<LocationCoords | null>(
    null
  );
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null
  );
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterText, setFilterText] = useState(''); 
  const [activeFilter, setActiveFilter] = useState(''); 

  const regionToGeoBounds = (region: Region): GeoBounds => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    return {
      top_left: {
        lat: latitude + latitudeDelta / 2,
        lon: longitude - longitudeDelta / 2,
      },
      bottom_right: {
        lat: latitude - latitudeDelta / 2,
        lon: longitude + longitudeDelta / 2,
      },
    };
  };

  const centerOnUser = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Negada',
        'Precisamos da sua permissão para acessar a localização e centralizar o mapa.'
      );
      return;
    }

    try {
      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      }

      if (location && mapRef.current) {
        const userRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current.animateToRegion(userRegion, 1000);
      }
    } catch (e) {
      console.error('Erro ao obter localização:', e);
      Alert.alert('Erro', 'Não foi possível obter sua localização atual.');
    }
  };

  const getInstancesInBounds = async (region: Region) => {
    setIsLoadingMap(true);
    setError(null);
    try {
      const bounds = regionToGeoBounds(region);
      const data = await fetchInstancesByGeo(bounds);
      setUnfilteredInstances(data);
    } catch (e) {
      console.error('Erro ao buscar instâncias:', e);
      setError('Não foi possível carregar os registros.');
    } finally {
      setIsLoadingMap(false);
    }
  };

  useEffect(() => {
    centerOnUser();
  }, []);

  useEffect(() => {
    getInstancesInBounds(debouncedRegion);
  }, [debouncedRegion]);

  useEffect(() => {
    if (activeFilter.trim() === '') {
      setInstances(unfilteredInstances);
      return;
    }

    const lowerCaseFilter = activeFilter.toLowerCase();
    const filtered = unfilteredInstances.filter((instance) => {
      const nameMatch = instance.species.scientificName
        .toLowerCase()
        .includes(lowerCaseFilter);
      const vernacularMatch = instance.species.vernacularNames?.some((v) =>
        v.name.toLowerCase().includes(lowerCaseFilter)
      );
      const userMatch = instance.user_id
        ?.toLowerCase()
        .includes(lowerCaseFilter);
      const descMatch = instance.description
        ?.toLowerCase()
        .includes(lowerCaseFilter);

      return nameMatch || vernacularMatch || userMatch || descMatch;
    });

    setInstances(filtered);
  }, [unfilteredInstances, activeFilter]);

  const handleLongPress = (e: MapEvent) => {
    if (isCreateModalVisible) return;
    setMarkerCoords({
      lat: e.nativeEvent.coordinate.latitude,
      lon: e.nativeEvent.coordinate.longitude,
    });
    setIsCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
    setMarkerCoords(null);
  };

  const handleCreateSubmit = async (
    data: Omit<CreateInstanceDto, 'location'>
  ) => {
    if (!markerCoords) return;

    try {
      const newInstanceData: CreateInstanceDto = {
        ...data,
        location: markerCoords,
      };
      const newInstance = await createInstance(newInstanceData);

      setUnfilteredInstances((prev) => [...prev, newInstance]);

      Alert.alert(
        'Sucesso!',
        `${data.species.scientificName} foi registrado.`
      );
      handleCloseCreateModal();
    } catch (e) {
      console.error('Erro ao criar instância:', e);
      Alert.alert(
        'Erro',
        'Não foi possível salvar o registro. Tente novamente.'
      );
    }
  };

  const handleApplyFilter = () => {
    setActiveFilter(filterText); 
    setIsFilterModalVisible(false); 
  };

  const handleClearFilter = () => {
    setFilterText(''); 
    setActiveFilter(''); 
    setIsFilterModalVisible(false); 
  };

  const renderFilterModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isFilterModalVisible}
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        <View style={styles.filterModalContent}>
          <Text style={styles.filterTitle}>Filtrar Instâncias</Text>
          <Text style={styles.filterSubtitle}>
            Buscar por nome, descrição ou usuário.
          </Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Ex: Eucalyptus, morango, LAmb..."
            value={filterText}
            onChangeText={setFilterText}
          />
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={[styles.filterButton, styles.clearButton]}
              onPress={handleClearFilter}
            >
              <Text style={[styles.filterButtonText, styles.clearButtonText]}>
                Limpar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, styles.applyButton]}
              onPress={handleApplyFilter}
            >
              <Text style={styles.filterButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="satellite"
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={setCurrentRegion}
        onLongPress={handleLongPress}
        showsPointsOfInterest={false}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {}
        {instances.map((instance) => (
          <Marker
            key={instance.instance_id}
            coordinate={{
              latitude: instance.location.lat,
              longitude: instance.location.lon,
            }}
            onPress={() => setSelectedInstance(instance)}
          >
            <View style={styles.pin}>
              <MaterialCommunityIcons
                name="leaf"
                size={30}
                color="#34A853"
              />
            </View>
          </Marker>
        ))}

        {}
        {markerCoords && (
          <Marker
            coordinate={{
              latitude: markerCoords.lat,
              longitude: markerCoords.lon,
            }}
            pinColor="green"
          />
        )}
      </MapView>

      {}
      <TouchableOpacity
        style={[styles.controlButton, styles.filterButtonPosition]}
        onPress={() => setIsFilterModalVisible(true)}
      >
        <Feather name="filter" size={22} color="#333" />
        {}
        {activeFilter.trim() !== '' && <View style={styles.filterActiveDot} />}
      </TouchableOpacity>

      {}
      <TouchableOpacity
        style={[styles.controlButton, styles.locateButtonPosition]}
        onPress={centerOnUser}
      >
        <Feather name="crosshair" size={22} color="#333" />
      </TouchableOpacity>

      {}
      {isLoadingMap && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.overlayText}>Carregando...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => getInstancesInBounds(currentRegion)}
          >
            <Text style={styles.errorButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {}
      {renderFilterModal()}

      <CreateInstanceModal
        visible={isCreateModalVisible}
        location={markerCoords}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
      />

      {selectedInstance && (
        <InstanceDetailsModal
          visible={!!selectedInstance}
          instance={selectedInstance}
          onClose={() => setSelectedInstance(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(217, 48, 37, 0.9)',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  pin: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  controlButton: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 6,
  },
  locateButtonPosition: {
    left: 20, 
  },
  filterButtonPosition: {
    right: 20,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34A853',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  filterModalContent: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  filterSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterInput: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  clearButtonText: {
    color: '#555',
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: '#34A853',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});