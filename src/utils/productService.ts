// Serviço para gerenciar produtos no Firestore

import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface FirestoreProductData {
  id?: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category?: string;
  imageUrl?: string;
  stock?: number;
  isActive?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Busca um produto do Firestore por ID
 * @param productId - ID do produto
 * @returns Dados do produto ou null se não encontrado
 */
export const getProductById = async (
  productId: string
): Promise<FirestoreProductData | null> => {
  try {
    const productDocRef = doc(db, 'products', productId);
    const productDocSnap = await getDoc(productDocRef);

    if (productDocSnap.exists()) {
      const data = productDocSnap.data();
      return {
        id: productDocSnap.id,
        storeId: data.storeId || '',
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        originalPrice: data.originalPrice || undefined,
        category: data.category || '',
        imageUrl: data.imageUrl || '',
        stock: data.stock !== undefined ? data.stock : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        rating: data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar produto do Firestore:', error);
    return null;
  }
};

/**
 * Busca todos os produtos de uma loja
 * @param storeId - ID da loja
 * @param includeInactive - Se deve incluir produtos inativos (padrão: false)
 * @returns Lista de produtos
 */
export const getProductsByStore = async (
  storeId: string,
  includeInactive: boolean = false
): Promise<FirestoreProductData[]> => {
  try {
    const productsRef = collection(db, 'products');
    let q;
    
    if (includeInactive) {
      // Carregar todos os produtos (ativos e inativos)
      q = query(productsRef, where('storeId', '==', storeId));
    } else {
      // Carregar apenas produtos ativos
      q = query(productsRef, where('storeId', '==', storeId), where('isActive', '==', true));
    }
    
    const querySnapshot = await getDocs(q);

    const products: FirestoreProductData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        storeId: data.storeId || '',
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        originalPrice: data.originalPrice || undefined,
        category: data.category || '',
        imageUrl: data.imageUrl || '',
        stock: data.stock !== undefined ? data.stock : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        rating: data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      });
    });

    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos da loja:', error);
    return [];
  }
};

/**
 * Cria um novo produto no Firestore
 * @param productData - Dados do produto para criar
 * @returns ID do produto criado ou null em caso de erro
 */
export const createProduct = async (
  productData: Omit<FirestoreProductData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> => {
  try {
    const now = new Date().toISOString();
    
    // Remover campos undefined para evitar erro no Firestore
    const cleanedData: any = {
      storeId: productData.storeId,
      name: productData.name,
      price: productData.price,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      rating: productData.rating || 0,
      reviewsCount: productData.reviewsCount || 0,
      stock: productData.stock !== undefined ? productData.stock : 0,
      createdAt: now,
      updatedAt: now,
    };

    // Adicionar apenas campos que não são undefined
    if (productData.description !== undefined && productData.description !== '') {
      cleanedData.description = productData.description;
    }
    if (productData.originalPrice !== undefined && productData.originalPrice !== null) {
      cleanedData.originalPrice = productData.originalPrice;
    }
    if (productData.category !== undefined && productData.category !== '') {
      cleanedData.category = productData.category;
    }
    if (productData.imageUrl !== undefined && productData.imageUrl !== '') {
      cleanedData.imageUrl = productData.imageUrl;
    }

    console.log('Criando produto no Firestore com dados:', cleanedData);
    const docRef = await addDoc(collection(db, 'products'), cleanedData);
    console.log('Produto criado no Firestore com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return null;
  }
};

/**
 * Atualiza um produto existente no Firestore
 * @param productId - ID do produto
 * @param productData - Dados do produto para atualizar
 * @returns true se atualizado com sucesso, false caso contrário
 */
export const updateProduct = async (
  productId: string,
  productData: Partial<Omit<FirestoreProductData, 'id' | 'createdAt' | 'storeId'>>
): Promise<boolean> => {
  try {
    const productDocRef = doc(db, 'products', productId);
    
    // Remover campos undefined para evitar erro no Firestore
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Adicionar apenas campos que não são undefined
    if (productData.name !== undefined) {
      updateData.name = productData.name;
    }
    if (productData.description !== undefined) {
      updateData.description = productData.description;
    }
    if (productData.price !== undefined) {
      updateData.price = productData.price;
    }
    if (productData.originalPrice !== undefined && productData.originalPrice !== null) {
      updateData.originalPrice = productData.originalPrice;
    }
    if (productData.category !== undefined) {
      updateData.category = productData.category;
    }
    if (productData.stock !== undefined) {
      updateData.stock = productData.stock;
    }
    if (productData.isActive !== undefined) {
      updateData.isActive = productData.isActive;
    }
    if (productData.imageUrl !== undefined) {
      updateData.imageUrl = productData.imageUrl;
    }
    if (productData.rating !== undefined) {
      updateData.rating = productData.rating;
    }
    if (productData.reviewsCount !== undefined) {
      updateData.reviewsCount = productData.reviewsCount;
    }

    await updateDoc(productDocRef, updateData);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return false;
  }
};

/**
 * Deleta um produto do Firestore
 * @param productId - ID do produto
 * @returns true se deletado com sucesso, false caso contrário
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const productDocRef = doc(db, 'products', productId);
    await deleteDoc(productDocRef);
    return true;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return false;
  }
};

