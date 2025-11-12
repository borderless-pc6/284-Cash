import { PermissionLevel, StorePermission } from '../utils/permissions';

export type UserRole = 'cliente' | 'lojista';
export type Gender = 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-informar';

export interface User {
  id: string;
  email: string;
  cpf: string;
  name: string;
  role: UserRole;
  permissionLevel: PermissionLevel;
  storePermissions?: StorePermission[];
  isMaster?: boolean;
  birthDate?: string;
  gender?: Gender;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface Store {
  id: string;
  name: string;
  ownerId?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  authScreen: 'login' | 'register' | 'register-client' | 'register-merchant';
}

