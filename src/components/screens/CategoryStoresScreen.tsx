import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllActiveStores } from '../../utils/storeService';
import styles from '../../styles/appStyles';

export interface CategoryStoresScreenProps {
  categoryName: string;
  categoryIcon: string;
  setCurrentScreen: (screen: string) => void;
  setSelectedStore: (store: any) => void;
  bottomNavItems: Array<{
    name: string;
    icon: string;
    screen: string;
    active: boolean;
  }>;
}

const CategoryStoresScreen: React.FC<CategoryStoresScreenProps> = ({
  categoryName,
  categoryIcon,
  setCurrentScreen,
  setSelectedStore,
  bottomNavItems,
}) => {
  const [stores, setStores] = useState<Array<{
    id: string | number;
    name: string;
    category: string;
    image: string;
    badge: string;
    badgeColor: string;
    cashback: string;
    distance: string;
    rating: string | number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar lojas da categoria
  useEffect(() => {
    const loadCategoryStores = async () => {
      try {
        setIsLoading(true);
        const allStores = await getAllActiveStores();
        
        // Mapear nomes de categorias para correspondências
        const categoryMap: { [key: string]: string[] } = {
          'vestuário': ['vestuário', 'roupa', 'moda'],
          'alimentação': ['alimentação', 'comida', 'restaurante'],
          'eletrônicos': ['eletrônicos', 'eletronicos', 'tech', 'tecnologia'],
          'farmácia': ['farmácia', 'farmacia', 'medicina'],
          'beleza': ['beleza', 'cosmético', 'cosmetico'],
          'pet shop': ['pet shop', 'pet', 'animal'],
          'academia': ['academia', 'fitness', 'ginástica'],
        };

        const categoryLower = categoryName.toLowerCase();
        const matches = categoryMap[categoryLower] || [categoryLower];

        // Filtrar e formatar lojas
        const filteredStores = allStores
          .filter((store) => {
            const storeCategory = store.category?.toLowerCase() || '';
            return matches.some(match => storeCategory.includes(match));
          })
          .slice(0, 20) // Limitar a 20 lojas
          .map((store, index) => {
            // Determinar badge baseado na posição
            let badge = 'Loja Premium';
            let badgeColor = '#5C8FFC';
            
            if (index === 0) {
              badge = 'Top da Cidade';
              badgeColor = '#5C8FFC';
            } else if (index === 1) {
              badge = 'Loja Premium';
              badgeColor = '#10B981';
            } else if (index === 2) {
              badge = 'Loja do Mês';
              badgeColor = '#F59E0B';
            }

            // Calcular cashback padrão
            const cashbackPercent = 10 + (index % 5);
            
            // Usar imagem da loja ou imagem padrão baseada na categoria
            let imageUrl = store.imageUrl;
            if (!imageUrl) {
              const categoryImages: { [key: string]: string } = {
                'Vestuário': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
                'Eletrônicos': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
                'Alimentação': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=200&fit=crop',
                'Farmácia': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=200&fit=crop',
                'Beleza': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=200&fit=crop',
                'Pet Shop': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=200&fit=crop',
                'Academia': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
              };
              imageUrl = categoryImages[store.category || ''] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop';
            }

            // Calcular rating
            const rating = 4.5 + (index % 5) * 0.1;
            
            // Distância simulada
            const distances = ['0.5 km', '1.2 km', '0.8 km', '2.1 km', '1.5 km', '3.0 km', '0.9 km', '1.8 km'];
            const distance = distances[index % distances.length];

            return {
              id: store.id || String(index),
              name: store.name || 'Loja sem nome',
              category: store.category || 'Geral',
              image: imageUrl,
              badge: badge,
              badgeColor: badgeColor,
              cashback: `${cashbackPercent}%`,
              distance: distance,
              rating: rating.toFixed(1),
              address: store.address,
              phone: store.phone,
              email: store.email,
              description: store.description,
            };
          });

        setStores(filteredStores);
      } catch (error) {
        console.error('Erro ao carregar lojas da categoria:', error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryStores();
  }, [categoryName]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={{ marginLeft: 12, flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name={categoryIcon as any} size={24} color="white" />
              <Text style={[styles.appTitle, { marginLeft: 8 }]}>{categoryName}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <MaterialIcons name="store" size={48} color="#6B7280" />
            <Text style={{ color: '#9CA3AF', marginTop: 10, fontSize: 16 }}>
              Carregando lojas...
            </Text>
          </View>
        ) : stores.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <MaterialIcons name="store" size={48} color="#6B7280" />
            <Text style={{ color: '#9CA3AF', marginTop: 10, fontSize: 16, textAlign: 'center' }}>
              Nenhuma loja encontrada nesta categoria
            </Text>
            <TouchableOpacity
              style={{ marginTop: 20, padding: 12, backgroundColor: '#5C8FFC', borderRadius: 8 }}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
                Voltar ao Início
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {stores.length} {stores.length === 1 ? 'loja encontrada' : 'lojas encontradas'}
              </Text>
            </View>

            {/* Store Cards */}
            {stores.map((store) => (
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
          </>
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

export default CategoryStoresScreen;

