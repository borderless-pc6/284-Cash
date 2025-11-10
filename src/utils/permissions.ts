// Sistema de Permissões e Grupos de Usuários

export type PermissionLevel = 'master' | 'gerente' | 'funcionario' | 'cliente' | 'lojista';

export interface StorePermission {
  storeId: string;
  storeName: string;
  permission: PermissionLevel;
  assignedAt?: string;
  assignedBy?: string;
}

export interface UserPermissions {
  permissionLevel: PermissionLevel;
  isMaster: boolean;
  storePermissions?: StorePermission[];
}

/**
 * Verifica se um usuário tem uma permissão específica
 */
export const hasPermission = (
  user: UserPermissions | null,
  storeId: string | null,
  requiredPermission: PermissionLevel
): boolean => {
  if (!user) return false;

  // Master tem acesso total
  if (user.isMaster || user.permissionLevel === 'master') {
    return true;
  }

  // Se não há loja específica, verifica permissão geral
  if (!storeId) {
    return user.permissionLevel === requiredPermission;
  }

  // Verifica permissão na loja específica
  const storePermission = user.storePermissions?.find(sp => sp.storeId === storeId);
  if (storePermission) {
    const permissionHierarchy: PermissionLevel[] = ['master', 'gerente', 'funcionario', 'lojista', 'cliente'];
    const userLevel = permissionHierarchy.indexOf(storePermission.permission);
    const requiredLevel = permissionHierarchy.indexOf(requiredPermission);
    return userLevel <= requiredLevel;
  }

  // Fallback para permissão geral
  return user.permissionLevel === requiredPermission;
};

/**
 * Verifica se o usuário é master
 */
export const isMaster = (user: UserPermissions | null): boolean => {
  return user?.isMaster === true || user?.permissionLevel === 'master';
};

/**
 * Obtém todas as lojas associadas ao usuário
 */
export const getUserStores = (user: UserPermissions | null): StorePermission[] => {
  return user?.storePermissions || [];
};

/**
 * Verifica se o usuário pode gerenciar uma loja específica
 */
export const canManageStore = (
  user: UserPermissions | null,
  storeId: string
): boolean => {
  if (!user) return false;
  
  // Master pode gerenciar qualquer loja
  if (isMaster(user)) return true;

  // Verifica se tem permissão de gerente ou master na loja
  const storePermission = user.storePermissions?.find(sp => sp.storeId === storeId);
  if (storePermission) {
    return storePermission.permission === 'gerente' || storePermission.permission === 'master';
  }

  return false;
};

/**
 * Verifica se o usuário pode editar uma loja específica
 */
export const canEditStore = (
  user: UserPermissions | null,
  storeId: string
): boolean => {
  return canManageStore(user, storeId);
};

/**
 * Verifica se o usuário pode visualizar uma loja específica
 */
export const canViewStore = (
  user: UserPermissions | null,
  storeId: string
): boolean => {
  if (!user) return false;
  
  // Master pode ver qualquer loja
  if (isMaster(user)) return true;

  // Qualquer permissão na loja permite visualização
  const storePermission = user.storePermissions?.find(sp => sp.storeId === storeId);
  return !!storePermission || user.permissionLevel === 'lojista';
};

/**
 * Obtém o nível de permissão do usuário em uma loja específica
 */
export const getStorePermissionLevel = (
  user: UserPermissions | null,
  storeId: string
): PermissionLevel | null => {
  if (!user) return null;
  
  if (isMaster(user)) return 'master';
  
  const storePermission = user.storePermissions?.find(sp => sp.storeId === storeId);
  return storePermission?.permission || null;
};

