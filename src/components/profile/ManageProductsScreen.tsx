import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { FirestoreStoreData } from '../../utils/storeService';
import { FirestoreProductData, deleteProduct } from '../../utils/productService';
import styles from '../../styles/appStyles';

// Função para obter ícone genérico baseado na categoria
const getCategoryIcon = (category?: string): string => {
  if (!category) return 'shopping-bag';
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('eletrôn') || categoryLower.includes('tech')) return 'devices';
  if (categoryLower.includes('roup') || categoryLower.includes('vestuário')) return 'checkroom';
  if (categoryLower.includes('aliment') || categoryLower.includes('comida')) return 'restaurant';
  if (categoryLower.includes('farmácia') || categoryLower.includes('medicina')) return 'local-pharmacy';
  if (categoryLower.includes('beleza') || categoryLower.includes('cosmético')) return 'face';
  if (categoryLower.includes('pet') || categoryLower.includes('animal')) return 'pets';
  if (categoryLower.includes('academia') || categoryLower.includes('fitness')) return 'fitness-center';
  if (categoryLower.includes('casa') || categoryLower.includes('decoração')) return 'home';
  if (categoryLower.includes('livro') || categoryLower.includes('educação')) return 'menu-book';
  if (categoryLower.includes('brinquedo') || categoryLower.includes('jogo')) return 'sports-esports';
  
  return 'shopping-bag';
};

interface ManageProductsScreenProps {
  userStore: FirestoreStoreData | null;
  userProducts: FirestoreProductData[];
  setProfileSubScreen: (screen: string | null) => void;
  setEditingProduct: (product: FirestoreProductData | null) => void;
  loadUserProducts: () => Promise<void>;
}

const ManageProductsScreen: React.FC<ManageProductsScreenProps> = ({
  userStore,
  userProducts,
  setProfileSubScreen,
  setEditingProduct,
  loadUserProducts,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar produtos do Firebase quando a tela é aberta ou quando userStore mudar
  useEffect(() => {
    if (userStore?.id) {
      loadUserProducts();
    }
  }, [userStore?.id, loadUserProducts]);

  // Função de voltar
  const handleGoBack = useCallback(() => {
    setProfileSubScreen(null);
  }, [setProfileSubScreen]);

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const success = await deleteProduct(productId);
              
              if (success) {
                console.log('Produto excluído com sucesso do Firestore:', productId);
                Alert.alert('Sucesso', 'Produto excluído com sucesso!');
                // Recarregar produtos do Firebase
                await loadUserProducts();
              } else {
                Alert.alert('Erro', 'Erro ao excluir produto. Tente novamente.');
              }
            } catch (error: any) {
              console.error('Erro ao excluir produto:', error);
              Alert.alert('Erro', `Erro ao excluir produto: ${error?.message || 'Erro desconhecido'}`);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.profileHeader}>
        <View style={styles.profileHeaderTop}>
          <TouchableOpacity 
            onPress={handleGoBack}
            style={{ zIndex: 1000, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
            disabled={false}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>Meus Produtos</Text>
          <TouchableOpacity 
            onPress={() => {
              if (!userStore?.id) {
                Alert.alert('Aviso', 'Você precisa criar uma loja primeiro');
                return;
              }
              setEditingProduct(null);
              setProfileSubScreen('add-product');
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.profileContent} 
        showsVerticalScrollIndicator={false}
      >
        {userProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={64} color="#6B7280" />
            <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setEditingProduct(null);
                setProfileSubScreen('add-product');
              }}
            >
              <Text style={styles.primaryButtonText}>Adicionar Primeiro Produto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Header com estatísticas */}
            <View style={styles.productsHeader}>
              <View style={styles.productsStatsCard}>
                <View style={styles.productsStatItem}>
                  <MaterialIcons name="inventory" size={20} color="#5C8FFC" />
                  <View style={styles.productsStatText}>
                    <Text style={styles.productsStatValue}>{userProducts.length}</Text>
                    <Text style={styles.productsStatLabel}>
                      {userProducts.length === 1 ? 'Produto' : 'Produtos'}
                    </Text>
                  </View>
                </View>
                <View style={styles.productsStatDivider} />
                <View style={styles.productsStatItem}>
                  <MaterialIcons name="check-circle" size={20} color="#10B981" />
                  <View style={styles.productsStatText}>
                    <Text style={styles.productsStatValue}>
                      {userProducts.filter(p => p.isActive).length}
                    </Text>
                    <Text style={styles.productsStatLabel}>Ativos</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Lista de produtos */}
            <View style={styles.productsList}>
              {userProducts
                .filter((product) => product && product.id)
                .map((product, index) => {
                  const categoryIcon = getCategoryIcon(product.category);
                  return (
                    <View key={product.id} style={styles.manageProductCard}>
                      {/* Badge de status */}
                      {Boolean(product.isActive) && (
                        <View style={styles.productStatusBadge}>
                          <MaterialIcons name="check-circle" size={12} color="#10B981" />
                          <Text style={[styles.productStatusText, { marginLeft: 4 }]}>Ativo</Text>
                        </View>
                      )}
                      
                      <View style={styles.productCardContent}>
                        {/* Imagem do produto (genérica por enquanto) */}
                        <View style={{
                          width: 80,
                          height: 80,
                          backgroundColor: '#1E293B',
                          borderRadius: 8,
                          marginRight: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: '#334155',
                        }}>
                          {product.imageUrl ? (
                            <Image 
                              source={{ uri: String(product.imageUrl) }} 
                              style={{ width: '100%', height: '100%', borderRadius: 8 }}
                              resizeMode="cover"
                            />
                          ) : (
                            <MaterialIcons 
                              name={categoryIcon as any} 
                              size={40} 
                              color="#5C8FFC" 
                            />
                          )}
                        </View>

                        <View style={styles.productCardLeft}>
                          <View style={styles.productHeaderRow}>
                            <Text style={styles.productCardName}>{product.name || 'Produto sem nome'}</Text>
                          </View>
                          
                          {Boolean(product.category) && (
                            <View style={styles.productCategoryBadge}>
                              <Text style={styles.productCategoryText}>{String(product.category)}</Text>
                            </View>
                          )}

                          <View style={styles.productPriceRow}>
                            <Text style={styles.productCardPrice}>
                              R$ {typeof product.price === 'number' ? product.price.toFixed(2).replace('.', ',') : '0,00'}
                            </Text>
                            {product.originalPrice && typeof product.originalPrice === 'number' && product.originalPrice > product.price && (
                              <View style={styles.productDiscountContainer}>
                                <Text style={styles.productCardOriginalPrice}>
                                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                </Text>
                                <View style={{ marginLeft: 8 }}>
                                  <View style={styles.productDiscountBadge}>
                                    <Text style={styles.productDiscountText}>
                                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            )}
                          </View>

                          {product.stock !== undefined && product.stock !== null && (
                            <View style={styles.productStockRow}>
                              <MaterialIcons name="inventory-2" size={14} color="#9CA3AF" />
                              <Text style={[styles.productCardStock, { marginLeft: 6 }]}>
                                {String(product.stock)} {product.stock === 1 ? 'unidade' : 'unidades'} em estoque
                              </Text>
                            </View>
                          )}

                          {typeof product.rating === 'number' && product.rating > 0 && (
                            <View style={styles.productRatingRow}>
                              <MaterialIcons name="star" size={14} color="#FBBF24" />
                              <Text style={[styles.productRatingText, { marginLeft: 4 }]}>
                                {product.rating.toFixed(1)} ({String(product.reviewsCount || 0)} avaliações)
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.productCardRight}>
                          <TouchableOpacity
                            style={[styles.productActionButton, styles.productEditButton, { marginBottom: 8 }]}
                            onPress={() => {
                              setEditingProduct(product);
                              setProfileSubScreen('add-product');
                            }}
                            activeOpacity={0.7}
                          >
                            <MaterialIcons name="edit" size={18} color="#5C8FFC" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.productActionButton, styles.productDeleteButton]}
                            onPress={() => product.id && handleDeleteProduct(product.id)}
                            activeOpacity={0.7}
                          >
                            <MaterialIcons name="delete" size={18} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ManageProductsScreen;
