import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthState } from '../../types';
import { FirestoreStoreData } from '../../utils/storeService';
import { FirestoreProductData } from '../../utils/productService';
import { getOrdersByStore, calculateOrderStats } from '../../utils/orderService';
import styles from '../../styles/appStyles';

interface ProfileScreenProps {
  authState: AuthState;
  setCurrentScreen: (screen: string) => void;
  setProfileSubScreen: (screen: string | null) => void;
  userStore: FirestoreStoreData | null;
  userProducts: FirestoreProductData[];
  handleLogout: () => void;
  bottomNavItems: Array<{
    name: string;
    icon: string;
    iconType: string;
    active: boolean;
    screen: string;
  }>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  authState,
  setCurrentScreen,
  setProfileSubScreen,
  userStore,
  userProducts,
  handleLogout,
  bottomNavItems,
}) => {
  // Obter dados do usuário autenticado
  const user = authState.user;
  const userName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';
  const isLojista = user?.role === 'lojista' || user?.permissionLevel === 'lojista';

  // Estados para estatísticas
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    uniqueCustomers: 0,
  });

  // Calcular média de avaliações dos produtos
  const productsWithRating = userProducts.filter(p => p.rating && typeof p.rating === 'number');
  const averageRating = productsWithRating.length > 0
    ? productsWithRating.reduce((sum, p) => sum + (p.rating || 0), 0) / productsWithRating.length
    : 0;

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Carregar pedidos e calcular estatísticas
  useEffect(() => {
    const loadOrdersAndStats = async () => {
      if (!isLojista || !userStore?.id) {
        setStats({
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalSales: 0,
          totalOrders: 0,
          pendingOrders: 0,
          uniqueCustomers: 0,
        });
        return;
      }

      try {
        setIsLoadingStats(true);
        const storeOrders = await getOrdersByStore(userStore.id);
        setOrders(storeOrders);
        const calculatedStats = calculateOrderStats(storeOrders);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadOrdersAndStats();
  }, [isLojista, userStore?.id]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.profileHeader}>
        <View style={styles.profileHeaderTop}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>{isLojista ? 'Minha Loja' : 'Meu Perfil'}</Text>
          <TouchableOpacity>
            <MaterialIcons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileInfoSection}>
          <View style={styles.profileAvatar}>
            <MaterialIcons name={isLojista ? "store" : "person"} size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.profileName}>
            {isLojista && userStore?.name ? userStore.name : userName}
          </Text>
          <Text style={styles.profileEmail}>
            {isLojista && userStore?.email ? userStore.email : userEmail}
          </Text>

          <View style={styles.profileStats}>
            {isLojista ? (
              <>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>
                    {formatCurrency(stats.totalRevenue)}
                  </Text>
                  <Text style={styles.profileStatLabel}>Receita Total</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>{stats.totalSales}</Text>
                  <Text style={styles.profileStatLabel}>Vendas</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>{userProducts.length}</Text>
                  <Text style={styles.profileStatLabel}>Produtos</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>R$ 245,80</Text>
                  <Text style={styles.profileStatLabel}>Cashback Total</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>32</Text>
                  <Text style={styles.profileStatLabel}>Compras</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        {isLojista ? (
          <>
            {/* Dashboard Stats for Lojista */}
            <View style={styles.achievementsCard}>
              <View style={styles.achievementsHeader}>
                <MaterialIcons name="dashboard" size={24} color="#5C8FFC" />
                <Text style={styles.achievementsTitle}>Dashboard</Text>
              </View>
              <View style={styles.merchantStatsGrid}>
                <View style={styles.merchantStatCard}>
                  <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
                  <Text style={styles.merchantStatValue}>
                    {formatCurrency(stats.monthlyRevenue)}
                  </Text>
                  <Text style={styles.merchantStatLabel}>Este Mês</Text>
                </View>
                <View style={styles.merchantStatCard}>
                  <MaterialIcons name="people" size={24} color="#5C8FFC" />
                  <Text style={styles.merchantStatValue}>{stats.uniqueCustomers}</Text>
                  <Text style={styles.merchantStatLabel}>Clientes</Text>
                </View>
                <View style={styles.merchantStatCard}>
                  <MaterialIcons name="star" size={24} color="#FFD700" />
                  <Text style={styles.merchantStatValue}>
                    {isNaN(averageRating) || averageRating === 0 ? '0.0' : averageRating.toFixed(1)}
                  </Text>
                  <Text style={styles.merchantStatLabel}>Avaliação</Text>
                </View>
                <View style={styles.merchantStatCard}>
                  <MaterialIcons name="shopping-cart" size={24} color="#DC2626" />
                  <Text style={styles.merchantStatValue}>{stats.totalOrders}</Text>
                  <Text style={styles.merchantStatLabel}>Pedidos</Text>
                </View>
              </View>
            </View>

            {/* Main Menu Section for Lojista */}
            <View style={styles.menuCard}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setProfileSubScreen('manage-store')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="store" size={20} color="white" />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Gerenciar Loja</Text>
                    <Text style={styles.menuItemSubtitle}>
                      {userStore ? 'Editar informações da loja' : 'Criar sua loja'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setProfileSubScreen('products')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="inventory" size={20} color="white" />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Meus Produtos</Text>
                    <Text style={styles.menuItemSubtitle}>
                      {userProducts.length} {userProducts.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setProfileSubScreen('orders')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="receipt" size={20} color="white" />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Pedidos</Text>
                    <Text style={styles.menuItemSubtitle}>Gerenciar pedidos recebidos</Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setProfileSubScreen('reports')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="analytics" size={20} color="white" />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Relatórios</Text>
                    <Text style={styles.menuItemSubtitle}>Vendas e estatísticas</Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="account-balance-wallet" size={20} color="white" />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Financeiro</Text>
                    <Text style={styles.menuItemSubtitle}>Extrato e pagamentos</Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Achievements Section for Cliente */}
            <View style={styles.achievementsCard}>
              <View style={styles.achievementsHeader}>
                <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
                <Text style={styles.achievementsTitle}>Conquistas</Text>
              </View>
              <View style={styles.achievementsButtons}>
                <TouchableOpacity style={styles.achievementButton}>
                  <MaterialIcons name="star" size={24} color="#FFD700" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.achievementButton}>
                  <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.achievementButton}>
                  <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Menu Section for Cliente */}
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="account-balance-wallet" size={20} color="white" />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Minha Carteira</Text>
                    <Text style={styles.menuItemSubtitle}>R$ 245,80 disponível</Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => setProfileSubScreen('purchases')}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="shopping-bag" size={20} color="white" />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Minhas Compras</Text>
                    <Text style={styles.menuItemSubtitle}>Histórico completo</Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                    <MaterialIcons name="notifications" size={20} color="white" />
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>3</Text>
                    </View>
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>Notificações</Text>
                    <Text style={styles.menuItemSubtitle}>3 novas ofertas</Text>
                  </View>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Settings & Logout Section */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                <MaterialIcons name="settings" size={20} color="white" />
              </View>
              <Text style={styles.menuItemTitle}>Configurações</Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: '#DC2626' }]}>
                <MaterialIcons name="logout" size={20} color="white" />
              </View>
              <Text style={[styles.menuItemTitle, { color: '#DC2626' }]}>Sair</Text>
            </View>
          </TouchableOpacity>
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

export default ProfileScreen;
