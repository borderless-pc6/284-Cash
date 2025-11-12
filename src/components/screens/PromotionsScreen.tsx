import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const PromotionsScreen = () => {
  // Categorias de promoção
  const promoCategories = [
    { id: 'all', name: 'Todas', icon: 'local-fire-department', iconType: 'MaterialIcons', count: 20 },
    { id: 'flash', name: 'Flash Sales', icon: 'flash-on', iconType: 'MaterialIcons', count: 3 },
    { id: 'partnerships', name: 'Parcerias', icon: 'card-giftcard', iconType: 'MaterialIcons', count: 5 },
    { id: 'cashback', name: 'Cashback+', icon: 'trending-up', iconType: 'MaterialIcons', count: 12 },
  ];

  // Dados das promoções
  const promotions = [
    {
      id: 1,
      storeName: 'Fashion Style',
      category: 'flash',
      badge: 'Flash Sale',
      badgeColor: '#DC2626',
      badgeIcon: 'flash-on',
      badgeIconType: 'MaterialIcons',
      title: 'Flash Sale - 50% OFF',
      subtitle: 'Fashion Style',
      description: 'Toda a coleção de verão com metade do preço',
      timeLeft: '2h 30min',
      cashback: '15%',
      cashbackAmount: '15% Cashback',
    },
    {
      id: 2,
      storeName: 'Fashion Style + Tech Store',
      category: 'partnerships',
      badge: 'Parceria',
      badgeColor: '#9333EA',
      badgeIcon: 'card-giftcard',
      badgeIconType: 'MaterialIcons',
      title: 'Parceria Especial',
      subtitle: 'Fashion Style + Tech Store',
      description: 'Compre nas duas lojas e ganhe cashback combinado',
      timeLeft: '5 dias',
      cashback: '25%',
      cashbackAmount: '25% Cashback',
    },
    {
      id: 3,
      storeName: 'Boutique Elegance',
      category: 'cashback',
      badge: 'Cashback',
      badgeColor: '#5C8FFC',
      badgeIcon: 'trending-up',
      badgeIconType: 'MaterialIcons',
      title: 'Cashback Dobrado',
      subtitle: 'Boutique Elegance',
      description: 'Ganhe cashback em dobro em toda a loja',
      timeLeft: '7 dias',
      cashback: '30%',
      cashbackAmount: '30% Cashback',
    },
    {
      id: 4,
      storeName: 'TechWorld',
      category: 'flash',
      badge: 'Flash Sale',
      badgeColor: '#DC2626',
      badgeIcon: 'flash-on',
      badgeIconType: 'MaterialIcons',
      title: 'Mega Oferta Tech',
      subtitle: 'TechWorld',
      description: 'Smartphones e eletrônicos com até 40% OFF',
      timeLeft: '1h 15min',
      cashback: '18%',
      cashbackAmount: '18% Cashback',
    },
    {
      id: 5,
      storeName: 'Restaurante Sabor',
      category: 'cashback',
      badge: 'Cashback',
      badgeColor: '#5C8FFC',
      badgeIcon: 'trending-up',
      badgeIconType: 'MaterialIcons',
      title: 'Cashback Triplo',
      subtitle: 'Restaurante Sabor',
      description: 'Coma bem e ganhe cashback triplo',
      timeLeft: '3 dias',
      cashback: '36%',
      cashbackAmount: '36% Cashback',
    },
  ];

  // Filtrar promoções baseado na categoria selecionada
  const filteredPromotions = currentPromoCategory === 'all'
    ? promotions
    : promotions.filter(p => p.category === currentPromoCategory);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.promotionsHeader}>
        <View style={styles.promotionsHeaderTop}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.promotionsHeaderContent}>
            <Text style={styles.promotionsTitle}>Promoções</Text>
            <Text style={styles.promotionsSubtitle}>Ofertas especiais para você</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.promotionsContent} showsVerticalScrollIndicator={false}>
        {/* Category Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.promoCategoriesContainer}
          contentContainerStyle={styles.promoCategoriesContent}
        >
          {promoCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.promoCategoryCard,
                currentPromoCategory === category.id && styles.promoCategoryCardActive
              ]}
              onPress={() => setCurrentPromoCategory(category.id)}
            >
              <MaterialIcons name={category.icon as any} size={24} color={currentPromoCategory === category.id ? '#5C8FFC' : '#9CA3AF'} />
              <Text style={[
                styles.promoCategoryCount,
                currentPromoCategory === category.id && styles.promoCategoryCountActive
              ]}>{category.count}</Text>
              <Text style={[
                styles.promoCategoryName,
                currentPromoCategory === category.id && styles.promoCategoryNameActive
              ]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promotions List */}
        <View style={styles.promotionsList}>
          {filteredPromotions.map((promo) => (
            <View key={promo.id} style={styles.promotionCard}>
              {/* Image Area */}
              <View style={styles.promotionImageContainer}>
                {/* Placeholder for store image */}
                <View style={styles.promotionImagePlaceholder}>
                  <MaterialIcons name="store" size={48} color="#9CA3AF" />
                </View>

                {/* Badge */}
                <View style={[
                  styles.promotionBadge,
                  { backgroundColor: promo.badgeColor }
                ]}>
                  <MaterialIcons name={promo.badgeIcon as any} size={16} color="white" />
                  <Text style={styles.promotionBadgeText}>{promo.badge}</Text>
                </View>

                {/* Title Overlay */}
                <View style={styles.promotionTitleOverlay}>
                  <Text style={styles.promotionTitle}>{promo.title}</Text>
                  <Text style={styles.promotionSubtitle}>{promo.subtitle}</Text>
                </View>

                {/* Cashback Indicator */}
                <View style={styles.promotionCashbackIndicator}>
                  <Text style={styles.promotionCashbackText}>{promo.cashbackAmount}</Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.promotionDescription}>
                <Text style={styles.promotionDescriptionText}>{promo.description}</Text>

                {/* Timer */}
                <View style={styles.promotionTimer}>
                  <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                  <Text style={styles.promotionTimerText}>Termina em {promo.timeLeft}</Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.promotionButton}>
                  <MaterialIcons name="local-offer" size={16} color="white" />
                  <Text style={styles.promotionButtonText}>Aproveitar Oferta</Text>
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

export default PromotionsScreen;
