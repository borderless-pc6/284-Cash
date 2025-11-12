import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const VouchersScreen = () => {
  const [activeTab, setActiveTab] = useState('available');

  const availableVouchers = [
    {
      id: 1,
      storeName: 'TechWorld',
      discount: '10%',
      description: 'Desconto em eletrônicos',
      expiryDate: '31/01/2025',
      minValue: 100,
      icon: 'flash-on',
      iconType: 'MaterialIcons',
      iconBg: '#4CAF50',
    },
    {
      id: 2,
      storeName: 'Boutique Elegance',
      discount: '15%',
      description: 'Desconto em roupas',
      expiryDate: '28/01/2025',
      minValue: 50,
      icon: 'checkroom',
      iconType: 'MaterialIcons',
      iconBg: '#9E9E9E',
    },
    {
      id: 3,
      storeName: 'Farmácia Saúde+',
      discount: '8%',
      description: 'Desconto em medicamentos',
      expiryDate: '25/01/2025',
      minValue: 30,
      icon: 'local-pharmacy',
      iconType: 'MaterialIcons',
      iconBg: '#4CAF50',
    },
  ];

  const usedVouchers = [
    {
      id: 4,
      storeName: 'Restaurante Sabor',
      discount: '12%',
      description: 'Desconto em refeições',
      usedDate: '15/01/2025',
      icon: 'restaurant',
      iconType: 'MaterialIcons',
      iconBg: '#8D6E63',
    },
  ];

  const currentVouchers = activeTab === 'available' ? availableVouchers : usedVouchers;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.vouchersHeader}>
        <View style={styles.vouchersHeaderTop}>
          <TouchableOpacity onPress={() => setWalletSubScreen(null)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.vouchersTitle}>Meus Vouchers</Text>
        </View>

        {/* Tabs */}
        <View style={styles.vouchersTabs}>
          <TouchableOpacity
            style={[styles.vouchersTab, activeTab === 'available' && styles.vouchersTabActive]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.vouchersTabText, activeTab === 'available' && styles.vouchersTabTextActive]}>
              Disponíveis ({availableVouchers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.vouchersTab, activeTab === 'used' && styles.vouchersTabActive]}
            onPress={() => setActiveTab('used')}
          >
            <Text style={[styles.vouchersTabText, activeTab === 'used' && styles.vouchersTabTextActive]}>
              Usados ({usedVouchers.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.vouchersContent} showsVerticalScrollIndicator={false}>
        {currentVouchers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="confirmation-number" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Nenhum voucher encontrado</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'available'
                ? 'Você não possui vouchers disponíveis no momento.'
                : 'Você ainda não usou nenhum voucher.'
              }
            </Text>
          </View>
        ) : (
          currentVouchers.map((voucher) => (
            <View key={voucher.id} style={styles.voucherCard}>
              <View style={styles.voucherLeft}>
                <View style={[styles.voucherIcon, { backgroundColor: voucher.iconBg }]}>
                  <MaterialIcons name={voucher.icon as any} size={24} color="white" />
                </View>
                <View style={styles.voucherInfo}>
                  <Text style={styles.voucherStoreName}>{voucher.storeName}</Text>
                  <Text style={styles.voucherDiscount}>{voucher.discount} de desconto</Text>
                  <Text style={styles.voucherDescription}>{voucher.description}</Text>
                  {activeTab === 'available' ? (
                    <>
                      <Text style={styles.voucherExpiry}>Expira em: {'expiryDate' in voucher ? voucher.expiryDate : ''}</Text>
                      <Text style={styles.voucherMinValue}>Valor mínimo: R$ {'minValue' in voucher ? voucher.minValue : ''}</Text>
                    </>
                  ) : (
                    <Text style={styles.voucherUsedDate}>Usado em: {'usedDate' in voucher ? voucher.usedDate : ''}</Text>
                  )}
                </View>
              </View>
              <View style={styles.voucherRight}>
                {activeTab === 'available' ? (
                  <TouchableOpacity style={styles.useVoucherButton}>
                    <Text style={styles.useVoucherButtonText}>Usar</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.usedBadge}>
                    <Text style={styles.usedBadgeText}>Usado</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default VouchersScreen;
