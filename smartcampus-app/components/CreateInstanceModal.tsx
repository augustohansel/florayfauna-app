import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Taxon, searchTaxons } from '../api/taxonService';
import { LocationCoords, CreateInstanceDto } from '../api/instanceService';
import useDebounce from '../hooks/useDebounce';
import TaxonListItem from './TaxonListItem'; 

export interface CreateInstanceModalProps {
  visible: boolean;
  location: LocationCoords | null;
  onClose: () => void;
  onSubmit: (data: Omit<CreateInstanceDto, 'location'>) => Promise<void>;
}

export default function CreateInstanceModal({
  visible,
  location,
  onClose,
  onSubmit,
}: CreateInstanceModalProps) {
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedTaxon, setSelectedTaxon] = useState<Taxon | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [taxons, setTaxons] = useState<Taxon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (selectedTaxon) {
      setTaxons([]);
      return;
    }

    const fetchTaxons = async () => {
      if (debouncedSearchQuery.trim() === '') {
        setTaxons([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const results = await searchTaxons(debouncedSearchQuery);
        setTaxons(results);
      } catch (e) {
        setError('Não foi possível carregar os táxons.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTaxons();
  }, [debouncedSearchQuery, selectedTaxon]); 

  useEffect(() => {
    if (!visible) {
      setDescription('');
      setUserId('');
      setSearchQuery('');
      setTaxons([]);
      setSelectedTaxon(null);
      setIsLoading(false);
      setError(null);
      setIsSearchFocused(false);
    }
  }, [visible]);

  const handleTaxonSelect = (taxon: Taxon) => {
    setSelectedTaxon(taxon);
    setSearchQuery(taxon.scientificName); 
    setTaxons([]); 
    Keyboard.dismiss(); 
  };

  const handleSubmit = async () => {
    if (!selectedTaxon) {
      Alert.alert('Erro', 'Por favor, busque e selecione uma espécie.');
      return;
    }
    if (userId.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha quem registrou.');
      return;
    }
    if (!location) {
      Alert.alert('Erro', 'Localização inválida. Tente fechar e abrir o modal.');
      return;
    }

    try {
      await onSubmit({
        species: selectedTaxon,
        description: description.trim(),
        user_id: userId.trim(),
      });
    } catch (e) {
      console.error('Erro no handleSubmit do modal:', e);
    }
  };

  const clearSelectedTaxon = () => {
    setSelectedTaxon(null);
    setSearchQuery('');
  };

  const isSubmitDisabled = !selectedTaxon || userId.trim() === '';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
          enabled={isSearchFocused}
        >
          <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContent}>
                <View style={styles.headerContainer}>
                  <Text style={styles.modalTitle}>Registrar Espécime</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <Feather name="x" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Registrado por:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome ou ID"
                    value={userId}
                    onChangeText={setUserId}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Descrição:</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    placeholder="Detalhes da observação (opcional)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Espécie:</Text>
                  <TextInput
                    style={[
                      styles.input,
                      selectedTaxon ? styles.inputDisabled : null,
                    ]}
                    placeholder="Buscar por nome científico ou popular..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    editable={!selectedTaxon}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </View>
              
                {selectedTaxon && (
                  <View style={styles.selectedTaxonCard}>
                    <View style={styles.selectedTaxonInfo}>
                      <Feather name="check-circle" size={18} color="#34A853" />
                      <Text style={styles.selectedTaxonText} numberOfLines={1}>
                        {selectedTaxon.scientificName}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={clearSelectedTaxon}
                      style={styles.clearTaxonButton}
                    >
                      <Feather name="x" size={16} color="#555" />
                    </TouchableOpacity>
                  </View>
                )}

                {!selectedTaxon && (
                  <FlatList
                    data={taxons}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TaxonListItem
                        taxon={item}
                        onPress={() => handleTaxonSelect(item)} 
                      />
                    )}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyContainer}>
                        {isLoading ? (
                          <ActivityIndicator size="small" color="#888" />
                        ) : (
                          <Text style={styles.emptyText}>
                            {debouncedSearchQuery.trim() === ''
                              ? 'Digite para buscar...'
                              : 'Nenhum resultado encontrado.'}
                          </Text>
                        )}
                      </View>
                    )}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitDisabled && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitDisabled}
                >
                  <Text style={styles.submitButtonText}>
                    Registrar Instância
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    maxHeight: '85%', 
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputDisabled: {
    backgroundColor: '#f4f4f4',
    color: '#888',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  list: {
    maxHeight: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
  },
  selectedTaxonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6F7EB',
    borderRadius: 10,
    padding: 15,
    marginTop: -5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#b7e3c7',
  },
  selectedTaxonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedTaxonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  clearTaxonButton: {
    padding: 5,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#34A853', 
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});