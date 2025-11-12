import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const CompareScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedProduct, setSearchedProduct] = useState('iPhone 15 Pro 256GB');

  const handleSearch = () => {
    if (searchText.trim()) {
      setSearchedProduct(searchText);
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.compareHeader}>
        <View style={styles.compareHeaderTop}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.compareHeaderContent}>
            <Text style={styles.compareTitle}>Comparar Preços</Text>
            <Text style={styles.compareSubtitle}>Use IA para encontrar o melhor preço com cashback</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.compareContent} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} color="white" />
            <TextInput
              style={styles.compareSearchInput}
              placeholder="Digite o nome do produto..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="camera-alt" size={18} color="white" />
              <Text style={styles.actionButtonText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="file-upload" size={18} color="white" />
              <Text style={styles.actionButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          {/* AI Smart Search Box */}
          <View style={styles.aiSearchBox}>
            <MaterialIcons name="auto-awesome" size={20} color="#60A5FA" />
            <View style={styles.aiSearchContent}>
              <Text style={styles.aiSearchTitle}>Busca Inteligente com IA</Text>
              <Text style={styles.aiSearchDescription}>
                Tire uma foto ou faça upload de um print do produto. Nossa IA encontra as melhores ofertas para você!
              </Text>
            </View>
          </View>
        </View>

        {/* Results Section */}
        {searchedProduct && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Resultados para:</Text>
              <Text style={styles.resultsProduct}>{searchedProduct}</Text>
            </View>

            {/* Store Cards */}
            {compareResults.map((result) => (
              <View key={result.id} style={styles.compareCard}>
                {/* Card Header */}
                <View style={styles.compareCardHeader}>
                  {result.isBestOffer && (
                    <View style={styles.bestOfferBadge}>
                      <Text style={styles.bestOfferText}>Melhor Oferta</Text>
                    </View>
                  )}
                  <View style={styles.compareCardHeaderRight}>
                    <Text style={styles.compareCashbackBadge}>{result.cashback} cashback</Text>
                  </View>
                </View>

                {/* Store Info */}
                <View style={styles.compareStoreInfo}>
                  <Text style={styles.compareStoreName}>{result.storeName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.compareStoreDetails}>
                      {result.distance}{' '}
                    </Text>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.compareStoreDetails}>
                      {' '}{result.rating}
                    </Text>
                  </View>
                </View>

                {/* Price Details */}
                <View style={styles.priceDetails}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Preço original:</Text>
                    <Text style={styles.priceValue}>{formatPrice(result.originalPrice)}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Cashback:</Text>
                    <Text style={styles.cashbackValue}>-{formatPrice(result.cashbackAmount)}</Text>
                  </View>
                </View>

                {/* Separator */}
                <View style={styles.priceSeparator} />

                {/* Final Price */}
                <View style={styles.finalPriceRow}>
                  <Text style={styles.finalPriceLabel}>Preço final:</Text>
                  <Text style={styles.finalPriceValue}>{formatPrice(result.finalPrice)}</Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.viewStoreButton}>
                  <Text style={styles.viewStoreButtonText}>Ver na Loja</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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

export default CompareScreen;
