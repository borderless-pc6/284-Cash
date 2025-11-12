import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const WalletScreen = () => {
  // Dados das transações do histórico
  const transactions = [
    {
      id: 1,
      storeName: 'Boutique Elegance',
      date: '17/01/2025',
      amount: 45.50,
      type: 'received',
      expiresIn: 43,
      icon: 'checkroom',
      iconType: 'MaterialIcons',
      iconBg: '#4CAF50',
      iconColor: '#2E7D32',
    },
    {
      id: 2,
      storeName: 'TechWorld',
      date: '16/01/2025',
      amount: 30.00,
      type: 'used',
      expiresIn: null,
      icon: 'flash-on',
      iconType: 'MaterialIcons',
      iconBg: '#FFCDD2',
      iconColor: '#D32F2F',
    },
    {
      id: 3,
      storeName: 'Farmácia Saúde+',
      date: '14/01/2025',
      amount: 12.80,
      type: 'received',
      expiresIn: 41,
      icon: 'local-pharmacy',
      iconType: 'MaterialIcons',
      iconBg: '#4CAF50',
      iconColor: '#2E7D32',
    },
    {
      id: 4,
      storeName: 'Restaurante Sabor',
      date: '13/01/2025',
      amount: 18.90,
      type: 'received',
      expiresIn: 40,
      icon: 'restaurant',
      iconType: 'MaterialIcons',
      iconBg: '#4CAF50',
      iconColor: '#2E7D32',
    },
    {
      id: 5,
      storeName: 'Clube iLocash',
      date: '09/01/2025',
      amount: 50.00,
      type: 'purchased',
      expiresIn: 36,
      icon: 'card-giftcard',
      iconType: 'MaterialIcons',
      iconBg: '#2196F3',
      iconColor: '#1976D2',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.walletHeader}>
        <View style={styles.walletHeaderTop}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.walletTitle}>Minha Carteira</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.walletContent} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total em Cashback</Text>
          <Text style={styles.balanceAmount}>R$ 127,50</Text>
          <Text style={styles.balanceExpiry}>Expira em até 45 dias</Text>

          {/* Action Buttons */}
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={styles.buyCashbackButton}
              onPress={() => setWalletSubScreen('buy')}
            >
              <MaterialIcons name="card-giftcard" size={16} color="white" />
              <Text style={styles.buyCashbackText}>Comprar Cashback</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewVouchersButton}
              onPress={() => setWalletSubScreen('vouchers')}
            >
              <Text style={styles.viewVouchersText}>Ver Vouchers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>R$ 247</Text>
            <Text style={styles.statLabel}>Ganho Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>R$ 119</Text>
            <Text style={styles.statLabel}>Usado</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Transações</Text>
          </View>
        </View>

        {/* Cashback Distribution */}
        <View style={styles.distributionSection}>
          <Text style={styles.distributionTitle}>Distribuição de Cashback</Text>
          <View style={styles.distributionItem}>
            <View style={styles.distributionLeft}>
              <View style={styles.distributionDotFree} />
              <Text style={styles.distributionText}>Livre (todas as lojas)</Text>
            </View>
            <Text style={styles.distributionAmount}>R$ 85,00</Text>
          </View>
          <View style={styles.distributionItem}>
            <View style={styles.distributionLeft}>
              <View style={styles.distributionDotSpecific} />
              <Text style={styles.distributionText}>Lojas específicas</Text>
            </View>
            <Text style={styles.distributionAmount}>R$ 42,50</Text>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Histórico</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBg }]}>
                  <MaterialIcons name={transaction.icon as any} size={24} color="white" />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionStore}>{transaction.storeName}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                  {transaction.expiresIn && (
                    <View style={styles.transactionExpiry}>
                      <MaterialIcons name="access-time" size={14} color="#9CA3AF" />
                      <Text style={styles.expiryText}>Expira em {transaction.expiresIn} dias</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'used' ? styles.transactionAmountUsed : styles.transactionAmountReceived
                ]}>
                  {transaction.type === 'used' ? `R$ ${transaction.amount.toFixed(2).replace('.', ',')}` : `+R$ ${transaction.amount.toFixed(2).replace('.', ',')}`}
                </Text>
                <TouchableOpacity style={[
                  styles.transactionStatus,
                  transaction.type === 'purchased' ? styles.transactionStatusPurchased : styles.transactionStatusDefault
                ]}>
                  <Text style={styles.transactionStatusText}>
                    {transaction.type === 'received' ? 'Recebido' :
                      transaction.type === 'used' ? 'Usado' : 'Comprado'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => setCurrentScreen(item.screen)}
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

export default WalletScreen;
