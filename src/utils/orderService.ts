// Serviço para gerenciar pedidos no Firestore

import { collection, query, where, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface FirestoreOrderData {
  id?: string;
  storeId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  shippingAddress?: string;
  notes?: string;
  trackingCode?: string;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
}

/**
 * Busca todos os pedidos de uma loja
 * @param storeId - ID da loja
 * @returns Lista de pedidos
 */
export const getOrdersByStore = async (
  storeId: string
): Promise<FirestoreOrderData[]> => {
  try {
    if (!storeId) {
      return [];
    }

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('storeId', '==', storeId));
    const querySnapshot = await getDocs(q);

    const orders: FirestoreOrderData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;

      orders.push({
        id: doc.id,
        storeId: data.storeId || '',
        customerId: data.customerId || '',
        customerName: data.customerName || '',
        customerEmail: data.customerEmail || '',
        items: data.items || [],
        total: data.total || 0,
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod || '',
        shippingAddress: data.shippingAddress || '',
        notes: data.notes || '',
        trackingCode: data.trackingCode || '',
        createdAt: createdAt instanceof Timestamp 
          ? createdAt.toDate().toISOString() 
          : (typeof createdAt === 'string' ? createdAt : new Date().toISOString()),
        updatedAt: updatedAt instanceof Timestamp 
          ? updatedAt.toDate().toISOString() 
          : (typeof updatedAt === 'string' ? updatedAt : new Date().toISOString()),
      });
    });

    return orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos da loja:', error);
    return [];
  }
};

/**
 * Calcula estatísticas de pedidos
 * @param orders - Lista de pedidos
 * @returns Estatísticas calculadas
 */
export const calculateOrderStats = (orders: FirestoreOrderData[]) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Filtrar pedidos do mês atual
  const ordersThisMonth = orders.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return orderDate >= startOfMonth;
  });

  // Calcular receita total
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  // Calcular receita do mês
  const monthlyRevenue = ordersThisMonth
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  // Contar vendas (pedidos confirmados, processando, enviados ou entregues)
  const sales = orders.filter(order => 
    ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
  ).length;

  // Contar clientes únicos
  const uniqueCustomers = new Set(
    orders.map(order => order.customerId).filter(id => id)
  ).size;

  // Contar pedidos pendentes
  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'processing'].includes(order.status)
  ).length;

  return {
    totalRevenue,
    monthlyRevenue,
    totalSales: sales,
    totalOrders: orders.length,
    pendingOrders,
    uniqueCustomers,
    ordersThisMonth: ordersThisMonth.length,
  };
};

/**
 * Atualiza o status de um pedido
 * @param orderId - ID do pedido
 * @param newStatus - Novo status do pedido
 * @returns true se atualizado com sucesso, false caso contrário
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: FirestoreOrderData['status']
): Promise<boolean> => {
  try {
    if (!orderId) {
      console.error('ID do pedido não fornecido');
      return false;
    }

    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Status do pedido ${orderId} atualizado para ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return false;
  }
};

