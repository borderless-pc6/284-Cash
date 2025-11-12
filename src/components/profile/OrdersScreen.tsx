import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

  const OrdersScreen = () => {
  // Dados mockados de pedidos de produtos físicos
  const [orders] = useState([
    {
      id: '1',
      orderNumber: '#ORD-2024-001',
      customerName: 'João Silva',
      customerEmail: 'joao@email.com',
      shippingAddress: 'Rua das Flores, 123 - São Paulo, SP',
      items: [
        { name: 'Camiseta Básica Preta', quantity: 2, price: 99.90, size: 'M' },
        { name: 'Tênis Esportivo', quantity: 1, price: 299.90, size: '42' },
      ],
      total: 499.70,
      status: 'pending', // pending, confirmed, processing, shipped, delivered, cancelled
      paymentMethod: 'PIX',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      notes: 'Entregar na portaria',
    },
    {
      id: '2',
      orderNumber: '#ORD-2024-002',
      customerName: 'Maria Santos',
      customerEmail: 'maria@email.com',
      shippingAddress: 'Av. Paulista, 1000 - São Paulo, SP',
      items: [
        { name: 'Vestido Floral', quantity: 1, price: 199.90, size: 'P' },
      ],
      total: 199.90,
      status: 'confirmed',
      paymentMethod: 'Cartão',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
      notes: '',
    },
    {
      id: '3',
      orderNumber: '#ORD-2024-003',
      customerName: 'Pedro Oliveira',
      customerEmail: 'pedro@email.com',
      shippingAddress: 'Rua Augusta, 500 - São Paulo, SP',
      items: [
        { name: 'Calça Jeans', quantity: 2, price: 249.90, size: 'G' },
      ],
      total: 499.80,
      status: 'processing',
      paymentMethod: 'PIX',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
      notes: 'Cliente preferiu retirar na loja',
    },
    {
      id: '4',
      orderNumber: '#ORD-2024-004',
      customerName: 'Ana Costa',
      customerEmail: 'ana@email.com',
      shippingAddress: 'Rua Consolação, 200 - São Paulo, SP',
      items: [
        { name: 'Blusa de Moletom', quantity: 1, price: 149.90, size: 'M' },
        { name: 'Shorts Esportivo', quantity: 1, price: 89.90, size: 'M' },
      ],
      total: 239.80,
      status: 'shipped',
      paymentMethod: 'Cartão',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      trackingCode: 'BR123456789BR',
      notes: '',
    },
    {
      id: '5',
      orderNumber: '#ORD-2024-005',
      customerName: 'Carlos Mendes',
      customerEmail: 'carlos@email.com',
      shippingAddress: 'Av. Faria Lima, 1500 - São Paulo, SP',
      items: [
        { name: 'Tênis Casual', quantity: 1, price: 399.90, size: '43' },
      ],
      total: 399.90,
      status: 'delivered',
      paymentMethod: 'PIX',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
      notes: '',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const filteredOrders = filterStatus 
    ? orders.filter(order => order.status === filterStatus)
    : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'processing': return '#8B5CF6';
      case 'shipped': return '#10B981';
      case 'delivered': return '#059669';
      case 'cancelled': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando Pagamento';
      case 'confirmed': return 'Confirmado';
      case 'processing': return 'Em Separação';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle';
      case 'processing': return 'inventory';
      case 'shipped': return 'local-shipping';
      case 'delivered': return 'done-all';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    } else {
      return 'Agora';
    }
  };

  const handleGoBack = useCallback(() => {
    setProfileSubScreen(null);
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    Alert.alert(
      'Atualizar Status',
      `Deseja atualizar o status do pedido para "${getStatusLabel(newStatus)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            Alert.alert('Sucesso', 'Status atualizado! (Mockado)');
          },
        },
      ]
    );
  };

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

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
          <Text style={styles.profileTitle}>Pedidos</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        {/* Estatísticas rápidas */}
        <View style={styles.ordersStatsContainer}>
          <View style={styles.ordersStatCard}>
            <MaterialIcons name="schedule" size={20} color="#F59E0B" />
            <Text style={styles.ordersStatValue}>{statusCounts.pending}</Text>
            <Text style={styles.ordersStatLabel}>Aguardando</Text>
          </View>
          <View style={styles.ordersStatCard}>
            <MaterialIcons name="inventory" size={20} color="#8B5CF6" />
            <Text style={styles.ordersStatValue}>{statusCounts.processing}</Text>
            <Text style={styles.ordersStatLabel}>Em Separação</Text>
          </View>
          <View style={styles.ordersStatCard}>
            <MaterialIcons name="local-shipping" size={20} color="#10B981" />
            <Text style={styles.ordersStatValue}>{statusCounts.shipped}</Text>
            <Text style={styles.ordersStatLabel}>Enviados</Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.ordersFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ordersFilters}>
            <TouchableOpacity
              style={[styles.ordersFilterButton, !filterStatus && styles.ordersFilterButtonActive]}
              onPress={() => setFilterStatus(null)}
            >
              <Text style={[styles.ordersFilterText, !filterStatus && styles.ordersFilterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ordersFilterButton, filterStatus === 'pending' && styles.ordersFilterButtonActive]}
              onPress={() => setFilterStatus('pending')}
            >
              <Text style={[styles.ordersFilterText, filterStatus === 'pending' && styles.ordersFilterTextActive]}>
                Pendentes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ordersFilterButton, filterStatus === 'confirmed' && styles.ordersFilterButtonActive]}
              onPress={() => setFilterStatus('confirmed')}
            >
              <Text style={[styles.ordersFilterText, filterStatus === 'confirmed' && styles.ordersFilterTextActive]}>
                Confirmados
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ordersFilterButton, filterStatus === 'processing' && styles.ordersFilterButtonActive]}
              onPress={() => setFilterStatus('processing')}
            >
              <Text style={[styles.ordersFilterText, filterStatus === 'processing' && styles.ordersFilterTextActive]}>
                Em Separação
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ordersFilterButton, filterStatus === 'shipped' && styles.ordersFilterButtonActive]}
              onPress={() => setFilterStatus('shipped')}
            >
              <Text style={[styles.ordersFilterText, filterStatus === 'shipped' && styles.ordersFilterTextActive]}>
                Enviados
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Lista de pedidos */}
        <View style={styles.ordersList}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt" size={64} color="#6B7280" />
              <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderCardHeaderLeft}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <MaterialIcons 
                      name={getStatusIcon(order.status) as any} 
                      size={14} 
                      color={getStatusColor(order.status)} 
                    />
                    <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderCustomerInfo}>
                  <MaterialIcons name="person" size={16} color="#9CA3AF" />
                  <Text style={styles.orderCustomerName}>{order.customerName}</Text>
                </View>

                <View style={styles.orderItemsContainer}>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <View style={styles.orderItemLeft}>
                        <Text style={styles.orderItemName}>
                          {item.quantity}x {item.name}
                        </Text>
                        {item.size && (
                          <Text style={styles.orderItemSize}>Tamanho: {item.size}</Text>
                        )}
                      </View>
                      <Text style={styles.orderItemPrice}>
                        R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  ))}
                </View>

                {order.shippingAddress && (
                  <View style={styles.orderShippingAddress}>
                    <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
                    <Text style={styles.orderShippingAddressText}>{order.shippingAddress}</Text>
                  </View>
                )}

                {order.trackingCode && (
                  <View style={styles.orderTracking}>
                    <MaterialIcons name="local-shipping" size={16} color="#5C8FFC" />
                    <Text style={styles.orderTrackingLabel}>Código de Rastreamento:</Text>
                    <Text style={styles.orderTrackingCode}>{order.trackingCode}</Text>
                  </View>
                )}

                {order.notes && (
                  <View style={styles.orderNotes}>
                    <MaterialIcons name="note" size={14} color="#9CA3AF" />
                    <Text style={styles.orderNotesText}>{order.notes}</Text>
                  </View>
                )}

                <View style={styles.orderFooter}>
                  <View style={styles.orderPaymentInfo}>
                    <MaterialIcons 
                      name={order.paymentMethod === 'PIX' ? 'account-balance-wallet' : 'credit-card'} 
                      size={16} 
                      color="#9CA3AF" 
                    />
                    <Text style={styles.orderPaymentText}>{order.paymentMethod}</Text>
                  </View>
                  <Text style={styles.orderTotal}>
                    Total: R$ {order.total.toFixed(2).replace('.', ',')}
                  </Text>
                </View>

                {/* Botões de ação */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <View style={styles.orderActions}>
                    {order.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.orderActionButton, { backgroundColor: '#3B82F6' }]}
                        onPress={() => handleUpdateStatus(order.id, 'confirmed')}
                      >
                        <MaterialIcons name="check" size={16} color="white" />
                        <Text style={styles.orderActionButtonText}>Confirmar Pagamento</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'confirmed' && (
                      <TouchableOpacity
                        style={[styles.orderActionButton, { backgroundColor: '#8B5CF6' }]}
                        onPress={() => handleUpdateStatus(order.id, 'processing')}
                      >
                        <MaterialIcons name="inventory" size={16} color="white" />
                        <Text style={styles.orderActionButtonText}>Iniciar Separação</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'processing' && (
                      <TouchableOpacity
                        style={[styles.orderActionButton, { backgroundColor: '#10B981' }]}
                        onPress={() => handleUpdateStatus(order.id, 'shipped')}
                      >
                        <MaterialIcons name="local-shipping" size={16} color="white" />
                        <Text style={styles.orderActionButtonText}>Marcar como Enviado</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'shipped' && (
                      <TouchableOpacity
                        style={[styles.orderActionButton, { backgroundColor: '#059669' }]}
                        onPress={() => handleUpdateStatus(order.id, 'delivered')}
                      >
                        <MaterialIcons name="done-all" size={16} color="white" />
                        <Text style={styles.orderActionButtonText}>Marcar como Entregue</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;
