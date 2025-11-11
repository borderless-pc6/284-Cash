// Serviço para gerenciar sessão do usuário

const SESSION_KEY = 'user_session_id';

/**
 * Salva o ID do usuário na sessão
 * @param userId - ID do usuário
 */
export const saveSession = (userId: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SESSION_KEY, userId);
    } else if (typeof global !== 'undefined') {
      // Para React Native, você pode usar AsyncStorage aqui
      // Por enquanto, apenas armazena em memória
      (global as any).__userSessionId = userId;
    }
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
  }
};

/**
 * Obtém o ID do usuário da sessão
 * @returns ID do usuário ou null se não houver sessão
 */
export const getSession = (): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(SESSION_KEY);
    } else if (typeof global !== 'undefined') {
      return (global as any).__userSessionId || null;
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
};

/**
 * Remove a sessão do usuário
 */
export const clearSession = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(SESSION_KEY);
    } else if (typeof global !== 'undefined') {
      delete (global as any).__userSessionId;
    }
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
};

