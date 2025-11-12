import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const ProductDetailScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Preto');

  console.log('ProductDetailScreen - selectedProduct:', selectedProduct);
  console.log('ProductDetailScreen - selectedStore:', selectedStore);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const calculateCashback = () => {
    if (!selectedProduct || !selectedStore) return 0;
    const cashbackPercent = parseFloat(selectedStore.cashback.replace('%', ''));
    return (selectedProduct.price * quantity * cashbackPercent) / 100;
  };

  if (!selectedProduct || !selectedStore) {
    console.log('Produto ou loja não encontrados, exibindo tela de erro');
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produto não encontrado</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setStoreSubScreen('products')}
          >
            <Text style={styles.errorButtonText}>Voltar aos Produtos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalPrice = selectedProduct.price * quantity;
  const cashbackAmount = calculateCashback();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.productDetailHeader}>
        <View style={styles.productDetailHeaderTop}>
          <TouchableOpacity onPress={() => setStoreSubScreen('products')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.productDetailTitle}>Detalhes do Produto</Text>
          <TouchableOpacity>
            <MaterialIcons name="favorite" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.productDetailContent} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.productDetailImageContainer}>
          <Image source={{ uri: selectedProduct.image }} style={styles.productDetailImage} />
        </View>

        {/* Product Info */}
        <View style={styles.productDetailInfo}>
          <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
          <Text style={styles.productDetailCategory}>{selectedProduct.category}</Text>

          <View style={styles.productDetailRating}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.productDetailRatingText}> {selectedProduct.rating}</Text>
            </View>
            <Text style={styles.productDetailReviewsText}>({selectedProduct.reviews} avaliações)</Text>
          </View>

          {/* Price */}
          <View style={styles.productDetailPriceContainer}>
            <Text style={styles.productDetailCurrentPrice}>{formatPrice(selectedProduct.price)}</Text>
            <Text style={styles.productDetailOriginalPrice}>{formatPrice(selectedProduct.originalPrice)}</Text>
            <View style={styles.productDetailDiscount}>
              <Text style={styles.productDetailDiscountText}>
                {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
              </Text>
            </View>
          </View>

          {/* Cashback Info */}
          <View style={styles.productDetailCashback}>
            <MaterialIcons name="account-balance-wallet" size={20} color="white" />
            <Text style={styles.productDetailCashbackText}>
              Ganhe {selectedStore.cashback} de cashback ({formatPrice(cashbackAmount)})
            </Text>
          </View>

          {/* Size Selection */}
          <View style={styles.productDetailSection}>
            <Text style={styles.productDetailSectionTitle}>Tamanho</Text>
            <View style={styles.sizeOptions}>
              {['P', 'M', 'G', 'GG'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.sizeOptionSelected
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeOptionText,
                    selectedSize === size && styles.sizeOptionTextSelected
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.productDetailSection}>
            <Text style={styles.productDetailSectionTitle}>Cor</Text>
            <View style={styles.colorOptions}>
              {['Preto', 'Branco', 'Azul', 'Vermelho'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    selectedColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <Text style={[
                    styles.colorOptionText,
                    selectedColor === color && styles.colorOptionTextSelected
                  ]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selection */}
          <View style={styles.productDetailSection}>
            <Text style={styles.productDetailSectionTitle}>Quantidade</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Description */}
          <View style={styles.productDetailSection}>
            <Text style={styles.productDetailSectionTitle}>Descrição</Text>
            <Text style={styles.productDetailDescription}>
              Produto de alta qualidade com excelente custo-benefício.
              Perfeito para uso diário com design moderno e confortável.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.productDetailBottomBar}>
        <View style={styles.productDetailTotal}>
          <Text style={styles.productDetailTotalLabel}>Total:</Text>
          <Text style={styles.productDetailTotalPrice}>{formatPrice(totalPrice)}</Text>
          <Text style={styles.productDetailCashbackAmount}>
            +{formatPrice(cashbackAmount)} cashback
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => setStoreSubScreen('checkout')}
        >
          <Text style={styles.addToCartButtonText}>Adicionar ao Carrinho</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;
