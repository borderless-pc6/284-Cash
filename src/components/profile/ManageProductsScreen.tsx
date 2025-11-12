import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const ManageProductsScreen = () => {
  // Dados mockados para desenvolvimento
  const [mockProducts] = useState<FirestoreProductData[]>([
    {
      id: '1',
      storeId: userStore?.id || 'mock-store',
      name: 'Produto Exemplo 1',
      description: 'Descrição do produto exemplo',
      price: 99.90,
      originalPrice: 149.90,
      category: 'Eletrônicos',
      stock: 10,
      isActive: true,
      rating: 4.5,
      reviewsCount: 23,
    },
    {
      id: '2',
      storeId: userStore?.id || 'mock-store',
      name: 'Produto Exemplo 2',
      description: 'Outro produto de exemplo',
      price: 199.90,
      category: 'Roupas',
      stock: 5,
      isActive: true,
      rating: 4.8,
      reviewsCount: 15,
    },
  ]);

  const [localProducts, setLocalProducts] = useState<FirestoreProductData[]>(mockProducts);

  // Função de voltar
  const handleGoBack = useCallback(() => {
    setProfileSubScreen(null);
  }, []);

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
            Alert.alert('Sucesso', 'Produto excluído com sucesso!');
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
        {localProducts.length === 0 ? (
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
                    <Text style={styles.productsStatValue}>{localProducts.length}</Text>
                    <Text style={styles.productsStatLabel}>
                      {localProducts.length === 1 ? 'Produto' : 'Produtos'}
                    </Text>
                  </View>
                </View>
                <View style={styles.productsStatDivider} />
                <View style={styles.productsStatItem}>
                  <MaterialIcons name="check-circle" size={20} color="#10B981" />
                  <View style={styles.productsStatText}>
                    <Text style={styles.productsStatValue}>
                      {localProducts.filter(p => p.isActive).length}
                    </Text>
                    <Text style={styles.productsStatLabel}>Ativos</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Lista de produtos */}
            <View style={styles.productsList}>
              {localProducts.map((product, index) => (
                <View key={product.id} style={styles.manageProductCard}>
                  {/* Badge de status */}
                  {product.isActive && (
                    <View style={styles.productStatusBadge}>
                      <MaterialIcons name="check-circle" size={12} color="#10B981" />
                      <Text style={[styles.productStatusText, { marginLeft: 4 }]}>Ativo</Text>
                    </View>
                  )}
                  
                  <View style={styles.productCardContent}>
                    <View style={styles.productCardLeft}>
                      <View style={styles.productHeaderRow}>
                        <Text style={styles.productCardName}>{product.name}</Text>
                      </View>
                      
                      {product.category && (
                        <View style={styles.productCategoryBadge}>
                          <Text style={styles.productCategoryText}>{product.category}</Text>
                        </View>
                      )}

                      <View style={styles.productPriceRow}>
                        <Text style={styles.productCardPrice}>
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </Text>
                        {product.originalPrice && product.originalPrice > product.price && (
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

                      {product.stock !== undefined && (
                        <View style={styles.productStockRow}>
                          <MaterialIcons name="inventory-2" size={14} color="#9CA3AF" />
                          <Text style={[styles.productCardStock, { marginLeft: 6 }]}>
                            {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'} em estoque
                          </Text>
                        </View>
                      )}

                      {product.rating && (
                        <View style={styles.productRatingRow}>
                          <MaterialIcons name="star" size={14} color="#FBBF24" />
                          <Text style={[styles.productRatingText, { marginLeft: 4 }]}>
                            {product.rating.toFixed(1)} ({product.reviewsCount || 0} avaliações)
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
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ManageProductsScreen;
