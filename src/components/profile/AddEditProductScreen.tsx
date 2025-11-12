import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const AddEditProductScreen = () => {
  const isEditing = editingProduct !== null;
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar campos quando editingProduct mudar
  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name || '');
      setProductDescription(editingProduct.description || '');
      setProductPrice(editingProduct.price?.toString() || '');
      setProductOriginalPrice(editingProduct.originalPrice?.toString() || '');
      setProductCategory(editingProduct.category || '');
      setProductStock(editingProduct.stock?.toString() || '0');
    } else {
      // Limpar campos quando não estiver editando
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductOriginalPrice('');
      setProductCategory('');
      setProductStock('0');
    }
  }, [editingProduct]);

  const handleSaveProduct = async () => {
    // Validações básicas
    if (!productName.trim()) {
      Alert.alert('Erro', 'O nome do produto é obrigatório');
      return;
    }

    const price = parseFloat(productPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erro', 'Preço inválido');
      return;
    }

    setIsSaving(true);
    
    // Simular delay de salvamento (mockado)
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Sucesso', 
        isEditing ? 'Produto atualizado com sucesso! (Mockado)' : 'Produto criado com sucesso! (Mockado)',
        [
          {
            text: 'OK',
            onPress: () => {
              setProfileSubScreen('products');
              setEditingProduct(null);
            }
          }
        ]
      );
    }, 500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.profileHeader}>
        <View style={styles.profileHeaderTop}>
          <TouchableOpacity onPress={() => {
            setProfileSubScreen('products');
            setEditingProduct(null);
          }}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>
            {isEditing ? 'Editar Produto' : 'Adicionar Produto'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuCard}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome do Produto *</Text>
            <TextInput
              style={styles.formInput}
              value={productName}
              onChangeText={setProductName}
              placeholder="Digite o nome do produto"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Descrição</Text>
            <TextInput
              style={[styles.formInput, { minHeight: 100, textAlignVertical: 'top' }]}
              value={productDescription}
              onChangeText={setProductDescription}
              placeholder="Descreva o produto..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Preço *</Text>
            <TextInput
              style={styles.formInput}
              value={productPrice}
              onChangeText={(text) => {
                const numbers = text.replace(/[^\d,]/g, '');
                setProductPrice(numbers);
              }}
              placeholder="0,00"
              placeholderTextColor="#6B7280"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Preço Original (opcional)</Text>
            <TextInput
              style={styles.formInput}
              value={productOriginalPrice}
              onChangeText={(text) => {
                const numbers = text.replace(/[^\d,]/g, '');
                setProductOriginalPrice(numbers);
              }}
              placeholder="0,00"
              placeholderTextColor="#6B7280"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Categoria</Text>
            <TextInput
              style={styles.formInput}
              value={productCategory}
              onChangeText={setProductCategory}
              placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Estoque</Text>
            <TextInput
              style={styles.formInput}
              value={productStock}
              onChangeText={(text) => {
                const numbers = text.replace(/[^\d]/g, '');
                setProductStock(numbers);
              }}
              placeholder="0"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
            onPress={handleSaveProduct}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Adicionar Produto'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddEditProductScreen;
