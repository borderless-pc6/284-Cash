import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const StoreDetailScreen = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const calculateCashback = (price: number) => {
    if (!selectedStore) return 0;
    const cashbackPercent = parseFloat(selectedStore.cashback.replace('%', ''));
    return (price * cashbackPercent) / 100;
  };

  if (!selectedStore) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loja não encontrada</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.errorButtonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.storeDetailHeader}>
        <View style={styles.storeDetailHeaderTop}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.storeDetailTitle}>{selectedStore.name}</Text>
          <TouchableOpacity>
            <MaterialIcons name="share" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Store Image */}
        <View style={styles.storeDetailImageContainer}>
          <Image source={{ uri: selectedStore.image }} style={styles.storeDetailImage} />

          {/* Badges */}
          <View style={styles.storeDetailBadges}>
            <View style={[styles.badge, { backgroundColor: selectedStore.badgeColor }]}>
              <Text style={styles.badgeText}>{selectedStore.badge}</Text>
            </View>
            <View style={[styles.cashbackBadge, { backgroundColor: '#1E293B' }]}>
              <Text style={styles.cashbackText}>{selectedStore.cashback} cashback</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.storeDetailContent} showsVerticalScrollIndicator={false}>
        {/* Store Info */}
        <View style={styles.storeInfoSection}>
          <Text style={styles.storeDetailName}>{selectedStore.name}</Text>
          <Text style={styles.storeDetailCategory}>{selectedStore.category}</Text>
          <Text style={styles.storeDetailDescription}>{selectedStore.description}</Text>

          {/* Store Details */}
          <View style={styles.storeDetailItems}>
            <View style={styles.storeDetailItem}>
              <MaterialIcons name="place" size={18} color="white" />
              <Text style={styles.storeDetailItemText}>{selectedStore.address}</Text>
            </View>
            <View style={styles.storeDetailItem}>
              <MaterialIcons name="phone" size={18} color="white" />
              <Text style={styles.storeDetailItemText}>{selectedStore.phone}</Text>
            </View>
            <View style={styles.storeDetailItem}>
              <MaterialIcons name="access-time" size={18} color="white" />
              <Text style={styles.storeDetailItemText}>{selectedStore.hours}</Text>
            </View>
            <View style={styles.storeDetailItem}>
              <MaterialIcons name="star" size={18} color="white" />
              <Text style={styles.storeDetailItemText}>{selectedStore.rating} ({selectedStore.distance})</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.storeActionButtons}>
          <TouchableOpacity style={styles.storeActionButton}>
            <MaterialIcons name="phone" size={18} color="white" />
            <Text style={styles.storeActionButtonText}>Ligar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.storeActionButton}>
            <MaterialIcons name="map" size={18} color="white" />
            <Text style={styles.storeActionButtonText}>Navegar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.storeActionButtonPrimary}
            onPress={() => setStoreSubScreen('products')}
          >
            <MaterialIcons name="shopping-bag" size={18} color="white" />
            <Text style={styles.storeActionButtonTextPrimary}>Ver Produtos</Text>
          </TouchableOpacity>
        </View>

        {/* Products Preview */}
        <View style={styles.productsPreviewSection}>
          <View style={styles.productsPreviewHeader}>
            <Text style={styles.productsPreviewTitle}>Produtos em Destaque</Text>
            <TouchableOpacity onPress={() => setStoreSubScreen('products')}>
              <Text style={styles.seeAllProductsLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedStore.products.slice(0, 3).map((product: any) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productPreviewCard}
                onPress={() => {
                  console.log('Produto selecionado (preview):', product);
                  setSelectedProduct(product);
                  setStoreSubScreen('product-detail');
                }}
              >
                <Image source={{ uri: product.image }} style={styles.productPreviewImage} />
                <Text style={styles.productPreviewName}>{product.name}</Text>
                <View style={styles.productPreviewPrice}>
                  <Text style={styles.productPreviewCurrentPrice}>{formatPrice(product.price)}</Text>
                  <Text style={styles.productPreviewOriginalPrice}>{formatPrice(product.originalPrice)}</Text>
                </View>
                <View style={styles.productPreviewRating}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.productPreviewRatingText}> {product.rating}</Text>
                  </View>
                  <Text style={styles.productPreviewReviewsText}>({product.reviews})</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default StoreDetailScreen;
