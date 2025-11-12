import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const RankingScreen = () => {
  const [selectedTab, setSelectedTab] = useState('sales');

  // Selecionar dados baseado no filtro ativo
  const currentRankingStores = selectedTab === 'sales' ? salesRankingStores : cashbackRankingStores;
  const top3Stores = currentRankingStores.filter(store => store.isTop3);

  // Título dinâmico baseado no filtro
  const getTop3Title = () => {
    return selectedTab === 'sales' ? 'Top 3 do Mês' : 'Top 3 Cashback';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.rankingHeader}>
        <View style={styles.rankingHeaderTop}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.rankingHeaderContent}>
            <Text style={styles.rankingTitle}>Rankings</Text>
            <Text style={styles.rankingSubtitle}>Descubra as lojas mais populares e com melhores cashbacks</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.rankingTabs}>
          <TouchableOpacity
            style={[styles.rankingTab, selectedTab === 'sales' && styles.rankingTabActive]}
            onPress={() => setSelectedTab('sales')}
          >
            <Text style={[styles.rankingTabText, selectedTab === 'sales' && styles.rankingTabTextActive]}>
              Mais Vendas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rankingTab, selectedTab === 'cashback' && styles.rankingTabActive]}
            onPress={() => setSelectedTab('cashback')}
          >
            <Text style={[styles.rankingTabText, selectedTab === 'cashback' && styles.rankingTabTextActive]}>
              Maior Cashback
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.rankingContent} showsVerticalScrollIndicator={false}>
        {/* Top 3 Section */}
        <View style={styles.top3Section}>
          <View style={styles.top3Header}>
            <MaterialIcons name="workspace-premium" size={24} color="#FFD700" />
            <Text style={styles.top3Title}>{getTop3Title()}</Text>
          </View>

          <View style={styles.top3Container}>
            {/* 2nd Place */}
            <View style={styles.top3Item}>
              <View style={styles.top3Medal}>
                <MaterialIcons name="workspace-premium" size={20} color="#C0C0C0" />
              </View>
              <View style={[styles.top3Logo, { backgroundColor: top3Stores[1].logoBg }]}>
                <MaterialIcons name={top3Stores[1].logo as any} size={24} color="white" />
              </View>
              <Text style={styles.top3StoreName}>{top3Stores[1].name}</Text>
              <Text style={styles.top3Sales}>
                {selectedTab === 'sales' ? `${top3Stores[1].sales} vendas` : `${top3Stores[1].cashback} cashback`}
              </Text>
            </View>

            {/* 1st Place */}
            <View style={styles.top3Item}>
              <View style={styles.top3Crown}>
                <MaterialIcons name="workspace-premium" size={24} color="#FFD700" />
              </View>
              <View style={[styles.top3Logo, styles.top3LogoFirst, { backgroundColor: top3Stores[0].logoBg }]}>
                <MaterialIcons name={top3Stores[0].logo as any} size={24} color="white" />
              </View>
              <View style={styles.top3Badge}>
                <Text style={styles.top3BadgeText}>
                  {selectedTab === 'sales' ? 'Loja do Mês' : 'Melhor Cashback'}
                </Text>
              </View>
              <Text style={styles.top3StoreName}>{top3Stores[0].name}</Text>
              <Text style={styles.top3Sales}>
                {selectedTab === 'sales' ? `${top3Stores[0].sales} vendas` : `${top3Stores[0].cashback} cashback`}
              </Text>
            </View>

            {/* 3rd Place */}
            <View style={styles.top3Item}>
              <View style={styles.top3Medal}>
                <MaterialIcons name="workspace-premium" size={20} color="#CD7F32" />
              </View>
              <View style={[styles.top3Logo, { backgroundColor: top3Stores[2].logoBg }]}>
                <MaterialIcons name={top3Stores[2].logo as any} size={24} color="white" />
              </View>
              <Text style={styles.top3StoreName}>{top3Stores[2].name}</Text>
              <Text style={styles.top3Sales}>
                {selectedTab === 'sales' ? `${top3Stores[2].sales} vendas` : `${top3Stores[2].cashback} cashback`}
              </Text>
            </View>
          </View>
        </View>

        {/* Ranking List */}
        <View style={styles.rankingList}>
          {currentRankingStores.map((store) => (
            <TouchableOpacity key={store.id} style={styles.rankingItem}>
              <View style={styles.rankingItemLeft}>
                {store.position <= 3 ? (
                  store.position === 1 ? (
                    <MaterialIcons name="workspace-premium" size={20} color="#FFD700" />
                  ) : store.position === 2 ? (
                    <MaterialIcons name="workspace-premium" size={20} color="#C0C0C0" />
                  ) : (
                    <MaterialIcons name="workspace-premium" size={20} color="#CD7F32" />
                  )
                ) : (
                  <Text style={styles.rankingPosition}>#{store.position}</Text>
                )}

                <View style={[styles.rankingItemLogo, { backgroundColor: store.logoBg }]}>
                  <MaterialIcons name={store.logo as any} size={18} color="white" />
                </View>

                <View style={styles.rankingItemInfo}>
                  <Text style={styles.rankingItemName}>{store.name}</Text>
                  <Text style={styles.rankingItemCategory}>{store.category}</Text>
                  <Text style={styles.rankingItemSales}>
                    {selectedTab === 'sales' ? `${store.sales} vendas` : `${store.cashback} cashback`}
                  </Text>
                  <View style={styles.rankingItemRating}>
                    <Text style={styles.rankingItemRatingText}>{store.rating}</Text>
                    <MaterialIcons name="star" size={12} color="#FFD700" />
                  </View>
                </View>
              </View>

              <View style={styles.rankingCashback}>
                <Text style={styles.rankingCashbackPercent}>
                  {selectedTab === 'sales' ? store.cashback : `${store.sales}`}
                </Text>
                <Text style={styles.rankingCashbackText}>
                  {selectedTab === 'sales' ? 'cashback' : 'vendas'}
                </Text>
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

export default RankingScreen;
