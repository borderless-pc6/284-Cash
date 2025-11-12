import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const MyPurchasesScreen = () => {
  // Dados das compras
  const purchases = [
    {
      id: 1,
      storeName: 'TechWorld',
      date: '15/01/2025',
      amount: 299.99,
      cashback: 29.99,
      status: 'completed',
      icon: 'flash-on',
      iconType: 'MaterialIcons',
      iconBg: '#4CAF50',
    },
    {
      id: 2,
      storeName: 'Boutique Elegance',
      date: '17/01/2025',
      amount: 455.00,
      cashback: 68.25,
      status: 'completed',
      icon: '👔',
      iconBg: '#4CAF50',
    },
    {
      id: 3,
      storeName: 'Farmácia Saúde+',
      date: '14/01/2025',
      amount: 128.00,
      cashback: 12.80,
      status: 'pending',
      icon: '💊',
      iconBg: '#FFA726',
    },
    {
      id: 4,
      storeName: 'Restaurante Sabor',
      date: '13/01/2025',
      amount: 189.50,
      cashback: 18.90,
      status: 'completed',
      icon: '🍽️',
      iconBg: '#4CAF50',
    },
    {
      id: 5,
      storeName: 'Beleza & Estética',
      date: '10/01/2025',
      amount: 250.00,
      cashback: 62.50,
      status: 'completed',
      icon: '💄',
      iconBg: '#4CAF50',
    },
    {
      id: 6,
      storeName: 'Pet Shop Amigo',
      date: '08/01/2025',
      amount: 180.00,
      cashback: 27.00,
      status: 'completed',
      icon: '🐾',
      iconBg: '#4CAF50',
    },
  ];

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.purchasesHeader}>
        <View style={styles.purchasesHeaderTop}>
          <TouchableOpacity onPress={() => setProfileSubScreen(null)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.purchasesTitle}>Minhas Compras</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.purchasesContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.purchasesSummary}>
          <View style={styles.purchasesSummaryItem}>
            <Text style={styles.purchasesSummaryValue}>{purchases.length}</Text>
            <Text style={styles.purchasesSummaryLabel}>Total de Compras</Text>
          </View>
          <View style={styles.purchasesSummaryDivider} />
          <View style={styles.purchasesSummaryItem}>
            <Text style={styles.purchasesSummaryValue}>
              {formatPrice(purchases.reduce((sum, p) => sum + p.cashback, 0))}
            </Text>
            <Text style={styles.purchasesSummaryLabel}>Cashback Total</Text>
          </View>
        </View>

        {/* Purchases List */}
        <View style={styles.purchasesList}>
          <Text style={styles.purchasesListTitle}>Histórico de Compras</Text>
          {purchases.map((purchase) => (
            <TouchableOpacity key={purchase.id} style={styles.purchaseCard}>
              <View style={styles.purchaseCardLeft}>
                <View style={[styles.purchaseIcon, { backgroundColor: purchase.iconBg }]}>
                  <Text style={styles.purchaseIconText}>{purchase.icon}</Text>
                </View>
                <View style={styles.purchaseInfo}>
                  <Text style={styles.purchaseStore}>{purchase.storeName}</Text>
                  <Text style={styles.purchaseDate}>{purchase.date}</Text>
                  <TouchableOpacity style={[
                    styles.purchaseStatus,
                    purchase.status === 'completed' ? styles.purchaseStatusCompleted : styles.purchaseStatusPending
                  ]}>
                    <Text style={styles.purchaseStatusText}>
                      {purchase.status === 'completed' ? '✓ Concluída' : '⏳ Pendente'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.purchaseCardRight}>
                <Text style={styles.purchaseAmount}>{formatPrice(purchase.amount)}</Text>
                <Text style={styles.purchaseCashback}>+{formatPrice(purchase.cashback)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => {
              setCurrentScreen(item.screen);
              setProfileSubScreen(null);
            }}
          >
            <MaterialIcons
              name={item.icon as any}
              size={20}
              color={item.active ? '#5C8FFC' : '#9CA3AF'}
            />
            <Text style={[styles.navText, item.active && styles.navTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default MyPurchasesScreen;
