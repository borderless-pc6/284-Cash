import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { FirestoreStoreData } from '../../utils/storeService';
import { getOrdersByStore, updateOrderStatus, FirestoreOrderData } from '../../utils/orderService';
import styles from '../../styles/appStyles';

interface OrdersScreenProps {
  setProfileSubScreen: (screen: string | null) => void;
  userStore: FirestoreStoreData | null;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({
  setProfileSubScreen,
  userStore,
}) => {
  const [orders, setOrders] = useState<FirestoreOrderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Carregar pedidos do Firebase
  useEffect(() => {
    const loadOrders = async () => {
      if (!userStore?.id) {
        setOrders([]);
        return;
      }

      try {
        setIsLoading(true);
        const storeOrders = await getOrdersByStore(userStore.id);
        // Ordenar por data de criação (mais recentes primeiro)
        storeOrders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setOrders(storeOrders);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [userStore?.id]);
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

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Data não disponível';
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Data inválida';

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

  // Gerar número do pedido a partir do ID
  const getOrderNumber = (orderId: string | undefined, createdAt: string | Date | undefined): string => {
    if (!orderId) return '#ORD-N/A';
    
    // Usar os últimos 6 caracteres do ID para criar um número único
    const shortId = orderId.slice(-6).toUpperCase();
    const year = createdAt 
      ? (typeof createdAt === 'string' ? new Date(createdAt) : createdAt).getFullYear()
      : new Date().getFullYear();
    
    return `#ORD-${year}-${shortId}`;
  };

  const handleGoBack = useCallback(() => {
    setProfileSubScreen(null);
  }, [setProfileSubScreen]);

  const handleUpdateStatus = async (orderId: string | undefined, newStatus: FirestoreOrderData['status']) => {
    if (!orderId) {
      Alert.alert('Erro', 'ID do pedido não encontrado.');
      return;
    }

    Alert.alert(
      'Atualizar Status',
      `Deseja atualizar o status do pedido para "${getStatusLabel(newStatus)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const success = await updateOrderStatus(orderId, newStatus);
              if (success) {
                // Atualizar o estado local
                setOrders(prevOrders =>
                  prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                  )
                );
                Alert.alert('Sucesso', 'Status atualizado com sucesso!');
              } else {
                Alert.alert('Erro', 'Não foi possível atualizar o status do pedido.');
              }
            } catch (error) {
              console.error('Erro ao atualizar status:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao atualizar o status.');
            }
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
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="hourglass-empty" size={64} color="#6B7280" />
              <Text style={styles.emptyText}>Carregando pedidos...</Text>
            </View>
          ) : filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt" size={64} color="#6B7280" />
              <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderCardHeaderLeft}>
                    <Text style={styles.orderNumber}>{getOrderNumber(order.id, order.createdAt)}</Text>
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

                {(order.customerName || order.customerEmail) && (
                  <View style={styles.orderCustomerInfo}>
                    <MaterialIcons name="person" size={16} color="#9CA3AF" />
                    <Text style={styles.orderCustomerName}>
                      {order.customerName || order.customerEmail || 'Cliente não identificado'}
                    </Text>
                  </View>
                )}

                <View style={styles.orderItemsContainer}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <View key={index} style={styles.orderItem}>
                        <View style={styles.orderItemLeft}>
                          <Text style={styles.orderItemName}>
                            {item.quantity}x {item.name || 'Produto sem nome'}
                          </Text>
                          {item.size && (
                            <Text style={styles.orderItemSize}>Tamanho: {item.size}</Text>
                          )}
                        </View>
                        <Text style={styles.orderItemPrice}>
                          R$ {(item.quantity * (item.price || 0)).toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.orderItemName}>Nenhum item encontrado</Text>
                  )}
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
                  {order.paymentMethod && (
                    <View style={styles.orderPaymentInfo}>
                      <MaterialIcons 
                        name={order.paymentMethod === 'PIX' ? 'account-balance-wallet' : 'credit-card'} 
                        size={16} 
                        color="#9CA3AF" 
                      />
                      <Text style={styles.orderPaymentText}>{order.paymentMethod}</Text>
                    </View>
                  )}
                  <Text style={styles.orderTotal}>
                    Total: R$ {(order.total || 0).toFixed(2).replace('.', ',')}
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
