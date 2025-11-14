import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { getProductsByStore } from '../../utils/productService';
import { FirestoreProductData } from '../../utils/productService';
import styles from '../../styles/appStyles';

interface StoreDetailScreenProps {
  selectedStore: any;
  setCurrentScreen: (screen: string) => void;
  setStoreSubScreen: (screen: string | null) => void;
  setSelectedProduct: (product: any) => void;
}

const StoreDetailScreen: React.FC<StoreDetailScreenProps> = ({
  selectedStore,
  setCurrentScreen,
  setStoreSubScreen,
  setSelectedProduct,
}) => {
  const [storeProducts, setStoreProducts] = useState<FirestoreProductData[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Carregar produtos da loja
  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedStore?.id) {
        setStoreProducts([]);
        return;
      }

      try {
        setIsLoadingProducts(true);
        const products = await getProductsByStore(selectedStore.id, false); // Apenas produtos ativos
        setStoreProducts(products || []);
      } catch (error) {
        console.error('Erro ao carregar produtos da loja:', error);
        setStoreProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [selectedStore?.id]);

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
          {selectedStore.description && (
            <Text style={styles.storeDetailDescription}>{selectedStore.description}</Text>
          )}

          {/* Store Details */}
          <View style={styles.storeDetailItems}>
            {selectedStore.address && (
              <View style={styles.storeDetailItem}>
                <MaterialIcons name="place" size={18} color="white" />
                <Text style={styles.storeDetailItemText}>{selectedStore.address}</Text>
              </View>
            )}
            {selectedStore.phone && (
              <View style={styles.storeDetailItem}>
                <MaterialIcons name="phone" size={18} color="white" />
                <Text style={styles.storeDetailItemText}>{selectedStore.phone}</Text>
              </View>
            )}
            <View style={styles.storeDetailItem}>
              <MaterialIcons name="star" size={18} color="white" />
              <Text style={styles.storeDetailItemText}>
                {selectedStore.rating} {selectedStore.distance && `(${selectedStore.distance})`}
              </Text>
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

          {isLoadingProducts ? (
            <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>
              Carregando produtos...
            </Text>
          ) : storeProducts.length === 0 ? (
            <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>
              Nenhum produto disponível
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {storeProducts
                .filter((product) => product && product.id)
                .slice(0, 3)
                .map((product, index) => (
                  <TouchableOpacity
                    key={product.id || `product-${index}`}
                    style={styles.productPreviewCard}
                    onPress={() => {
                      console.log('Produto selecionado (preview):', product);
                      setSelectedProduct(product);
                      setStoreSubScreen('product-detail');
                    }}
                  >
                    <Image 
                      source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }} 
                      style={styles.productPreviewImage} 
                    />
                    <Text style={styles.productPreviewName}>{product.name || 'Produto sem nome'}</Text>
                    <View style={styles.productPreviewPrice}>
                      <Text style={styles.productPreviewCurrentPrice}>
                        {formatPrice(typeof product.price === 'number' ? product.price : 0)}
                      </Text>
                      {product.originalPrice && typeof product.originalPrice === 'number' && typeof product.price === 'number' && product.originalPrice > product.price && (
                        <Text style={styles.productPreviewOriginalPrice}>
                          {formatPrice(product.originalPrice)}
                        </Text>
                      )}
                    </View>
                    {product.rating && typeof product.rating === 'number' && (
                      <View style={styles.productPreviewRating}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialIcons name="star" size={14} color="#FFD700" />
                          <Text style={styles.productPreviewRatingText}> {product.rating.toFixed(1)}</Text>
                        </View>
                        {product.reviewsCount && typeof product.reviewsCount === 'number' && (
                          <Text style={styles.productPreviewReviewsText}>({product.reviewsCount})</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StoreDetailScreen;
