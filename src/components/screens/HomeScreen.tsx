import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/appStyles';

export interface HomeScreenProps {
  searchText: string;
  setSearchText: (text: string) => void;
  setCurrentScreen: (screen: string) => void;
  handleLogout: () => void;
  categories: Array<{ name: string; icon: string }>;
  featuredStores: Array<{
    id: string | number;
    name: string;
    category: string;
    image: string;
    badge: string;
    badgeColor: string;
    cashback: string;
    distance: string;
    rating: string | number;
  }>;
  bottomNavItems: Array<{
    name: string;
    icon: string;
    screen: string;
    active: boolean;
  }>;
  setSelectedStore: (store: any) => void;
  setSelectedCategory: (category: { name: string; icon: string } | null) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  searchText,
  setSearchText,
  setCurrentScreen,
  handleLogout,
  categories,
  featuredStores,
  bottomNavItems,
  setSelectedStore,
  setSelectedCategory,
}) => {
  const handleCategoryPress = (category: { name: string; icon: string }) => {
    if (category.name === 'Mais') {
      // Se for "Mais", não fazer nada
      return;
    }
    // Navegar para a tela de categoria
    setSelectedCategory(category);
    setCurrentScreen('category-stores');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>ILocash</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="place" size={18} color="white" />
              <Text style={styles.locationText}>São Paulo, SP</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>R$ 127,50</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={18} color="white" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lojas ou produtos..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category)}
              >
                <MaterialIcons 
                  name={category.icon as any} 
                  size={24} 
                  color="white" 
                />
                <Text style={styles.categoryName}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clube ILocash Banner */}
        <View style={styles.clubBanner}>
          <View style={styles.clubContent}>
            <MaterialIcons name="star" size={32} color="#60A5FA" />
            <Text style={styles.clubTitle}>Clube ILocash</Text>
            <Text style={styles.clubDescription}>Compre cashback e economize ainda mais!</Text>
            <TouchableOpacity style={styles.clubButton}>
              <Text style={styles.clubButtonText}>Conhecer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promoções Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoBannerContent}>
            <View style={styles.promoBannerLeft}>
              <MaterialIcons name="local-fire-department" size={32} color="white" />
              <View style={styles.promoBannerText}>
                <Text style={styles.promoBannerTitle}>Promoções</Text>
                <Text style={styles.promoBannerSubtitle}>Ofertas especiais para você</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.promoBannerButton}
              onPress={() => setCurrentScreen('promotions')}
            >
              <Text style={styles.promoBannerButtonText}>Ver ofertas</Text>
              <Text style={styles.promoBannerButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Stores Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lojas em Destaque</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('ranking')}>
              <Text style={styles.seeRankingLink}>Ver ranking</Text>
            </TouchableOpacity>
          </View>

          {/* Store Cards */}
          {featuredStores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeCard}
              onPress={() => {
                setSelectedStore(store);
                setCurrentScreen('store-detail');
              }}
            >
              <View style={styles.storeImageContainer}>
                <Image source={{ uri: store.image }} style={styles.storeImage} />

                {/* Badges */}
                <View style={styles.storeBadges}>
                  <View style={[styles.badge, { backgroundColor: store.badgeColor }]}>
                    <Text style={styles.badgeText}>{store.badge}</Text>
                  </View>
                  <View style={[styles.cashbackBadge, { backgroundColor: '#1E293B' }]}>
                    <Text style={styles.cashbackText}>{store.cashback} cashback</Text>
                  </View>
                </View>
              </View>

              {/* Store Info */}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeCategory}>{store.category}</Text>

                <View style={styles.storeDetails}>
                  <View style={styles.storeDetailItem}>
                    <MaterialIcons name="place" size={14} color="white" />
                    <Text style={styles.detailText}>{store.distance}</Text>
                  </View>
                  <View style={styles.storeDetailItem}>
                    <MaterialIcons name="star" size={14} color="white" />
                    <Text style={styles.detailText}>{store.rating}</Text>
                  </View>
                </View>
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

export default HomeScreen;
