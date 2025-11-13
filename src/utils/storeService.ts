// Serviço para gerenciar lojas no Firestore

import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface FirestoreStoreData {
  id?: string;
  name: string;
  ownerId: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Busca uma loja do Firestore por ID
 * @param storeId - ID da loja
 * @returns Dados da loja ou null se não encontrada
 */
export const getStoreById = async (
  storeId: string
): Promise<FirestoreStoreData | null> => {
  try {
    const storeDocRef = doc(db, 'stores', storeId);
    const storeDocSnap = await getDoc(storeDocRef);

    if (storeDocSnap.exists()) {
      const data = storeDocSnap.data();
      return {
        id: storeDocSnap.id,
        name: data.name || '',
        ownerId: data.ownerId || '',
        category: data.category || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar loja do Firestore:', error);
    return null;
  }
};

/**
 * Busca todas as lojas de um proprietário
 * @param ownerId - ID do proprietário
 * @returns Lista de lojas
 */
export const getStoresByOwner = async (
  ownerId: string
): Promise<FirestoreStoreData[]> => {
  try {
    if (!ownerId || ownerId.trim() === '') {
      console.error('Erro: ownerId é obrigatório para buscar lojas');
      return [];
    }

    const storesRef = collection(db, 'stores');
    const normalizedOwnerId = String(ownerId).trim();
    console.log('Buscando lojas para ownerId:', normalizedOwnerId);
    
    const q = query(storesRef, where('ownerId', '==', normalizedOwnerId));
    const querySnapshot = await getDocs(q);

    const stores: FirestoreStoreData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stores.push({
        id: doc.id,
        name: data.name || '',
        ownerId: data.ownerId || '',
        category: data.category || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      });
    });

    console.log(`Encontradas ${stores.length} loja(s) para ownerId: ${normalizedOwnerId}`);
    return stores;
  } catch (error) {
    console.error('Erro ao buscar lojas do proprietário:', error);
    return [];
  }
};

/**
 * Busca todas as lojas ativas
 * @returns Lista de lojas ativas
 */
export const getAllActiveStores = async (): Promise<FirestoreStoreData[]> => {
  try {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    const stores: FirestoreStoreData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stores.push({
        id: doc.id,
        name: data.name || '',
        ownerId: data.ownerId || '',
        category: data.category || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      });
    });

    return stores;
  } catch (error) {
    console.error('Erro ao buscar lojas ativas:', error);
    return [];
  }
};

/**
 * Cria uma nova loja no Firestore
 * @param storeData - Dados da loja para criar
 * @returns ID da loja criada ou null em caso de erro
 */
export const createStore = async (
  storeData: Omit<FirestoreStoreData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> => {
  try {
    // Validar ownerId
    if (!storeData.ownerId || storeData.ownerId.trim() === '') {
      console.error('Erro: ownerId é obrigatório e não pode estar vazio');
      return null;
    }

    const now = new Date().toISOString();
    
    // Remover campos undefined para evitar erro no Firestore
    const cleanedData: any = {
      name: storeData.name,
      ownerId: String(storeData.ownerId).trim(), // Garantir que seja string e remover espaços
      isActive: storeData.isActive !== undefined ? storeData.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    console.log('Criando loja no Firestore com dados:', cleanedData);

    // Adicionar apenas campos que não são undefined
    if (storeData.category !== undefined && storeData.category !== '') {
      cleanedData.category = storeData.category;
    }
    if (storeData.address !== undefined && storeData.address !== '') {
      cleanedData.address = storeData.address;
    }
    if (storeData.phone !== undefined && storeData.phone !== '') {
      cleanedData.phone = storeData.phone;
    }
    if (storeData.email !== undefined && storeData.email !== '') {
      cleanedData.email = storeData.email;
    }
    if (storeData.description !== undefined && storeData.description !== '') {
      cleanedData.description = storeData.description;
    }
    if (storeData.imageUrl !== undefined && storeData.imageUrl !== '') {
      cleanedData.imageUrl = storeData.imageUrl;
    }

    const docRef = await addDoc(collection(db, 'stores'), cleanedData);
    console.log('Loja criada no Firestore com ID:', docRef.id, 'ownerId:', cleanedData.ownerId);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar loja no Firestore:', error);
    return null;
  }
};

/**
 * Atualiza uma loja existente no Firestore
 * @param storeId - ID da loja
 * @param storeData - Dados da loja para atualizar
 * @returns true se atualizado com sucesso, false caso contrário
 */
export const updateStore = async (
  storeId: string,
  storeData: Partial<Omit<FirestoreStoreData, 'id' | 'createdAt' | 'ownerId'>>
): Promise<boolean> => {
  try {
    const storeDocRef = doc(db, 'stores', storeId);
    
    // Remover campos undefined para evitar erro no Firestore
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Adicionar apenas campos que não são undefined
    if (storeData.name !== undefined) {
      updateData.name = storeData.name;
    }
    if (storeData.category !== undefined) {
      updateData.category = storeData.category;
    }
    if (storeData.address !== undefined) {
      updateData.address = storeData.address;
    }
    if (storeData.phone !== undefined) {
      updateData.phone = storeData.phone;
    }
    if (storeData.email !== undefined) {
      updateData.email = storeData.email;
    }
    if (storeData.description !== undefined) {
      updateData.description = storeData.description;
    }
    if (storeData.imageUrl !== undefined) {
      updateData.imageUrl = storeData.imageUrl;
    }
    if (storeData.isActive !== undefined) {
      updateData.isActive = storeData.isActive;
    }

    await updateDoc(storeDocRef, updateData);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    return false;
  }
};

/**
 * Deleta uma loja do Firestore
 * @param storeId - ID da loja
 * @returns true se deletado com sucesso, false caso contrário
 */
export const deleteStore = async (storeId: string): Promise<boolean> => {
  try {
    const storeDocRef = doc(db, 'stores', storeId);
    await deleteDoc(storeDocRef);
    return true;
  } catch (error) {
    console.error('Erro ao deletar loja:', error);
    return false;
  }
};

