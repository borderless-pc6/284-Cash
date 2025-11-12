import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const StoreProductsScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  if (!selectedStore || !selectedStore.products) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loja não encontrada</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setStoreSubScreen(null)}
          >
            <Text style={styles.errorButtonText}>Voltar à Loja</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const categories = ['Todos', ...Array.from(new Set(selectedStore.products.map((p: any) => p.category)))];

  const filteredProducts = selectedCategory === 'Todos'
    ? selectedStore.products
    : selectedStore.products.filter((p: any) => p.category === selectedCategory);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.storeProductsHeader}>
        <View style={styles.storeProductsHeaderTop}>
          <TouchableOpacity onPress={() => setStoreSubScreen(null)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.storeProductsTitle}>Produtos - {selectedStore.name}</Text>
          <TouchableOpacity>
            <Text style={styles.filterIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesFilter}>
          {categories.map((category, index) => {
            const categoryStr = String(category);
            return (
              <TouchableOpacity
                key={categoryStr}
                style={[
                  styles.categoryFilterItem,
                  selectedCategory === categoryStr && styles.categoryFilterItemActive
                ]}
                onPress={() => setSelectedCategory(categoryStr)}
              >
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategory === categoryStr && styles.categoryFilterTextActive
                ]}>
                  {categoryStr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView style={styles.storeProductsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {filteredProducts.map((product: any) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => {
                console.log('Produto selecionado:', product);
                setSelectedProduct(product);
                setStoreSubScreen('product-detail');
              }}
            >
              <Image source={{ uri: product.image }} style={styles.productImage} />

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>

                <View style={styles.productPriceContainer}>
                  <Text style={styles.productCurrentPrice}>{formatPrice(product.price)}</Text>
                  <Text style={styles.productOriginalPrice}>{formatPrice(product.originalPrice)}</Text>
                </View>

                <View style={styles.productRating}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.productRatingText}> {product.rating}</Text>
                  </View>
                  <Text style={styles.productReviewsText}>({product.reviews})</Text>
                </View>

                <View style={styles.productCashback}>
                  <Text style={styles.productCashbackText}>
                    +{selectedStore.cashback} cashback
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default StoreProductsScreen;
