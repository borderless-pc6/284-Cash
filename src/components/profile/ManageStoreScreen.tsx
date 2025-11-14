import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthState } from '../../types';
import { FirestoreStoreData, createStore, updateStore } from '../../utils/storeService';
import styles from '../../styles/appStyles';

// Categorias disponíveis no sistema
const AVAILABLE_CATEGORIES = [
  'Vestuário',
  'Alimentação',
  'Eletrônicos',
  'Farmácia',
  'Beleza',
  'Pet Shop',
  'Academia',
];

interface ManageStoreScreenProps {
  authState: AuthState;
  userStore: FirestoreStoreData | null;
  setProfileSubScreen: (screen: string | null) => void;
  loadUserStore: () => Promise<void>;
}

const ManageStoreScreen: React.FC<ManageStoreScreenProps> = ({
  authState,
  userStore,
  setProfileSubScreen,
  loadUserStore,
}) => {
  const user = authState.user;
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Atualizar campos quando userStore for carregado
  useEffect(() => {
    if (userStore) {
      setStoreName(userStore.name || '');
      setStoreCategory(userStore.category || '');
      setStoreAddress(userStore.address || '');
      setStorePhone(userStore.phone || '');
      setStoreEmail(userStore.email || '');
      setStoreDescription(userStore.description || '');
    }
  }, [userStore]);

  const handleSaveStore = async () => {
    if (!user || !user.id) {
      console.error('Erro: Usuário não encontrado ou sem ID', { user, userId: user?.id });
      Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    if (!storeName.trim()) {
      Alert.alert('Erro', 'O nome da loja é obrigatório');
      return;
    }

    console.log('Salvando loja com ownerId:', user.id, 'Nome:', storeName.trim());

    setIsSaving(true);
    try {
      if (userStore?.id) {
        // Atualizar loja existente no Firestore
        const updateData: any = {
          name: storeName.trim(),
        };

        // Adicionar apenas campos preenchidos (não vazios)
        if (storeCategory.trim()) {
          updateData.category = storeCategory.trim();
        }
        if (storeAddress.trim()) {
          updateData.address = storeAddress.trim();
        }
        if (storePhone.trim()) {
          updateData.phone = storePhone.trim();
        }
        if (storeEmail.trim()) {
          updateData.email = storeEmail.trim();
        }
        if (storeDescription.trim()) {
          updateData.description = storeDescription.trim();
        }

        const success = await updateStore(userStore.id, updateData);
        
        if (success) {
          console.log('Loja atualizada com sucesso no Firestore:', userStore.id);
          Alert.alert('Sucesso', 'Loja atualizada com sucesso!');
          // Recarregar dados da loja do Firestore
          await loadUserStore();
          setProfileSubScreen(null);
        } else {
          console.error('Falha ao atualizar loja no Firestore');
          Alert.alert('Erro', 'Erro ao atualizar loja. Verifique sua conexão e tente novamente.');
        }
      } else {
        // Criar nova loja no Firestore
        const storeData: any = {
          name: storeName.trim(),
          ownerId: String(user.id), // Garantir que seja string
          isActive: true,
        };

        console.log('Dados da loja a serem salvos:', storeData);

        // Adicionar apenas campos preenchidos (não vazios)
        if (storeCategory.trim()) {
          storeData.category = storeCategory.trim();
        }
        if (storeAddress.trim()) {
          storeData.address = storeAddress.trim();
        }
        if (storePhone.trim()) {
          storeData.phone = storePhone.trim();
        }
        if (storeEmail.trim()) {
          storeData.email = storeEmail.trim();
        }
        if (storeDescription.trim()) {
          storeData.description = storeDescription.trim();
        }

        const storeId = await createStore(storeData);
        
        if (storeId) {
          console.log('Loja criada com sucesso no Firestore:', storeId, 'com ownerId:', user.id);
          Alert.alert('Sucesso', 'Loja criada com sucesso!');
          // Recarregar dados da loja do Firestore
          await loadUserStore();
          setProfileSubScreen(null);
        } else {
          console.error('Falha ao criar loja no Firestore');
          Alert.alert('Erro', 'Erro ao criar loja. Verifique sua conexão e tente novamente.');
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar loja no Firestore:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao salvar loja';
      Alert.alert(
        'Erro', 
        `Não foi possível salvar a loja: ${errorMessage}\n\nVerifique:\n- Sua conexão com a internet\n- As configurações do Firebase\n- As regras de segurança do Firestore`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.profileHeader}>
        <View style={styles.profileHeaderTop}>
          <TouchableOpacity onPress={() => setProfileSubScreen(null)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>Gerenciar Loja</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuCard}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome da Loja *</Text>
            <TextInput
              style={styles.formInput}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Digite o nome da loja"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Categoria</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: storeCategory ? '#FFFFFF' : '#6B7280', fontSize: 16 }}>
                  {storeCategory || 'Selecione uma categoria'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
              </View>
            </TouchableOpacity>
            <Modal
              visible={showCategoryModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowCategoryModal(false)}
            >
              <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'flex-end',
              }}>
                <View style={{
                  backgroundColor: '#1E293B',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 20,
                  maxHeight: '70%',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                    }}>
                      Selecione uma categoria
                    </Text>
                    <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                      <MaterialIcons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    <TouchableOpacity
                      style={{
                        padding: 15,
                        borderBottomWidth: 1,
                        borderBottomColor: '#334155',
                      }}
                      onPress={() => {
                        setStoreCategory('');
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={{ color: '#9CA3AF', fontSize: 16 }}>Nenhuma</Text>
                    </TouchableOpacity>
                    {AVAILABLE_CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={{
                          padding: 15,
                          borderBottomWidth: 1,
                          borderBottomColor: '#334155',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          setStoreCategory(category);
                          setShowCategoryModal(false);
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{category}</Text>
                        {storeCategory === category && (
                          <MaterialIcons name="check" size={20} color="#5C8FFC" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Endereço</Text>
            <TextInput
              style={styles.formInput}
              value={storeAddress}
              onChangeText={setStoreAddress}
              placeholder="Digite o endereço da loja"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Telefone</Text>
            <TextInput
              style={styles.formInput}
              value={storePhone}
              onChangeText={setStorePhone}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>E-mail</Text>
            <TextInput
              style={styles.formInput}
              value={storeEmail}
              onChangeText={setStoreEmail}
              placeholder="contato@loja.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Descrição</Text>
            <TextInput
              style={[styles.formInput, { minHeight: 100, textAlignVertical: 'top' }]}
              value={storeDescription}
              onChangeText={setStoreDescription}
              placeholder="Descreva sua loja..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
            onPress={handleSaveStore}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? 'Salvando...' : userStore?.id ? 'Atualizar Loja' : 'Criar Loja'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ManageStoreScreen;
