import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const BuyCashbackScreen = () => {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [selectedMethod, setSelectedMethod] = useState('pix');

  const cashbackPackages = [
    { id: 1, amount: 25, price: 20, bonus: 0, popular: false },
    { id: 2, amount: 50, price: 40, bonus: 5, popular: true },
    { id: 3, amount: 100, price: 80, bonus: 15, popular: false },
    { id: 4, amount: 200, price: 160, bonus: 40, popular: false },
  ];

  const paymentMethods = [
    { id: 'pix', name: 'PIX', icon: 'flash-on', iconType: 'MaterialIcons', description: 'Aprovação instantânea' },
    { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card', iconType: 'MaterialIcons', description: 'Parcelamento disponível' },
    { id: 'debit', name: 'Cartão de Débito', icon: 'account-balance', iconType: 'MaterialIcons', description: 'Débito em conta' },
  ];

  const selectedPackage = cashbackPackages.find(pkg => pkg.amount === selectedAmount);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.buyCashbackHeader}>
        <View style={styles.buyCashbackHeaderTop}>
          <TouchableOpacity onPress={() => setWalletSubScreen(null)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.buyCashbackTitle}>Comprar Cashback</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.buyCashbackContent} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#60A5FA" />
            <Text style={styles.infoCardTitle}> Como funciona?</Text>
          </View>
          <Text style={styles.infoCardText}>
            Compre cashback e use em qualquer loja parceira. Quanto mais você compra, maior o bônus!
          </Text>
        </View>

        {/* Package Selection */}
        <View style={styles.packageSection}>
          <Text style={styles.sectionTitle}>Escolha seu pacote</Text>
          <View style={styles.packagesGrid}>
            {cashbackPackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  selectedAmount === pkg.amount && styles.packageCardSelected,
                  pkg.popular && styles.packageCardPopular
                ]}
                onPress={() => setSelectedAmount(pkg.amount)}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
                  </View>
                )}
                <Text style={styles.packageAmount}>R$ {pkg.amount}</Text>
                <Text style={styles.packagePrice}>R$ {pkg.price}</Text>
                {pkg.bonus > 0 && (
                  <Text style={styles.packageBonus}>+R$ {pkg.bonus} bônus</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Forma de pagamento</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedMethod === method.id && styles.paymentMethodCardSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.paymentMethodLeft}>
                <MaterialIcons name={method.icon as any} size={20} color="white" />
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                </View>
              </View>
              <View style={[
                styles.paymentMethodRadio,
                selectedMethod === method.id && styles.paymentMethodRadioSelected
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo da compra</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cashback:</Text>
            <Text style={styles.summaryValue}>R$ {selectedPackage?.amount}</Text>
          </View>
          {selectedPackage && selectedPackage.bonus > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bônus:</Text>
              <Text style={styles.summaryBonusValue}>+R$ {selectedPackage.bonus}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total a pagar:</Text>
            <Text style={styles.summaryTotalValue}>R$ {selectedPackage?.price}</Text>
          </View>
        </View>

        {/* Buy Button */}
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Comprar Agora</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default BuyCashbackScreen;
