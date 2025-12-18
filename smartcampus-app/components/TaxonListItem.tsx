import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Taxon } from '../api/taxonService';

interface TaxonListItemProps {
  taxon: Taxon;
  onPress?: (taxon: Taxon) => void;
}

export default function TaxonListItem({ taxon, onPress }: TaxonListItemProps) {
  const portugueseNames =
    taxon.vernacularNames
      ?.filter((v) => v.language === 'PORTUGUES' && v.name)
      .map((v) => v.name) || [];
  const otherNames =
    taxon.vernacularNames
      ?.filter((v) => v.language !== 'PORTUGUES' && v.name)
      .map((v) => v.name) || [];
  const allNames = [...portugueseNames, ...otherNames].slice(0, 3);
  let vernacularDisplay = allNames.join(', ');

  if (!vernacularDisplay) {
    vernacularDisplay = 'Nenhum nome popular encontrado';
  }

  const handlePress = async () => {
    if (onPress) {
      onPress(taxon);
      return;
    }

    const url = taxon.metadata?.references;
    if (!url) {
      Alert.alert(
        'URL não encontrada',
        'Este item não possui um link de referência.'
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', `Não é possível abrir esta URL: ${url}`);
      }
    } catch (error) {
      console.error('Ocorreu um erro ao tentar abrir a URL:', error);
      Alert.alert('Erro', 'Não foi possível abrir o link.');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Text style={styles.scientificName}>{taxon.scientificName}</Text>
      <Text style={styles.vernacularName}>{vernacularDisplay}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#FFF',
  },
  scientificName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  vernacularName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});