import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const ManageStoreScreen = () => {
  const user = authState.user;
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    if (!storeName.trim()) {
      Alert.alert('Erro', 'O nome da loja é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      if (userStore?.id) {
        // Atualizar loja existente
        const success = await updateStore(userStore.id, {
          name: storeName,
          category: storeCategory,
          address: storeAddress,
          phone: storePhone,
          email: storeEmail,
          description: storeDescription,
        });
        if (success) {
          Alert.alert('Sucesso', 'Loja atualizada com sucesso!');
          await loadUserStore();
          setProfileSubScreen(null);
        } else {
          Alert.alert('Erro', 'Erro ao atualizar loja');
        }
      } else {
        // Criar nova loja
        const storeId = await createStore({
          name: storeName,
          ownerId: user.id,
          category: storeCategory,
          address: storeAddress,
          phone: storePhone,
          email: storeEmail,
          description: storeDescription,
          isActive: true,
        });
        if (storeId) {
          Alert.alert('Sucesso', 'Loja criada com sucesso!');
          await loadUserStore();
          setProfileSubScreen(null);
        } else {
          Alert.alert('Erro', 'Erro ao criar loja');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar loja:', error);
      Alert.alert('Erro', 'Erro ao salvar loja');
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
            <TextInput
              style={styles.formInput}
              value={storeCategory}
              onChangeText={setStoreCategory}
              placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
              placeholderTextColor="#6B7280"
            />
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
