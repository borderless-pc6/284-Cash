import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const ProfileScreen = () => {
  // Obter dados do usuário autenticado
  const user = authState.user;
  const userName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';
  const isLojista = user?.role === 'lojista' || user?.permissionLevel === 'lojista';

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
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>

          <View style={styles.profileStats}>
            {isLojista ? (
              <>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>R$ 12.450,00</Text>
                  <Text style={styles.profileStatLabel}>Receita Total</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>156</Text>
                  <Text style={styles.profileStatLabel}>Vendas</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>42</Text>
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
                  <Text style={styles.merchantStatValue}>R$ 2.340,00</Text>
                  <Text style={styles.merchantStatLabel}>Este Mês</Text>
                </View>
                <View style={styles.merchantStatCard}>
                  <MaterialIcons name="people" size={24} color="#5C8FFC" />
                  <Text style={styles.merchantStatValue}>89</Text>
                  <Text style={styles.merchantStatLabel}>Clientes</Text>
                </View>
                <View style={styles.merchantStatCard}>
                  <MaterialIcons name="star" size={24} color="#FFD700" />
                  <Text style={styles.merchantStatValue}>4.8</Text>
                  <Text style={styles.merchantStatLabel}>Avaliação</Text>
                </View>
                <View style={styles.merchantStatCard}>
                  <MaterialIcons name="shopping-cart" size={24} color="#DC2626" />
                  <Text style={styles.merchantStatValue}>12</Text>
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
