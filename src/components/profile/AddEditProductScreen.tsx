import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FirestoreStoreData } from '../../utils/storeService';
import { FirestoreProductData } from '../../utils/productService';
import { createProduct, updateProduct } from '../../utils/productService';
import styles from '../../styles/appStyles';

interface AddEditProductScreenProps {
  editingProduct: FirestoreProductData | null;
  userStore: FirestoreStoreData | null;
  setProfileSubScreen: (screen: string | null) => void;
  setEditingProduct: (product: FirestoreProductData | null) => void;
  loadUserProducts: () => Promise<void>;
}

const AddEditProductScreen: React.FC<AddEditProductScreenProps> = ({
  editingProduct,
  userStore,
  setProfileSubScreen,
  setEditingProduct,
  loadUserProducts,
}) => {
  const isEditing = editingProduct !== null;
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState('0');
  const [productImageUri, setProductImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Solicitar permissão de acesso à galeria
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos!'
        );
      }
    })();
  }, []);

  // Atualizar campos quando editingProduct mudar
  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name || '');
      setProductDescription(editingProduct.description || '');
      setProductPrice(editingProduct.price?.toString() || '');
      setProductOriginalPrice(editingProduct.originalPrice?.toString() || '');
      setProductCategory(editingProduct.category || '');
      setProductStock(editingProduct.stock?.toString() || '0');
      setProductImageUri(editingProduct.imageUrl || null);
    } else {
      // Limpar campos quando não estiver editando
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductOriginalPrice('');
      setProductCategory('');
      setProductStock('0');
      setProductImageUri(null);
    }
  }, [editingProduct]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProductImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para usar a câmera!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProductImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Câmera', onPress: takePhoto },
      ]
    );
  };

  const handleSaveProduct = async () => {
    // Validações básicas
    if (!productName.trim()) {
      Alert.alert('Erro', 'O nome do produto é obrigatório');
      return;
    }

    if (!userStore?.id) {
      Alert.alert('Erro', 'Você precisa ter uma loja cadastrada');
      return;
    }

    const price = parseFloat(productPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erro', 'Preço inválido');
      return;
    }

    setIsSaving(true);
    
    try {
      if (isEditing && editingProduct?.id) {
        // Atualizar produto existente
        const updateData: any = {
          name: productName,
          price: price,
          stock: parseInt(productStock) || 0,
        };

        // Adicionar apenas campos preenchidos (não vazios)
        if (productDescription.trim()) {
          updateData.description = productDescription.trim();
        }
        if (productOriginalPrice.trim()) {
          const originalPrice = parseFloat(productOriginalPrice.replace(',', '.'));
          if (!isNaN(originalPrice) && originalPrice > 0) {
            updateData.originalPrice = originalPrice;
          }
        }
        if (productCategory.trim()) {
          updateData.category = productCategory.trim();
        }
        // Por enquanto, salvar a URI local da imagem
        // Quando tiver Firebase Storage, fazer upload e salvar a URL
        if (productImageUri) {
          updateData.imageUrl = productImageUri;
        }

        const success = await updateProduct(editingProduct.id, updateData);
        
        if (success) {
          await loadUserProducts();
          Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
            {
              text: 'OK',
              onPress: () => {
                setProfileSubScreen('products');
                setEditingProduct(null);
              }
            }
          ]);
        } else {
          Alert.alert('Erro', 'Erro ao atualizar produto');
        }
      } else {
        // Criar novo produto
        const productData: any = {
          storeId: userStore.id,
          name: productName.trim(),
          price: price,
          stock: parseInt(productStock) || 0,
          isActive: true,
        };

        // Adicionar apenas campos preenchidos (não vazios)
        if (productDescription.trim()) {
          productData.description = productDescription.trim();
        }
        if (productOriginalPrice.trim()) {
          const originalPrice = parseFloat(productOriginalPrice.replace(',', '.'));
          if (!isNaN(originalPrice) && originalPrice > 0) {
            productData.originalPrice = originalPrice;
          }
        }
        if (productCategory.trim()) {
          productData.category = productCategory.trim();
        }
        // Por enquanto, salvar a URI local da imagem
        // Quando tiver Firebase Storage, fazer upload e salvar a URL
        if (productImageUri) {
          productData.imageUrl = productImageUri;
        }

        const productId = await createProduct(productData);
        
        if (productId) {
          await loadUserProducts();
          Alert.alert('Sucesso', 'Produto criado com sucesso!', [
            {
              text: 'OK',
              onPress: () => {
                setProfileSubScreen('products');
                setEditingProduct(null);
              }
            }
          ]);
        } else {
          Alert.alert('Erro', 'Erro ao criar produto');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Erro ao salvar produto');
    } finally {
      setIsSaving(false);
    }
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

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Imagem do Produto (opcional)</Text>
            <View style={{ marginBottom: 12 }}>
              {productImageUri ? (
                <View style={{ marginBottom: 12 }}>
                  <Image 
                    source={{ uri: productImageUri }} 
                    style={{ 
                      width: '100%', 
                      height: 200, 
                      borderRadius: 12,
                      marginBottom: 12,
                      backgroundColor: '#1E293B'
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#DC2626', marginBottom: 8 }]}
                    onPress={() => setProductImageUri(null)}
                  >
                    <Text style={styles.primaryButtonText}>Remover Imagem</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{
                  width: '100%',
                  height: 200,
                  backgroundColor: '#1E293B',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#334155',
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <MaterialIcons name="image" size={48} color="#5C8FFC" />
                  <Text style={{ color: '#9CA3AF', marginTop: 8, fontSize: 14 }}>
                    Nenhuma imagem selecionada
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#5C8FFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                onPress={showImageOptions}
              >
                <MaterialIcons name="add-photo-alternate" size={20} color="white" />
                <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>
                  {productImageUri ? 'Trocar Imagem' : 'Selecionar Imagem'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.formLabel, { fontSize: 12, color: '#9CA3AF', marginTop: 8 }]}>
              Por enquanto, a imagem é salva localmente. Quando tiver Firebase Storage, faremos upload automático.
            </Text>
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
