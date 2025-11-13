import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/appStyles';

interface ReportsScreenProps {
  setProfileSubScreen: (screen: string | null) => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({
  setProfileSubScreen,
}) => {
  // Dados mockados
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const stats = {
    today: {
      revenue: 1250.50,
      orders: 8,
      averageTicket: 156.31,
      growth: 12.5,
    },
    week: {
      revenue: 8450.30,
      orders: 52,
      averageTicket: 162.51,
      growth: 8.3,
    },
    month: {
      revenue: 34200.80,
      orders: 198,
      averageTicket: 172.73,
      growth: 15.2,
    },
    year: {
      revenue: 285600.00,
      orders: 1650,
      averageTicket: 173.27,
      growth: 22.1,
    },
  };

  const currentStats = stats[selectedPeriod];

  const topProducts = [
    { name: 'Produto Exemplo 1', sales: 45, revenue: 4495.50 },
    { name: 'Produto Exemplo 2', sales: 32, revenue: 6396.80 },
    { name: 'Produto Premium', sales: 18, revenue: 3598.20 },
  ];

  const handleGoBack = useCallback(() => {
    setProfileSubScreen(null);
  }, [setProfileSubScreen]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.profileHeader}>
        <View style={styles.profileHeaderTop}>
          <TouchableOpacity 
            onPress={handleGoBack}
            style={{ zIndex: 1000, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>Relatórios</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        {/* Seletor de período */}
        <View style={styles.reportsPeriodSelector}>
          <TouchableOpacity
            style={[styles.reportsPeriodButton, selectedPeriod === 'today' && styles.reportsPeriodButtonActive]}
            onPress={() => setSelectedPeriod('today')}
          >
            <Text style={[styles.reportsPeriodText, selectedPeriod === 'today' && styles.reportsPeriodTextActive]}>
              Hoje
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reportsPeriodButton, selectedPeriod === 'week' && styles.reportsPeriodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.reportsPeriodText, selectedPeriod === 'week' && styles.reportsPeriodTextActive]}>
              Semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reportsPeriodButton, selectedPeriod === 'month' && styles.reportsPeriodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.reportsPeriodText, selectedPeriod === 'month' && styles.reportsPeriodTextActive]}>
              Mês
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reportsPeriodButton, selectedPeriod === 'year' && styles.reportsPeriodButtonActive]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={[styles.reportsPeriodText, selectedPeriod === 'year' && styles.reportsPeriodTextActive]}>
              Ano
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cards de estatísticas principais */}
        <View style={styles.reportsStatsGrid}>
          <View style={styles.reportsStatCard}>
            <View style={styles.reportsStatHeader}>
              <MaterialIcons name="attach-money" size={24} color="#10B981" />
              <View style={[styles.reportsGrowthBadge, { backgroundColor: '#10B98120' }]}>
                <MaterialIcons name="trending-up" size={12} color="#10B981" />
                <Text style={[styles.reportsGrowthText, { color: '#10B981' }]}>
                  +{currentStats.growth}%
                </Text>
              </View>
            </View>
            <Text style={styles.reportsStatValue}>
              R$ {currentStats.revenue.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.reportsStatLabel}>Receita Total</Text>
          </View>

          <View style={styles.reportsStatCard}>
            <View style={styles.reportsStatHeader}>
              <MaterialIcons name="receipt" size={24} color="#5C8FFC" />
            </View>
            <Text style={styles.reportsStatValue}>{currentStats.orders}</Text>
            <Text style={styles.reportsStatLabel}>Pedidos</Text>
          </View>

          <View style={styles.reportsStatCard}>
            <View style={styles.reportsStatHeader}>
              <MaterialIcons name="shopping-cart" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.reportsStatValue}>
              R$ {currentStats.averageTicket.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.reportsStatLabel}>Ticket Médio</Text>
          </View>
        </View>

        {/* Gráfico de vendas (simulado) */}
        <View style={styles.reportsChartCard}>
          <View style={styles.reportsChartHeader}>
            <Text style={styles.reportsChartTitle}>Vendas por Dia</Text>
            <MaterialIcons name="bar-chart" size={20} color="#5C8FFC" />
          </View>
          <View style={styles.reportsChartPlaceholder}>
            <MaterialIcons name="show-chart" size={48} color="#3A3A3A" />
            <Text style={styles.reportsChartPlaceholderText}>
              Gráfico de vendas (Mockado)
            </Text>
          </View>
        </View>

        {/* Top produtos */}
        <View style={styles.reportsTopProductsCard}>
          <View style={styles.reportsTopProductsHeader}>
            <MaterialIcons name="star" size={24} color="#FBBF24" />
            <Text style={styles.reportsTopProductsTitle}>Produtos Mais Vendidos</Text>
          </View>
          {topProducts.map((product, index) => (
            <View key={index} style={styles.reportsTopProductItem}>
              <View style={styles.reportsTopProductLeft}>
                <View style={styles.reportsTopProductRank}>
                  <Text style={styles.reportsTopProductRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.reportsTopProductInfo}>
                  <Text style={styles.reportsTopProductName}>{product.name}</Text>
                  <Text style={styles.reportsTopProductSales}>
                    {product.sales} {product.sales === 1 ? 'venda' : 'vendas'}
                  </Text>
                </View>
              </View>
              <Text style={styles.reportsTopProductRevenue}>
                R$ {product.revenue.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>

        {/* Resumo de pagamentos */}
        <View style={styles.reportsPaymentCard}>
          <View style={styles.reportsPaymentHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#8B5CF6" />
            <Text style={styles.reportsPaymentTitle}>Métodos de Pagamento</Text>
          </View>
          <View style={styles.reportsPaymentItem}>
            <View style={styles.reportsPaymentMethod}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#10B981" />
              <Text style={styles.reportsPaymentMethodText}>PIX</Text>
            </View>
            <Text style={styles.reportsPaymentValue}>
              R$ {(currentStats.revenue * 0.65).toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.reportsPaymentPercent}>65%</Text>
          </View>
          <View style={styles.reportsPaymentItem}>
            <View style={styles.reportsPaymentMethod}>
              <MaterialIcons name="credit-card" size={20} color="#5C8FFC" />
              <Text style={styles.reportsPaymentMethodText}>Cartão</Text>
            </View>
            <Text style={styles.reportsPaymentValue}>
              R$ {(currentStats.revenue * 0.35).toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.reportsPaymentPercent}>35%</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;
