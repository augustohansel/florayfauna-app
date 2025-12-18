import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Instance } from '../api/instanceService';

export interface InstanceDetailsModalProps {
  visible: boolean;
  instance: Instance | null;
  onClose: () => void;
}

export default function InstanceDetailsModal({
  visible,
  instance,
  onClose,
}: InstanceDetailsModalProps) {
  if (!instance) return null;

  const portugueseNames =
    instance.species.vernacularNames
      ?.filter((v) => v.language === 'PORTUGUES' && v.name)
      .map((v) => v.name) || [];

  const otherNames =
    instance.species.vernacularNames
      ?.filter((v) => v.language !== 'PORTUGUES' && v.name)
      .map((v) => v.name) || [];

  const allNames = [...portugueseNames, ...otherNames];
  const vernacularDisplay =
    allNames.length > 0
      ? allNames.join(', ')
      : 'Nome popular não disponível';

  const referenceUrl = instance.species.metadata?.references;

  const handleOpenLink = async () => {
    if (referenceUrl) {
      try {
        const supported = await Linking.canOpenURL(referenceUrl);
        if (supported) {
          await Linking.openURL(referenceUrl);
        } else {
          Alert.alert('Erro', `Não é possível abrir este URL: ${referenceUrl}`);
        }
      } catch (error) {
        Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir o link.');
      }
    } else {
      Alert.alert('Info', 'Este táxon não possui um link de referência.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContent}>
            <View style={styles.headerContainer}>
              <Text style={styles.modalTitle}>Detalhes da Instância</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <BlurView
                intensity={100}
                tint="light"
                style={styles.infoCard}
              >
                <Text style={styles.scientificName}>
                  {instance.species.scientificName}
                </Text>
                <Text style={styles.vernacularName}>{vernacularDisplay}</Text>

                <View style={styles.divider} />

                <Text style={styles.detailTitle}>Registrado por:</Text>
                <Text style={styles.detailText}>
                  {instance.user_id || 'Não informado'}
                </Text>

                <Text style={styles.detailTitle}>Descrição:</Text>
                <Text style={styles.detailText}>
                  {instance.description || 'Nenhuma descrição fornecida.'}
                </Text>

                <Text style={styles.detailTitle}>Observado em:</Text>
                <Text style={styles.detailText}>
                  {new Date(instance.observed_at).toLocaleString('pt-BR')}
                </Text>

                <Text style={styles.detailTitle}>Classificação:</Text>
                <Text style={styles.detailText}>
                  {instance.species.higherClassification?.kingdom || 'N/A'}
                  {' > '}
                  {instance.species.higherClassification?.family || 'N/A'}
                  {' > '}
                  {instance.species.higherClassification?.genus || 'N/A'}
                </Text>
              </BlurView>

              {referenceUrl && (
                <BlurView
                  intensity={90}
                  tint="light"
                  style={styles.linkButtonWrapper}
                >
                  <TouchableOpacity
                    style={styles.linkButtonTouchable}
                    onPress={handleOpenLink}
                  >
                    <Text style={styles.linkButtonText}>
                      Ver Ficha (Reflora)
                    </Text>
                    <Feather
                      name="external-link"
                      size={16}
                      color="#0066CC"
                    />
                  </TouchableOpacity>
                </BlurView>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    maxHeight: '85%',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
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
    flex: 1,
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  infoCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  scientificName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  vernacularName: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 15,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginTop: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#111',
    marginBottom: 5,
  },
  linkButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  linkButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'transparent', 
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC', 
    marginRight: 8,
  },
});