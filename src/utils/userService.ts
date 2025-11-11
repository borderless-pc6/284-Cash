// Serviço para buscar dados do usuário do Firestore

import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { PermissionLevel, StorePermission } from './permissions';

export interface FirestoreUserData {
  id?: string;
  email: string;
  password?: string; // Senha (deve ser hash em produção)
  cpf?: string;
  name?: string;
  role?: 'cliente' | 'lojista';
  permissionLevel?: PermissionLevel;
  isMaster?: boolean;
  storePermissions?: StorePermission[];
  birthDate?: string;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-informar';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Busca os dados do usuário do Firestore por ID
 * @param userId - ID do usuário
 * @returns Dados do usuário ou null se não encontrado
 */
export const getUserDataFromFirestore = async (
  userId: string
): Promise<FirestoreUserData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        id: userDocSnap.id,
        email: data.email || '',
        cpf: data.cpf || '',
        name: data.name || '',
        role: data.role || 'cliente',
        permissionLevel: data.permissionLevel || 'cliente',
        isMaster: data.isMaster || false,
        storePermissions: data.storePermissions || [],
        birthDate: data.birthDate || '',
        gender: data.gender || 'prefiro-nao-informar',
        address: data.address || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário do Firestore:', error);
    return null;
  }
};

/**
 * Busca usuário por email no Firestore
 * @param email - Email do usuário
 * @returns Dados do usuário ou null se não encontrado
 */
export const getUserByEmail = async (
  email: string
): Promise<FirestoreUserData | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        password: data.password || '',
        cpf: data.cpf || '',
        name: data.name || '',
        role: data.role || 'cliente',
        permissionLevel: data.permissionLevel || 'cliente',
        isMaster: data.isMaster || false,
        storePermissions: data.storePermissions || [],
        birthDate: data.birthDate || '',
        gender: data.gender || 'prefiro-nao-informar',
        address: data.address || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    return null;
  }
};

/**
 * Realiza login usando email e senha do Firestore
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @returns Dados do usuário ou null se credenciais inválidas
 */
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<FirestoreUserData | null> => {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return null;
    }

    // Verificar senha
    // NOTA: Em produção, a senha deve ser armazenada como hash (ex: bcrypt)
    // Por enquanto, comparação direta (NÃO SEGURO PARA PRODUÇÃO)
    if (user.password !== password) {
      return null;
    }

    // Retornar dados sem a senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;
  }
};

/**
 * Cria um novo usuário no Firestore
 * @param userData - Dados do usuário para criar
 * @returns ID do usuário criado ou null em caso de erro
 */
export const createUser = async (
  userData: Omit<FirestoreUserData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> => {
  try {
    // Verificar se o email já existe
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('Este e-mail já está em uso');
    }

    const now = new Date().toISOString();
    const newUserData = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      createdAt: now,
      updatedAt: now,
      permissionLevel: userData.permissionLevel || 'cliente',
      isMaster: userData.isMaster || false,
      storePermissions: userData.storePermissions || [],
    };

    // Criar documento na coleção 'users'
    const docRef = await addDoc(collection(db, 'users'), newUserData);
    return docRef.id;
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

