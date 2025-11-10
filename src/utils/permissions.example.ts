/**
 * EXEMPLO DE USO DO SISTEMA DE PERMISSÕES E GRUPOS
 * 
 * Este arquivo demonstra como usar o sistema de permissões implementado.
 * Para usar no código, importe as funções de './permissions'
 */

import {
  PermissionLevel,
  StorePermission,
  hasPermission,
  isMaster,
  getUserStores,
  canManageStore,
  canEditStore,
  canViewStore,
  getStorePermissionLevel
} from './permissions';

// Exemplo de estrutura de usuário com permissões
const exemploUsuario = {
  id: 'user123',
  email: 'gerente@loja.com',
  name: 'João Silva',
  permissionLevel: 'gerente' as PermissionLevel,
  isMaster: false,
  storePermissions: [
    {
      storeId: 'store1',
      storeName: 'Loja Central',
      permission: 'gerente' as PermissionLevel,
      assignedAt: '2024-01-01',
      assignedBy: 'admin123'
    },
    {
      storeId: 'store2',
      storeName: 'Loja Filial',
      permission: 'funcionario' as PermissionLevel,
      assignedAt: '2024-01-15',
      assignedBy: 'admin123'
    }
  ]
};

// Exemplo de usuário Master
const exemploMaster = {
  id: 'master123',
  email: 'admin@sistema.com',
  name: 'Administrador',
  permissionLevel: 'master' as PermissionLevel,
  isMaster: true,
  storePermissions: []
};

// Exemplos de uso:

// 1. Verificar se usuário tem permissão master
if (isMaster(exemploMaster)) {
  console.log('Usuário é master - tem acesso total');
}

// 2. Verificar se usuário pode gerenciar uma loja específica
if (canManageStore(exemploUsuario, 'store1')) {
  console.log('Usuário pode gerenciar a Loja Central');
}

// 3. Verificar se usuário tem permissão específica em uma loja
if (hasPermission(exemploUsuario, 'store1', 'gerente')) {
  console.log('Usuário tem permissão de gerente na Loja Central');
}

// 4. Obter todas as lojas do usuário
const lojasDoUsuario = getUserStores(exemploUsuario);
console.log('Lojas do usuário:', lojasDoUsuario);

// 5. Obter nível de permissão em uma loja específica
const nivelPermissao = getStorePermissionLevel(exemploUsuario, 'store1');
console.log('Nível de permissão:', nivelPermissao); // 'gerente'

// 6. Verificar se pode editar uma loja
if (canEditStore(exemploUsuario, 'store1')) {
  console.log('Usuário pode editar a Loja Central');
}

// 7. Verificar se pode visualizar uma loja
if (canViewStore(exemploUsuario, 'store2')) {
  console.log('Usuário pode visualizar a Loja Filial');
}

/**
 * HIERARQUIA DE PERMISSÕES:
 * 
 * master > gerente > funcionario > lojista > cliente
 * 
 * - master: Acesso total ao sistema, pode gerenciar tudo
 * - gerente: Pode gerenciar uma loja específica (editar, adicionar produtos, etc.)
 * - funcionario: Pode visualizar e realizar operações básicas em uma loja
 * - lojista: Dono de loja, pode gerenciar sua própria loja
 * - cliente: Apenas visualização e compras
 */

