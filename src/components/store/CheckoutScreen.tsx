import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const CheckoutScreen = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cashback');
  const [useCashback, setUseCashback] = useState(true);
  const [cashbackAmount, setCashbackAmount] = useState(50.00);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  if (!selectedProduct || !selectedStore) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produto não encontrado</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setStoreSubScreen('product-detail')}
          >
            <Text style={styles.errorButtonText}>Voltar ao Produto</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const subtotal = selectedProduct.price;
  const cashbackEarned = (subtotal * parseFloat(selectedStore.cashback.replace('%', ''))) / 100;
  const cashbackUsed = useCashback ? Math.min(cashbackAmount, subtotal) : 0;
  const total = subtotal - cashbackUsed;

  const paymentMethods = [
    { id: 'cashback', name: 'Cashback', icon: 'account-balance-wallet', iconType: 'MaterialIcons', description: 'Usar saldo disponível' },
    { id: 'pix', name: 'PIX', icon: 'flash-on', iconType: 'MaterialIcons', description: 'Aprovação instantânea' },
    { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card', iconType: 'MaterialIcons', description: 'Parcelamento disponível' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.checkoutHeader}>
        <View style={styles.checkoutHeaderTop}>
          <TouchableOpacity onPress={() => setStoreSubScreen('product-detail')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.checkoutTitle}>Finalizar Compra</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.checkoutContent} showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View style={styles.checkoutProductSummary}>
          <Image source={{ uri: selectedProduct.image }} style={styles.checkoutProductImage} />
          <View style={styles.checkoutProductInfo}>
            <Text style={styles.checkoutProductName}>{selectedProduct.name}</Text>
            <Text style={styles.checkoutProductCategory}>{selectedProduct.category}</Text>
            <Text style={styles.checkoutProductPrice}>{formatPrice(selectedProduct.price)}</Text>
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.checkoutStoreInfo}>
          <Text style={styles.checkoutStoreName}>{selectedStore.name}</Text>
          <Text style={styles.checkoutStoreAddress}>{selectedStore.address}</Text>
          <Text style={styles.checkoutStoreCashback}>
            {selectedStore.cashback} de cashback disponível
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.checkoutPaymentSection}>
          <Text style={styles.checkoutSectionTitle}>Forma de Pagamento</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.checkoutPaymentMethod,
                selectedPaymentMethod === method.id && styles.checkoutPaymentMethodSelected
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.checkoutPaymentMethodLeft}>
                <MaterialIcons name={method.icon as any} size={20} color="white" />
                <View style={styles.checkoutPaymentMethodInfo}>
                  <Text style={styles.checkoutPaymentMethodName}>{method.name}</Text>
                  <Text style={styles.checkoutPaymentMethodDescription}>{method.description}</Text>
                </View>
              </View>
              <View style={[
                styles.checkoutPaymentMethodRadio,
                selectedPaymentMethod === method.id && styles.checkoutPaymentMethodRadioSelected
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Cashback Usage */}
        {selectedPaymentMethod === 'cashback' && (
          <View style={styles.checkoutCashbackSection}>
            <Text style={styles.checkoutSectionTitle}>Usar Cashback</Text>
            <View style={styles.checkoutCashbackToggle}>
              <Text style={styles.checkoutCashbackToggleText}>Usar cashback disponível</Text>
              <TouchableOpacity
                style={[styles.checkoutToggle, useCashback && styles.checkoutToggleActive]}
                onPress={() => setUseCashback(!useCashback)}
              >
                <View style={[styles.checkoutToggleButton, useCashback && styles.checkoutToggleButtonActive]} />
              </TouchableOpacity>
            </View>

            {useCashback && (
              <View style={styles.checkoutCashbackAmount}>
                <Text style={styles.checkoutCashbackAmountLabel}>Valor a usar:</Text>
                <TextInput
                  style={styles.checkoutCashbackAmountInput}
                  value={cashbackAmount.toString()}
                  onChangeText={(text) => setCashbackAmount(parseFloat(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.checkoutOrderSummary}>
          <Text style={styles.checkoutSectionTitle}>Resumo do Pedido</Text>

          <View style={styles.checkoutSummaryRow}>
            <Text style={styles.checkoutSummaryLabel}>Subtotal:</Text>
            <Text style={styles.checkoutSummaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.checkoutSummaryRow}>
            <Text style={styles.checkoutSummaryLabel}>Cashback usado:</Text>
            <Text style={styles.checkoutSummaryDiscount}>-{formatPrice(cashbackUsed)}</Text>
          </View>

          <View style={styles.checkoutSummaryDivider} />

          <View style={styles.checkoutSummaryRow}>
            <Text style={styles.checkoutSummaryTotalLabel}>Total:</Text>
            <Text style={styles.checkoutSummaryTotalValue}>{formatPrice(total)}</Text>
          </View>

          <View style={styles.checkoutSummaryRow}>
            <Text style={styles.checkoutSummaryLabel}>Cashback ganho:</Text>
            <Text style={styles.checkoutSummaryCashback}>+{formatPrice(cashbackEarned)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.checkoutBottomBar}>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutScreen;
