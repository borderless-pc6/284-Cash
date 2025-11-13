import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
// @ts-ignore - @expo/vector-icons is available through expo
import { MaterialIcons } from '@expo/vector-icons';
import {
  PermissionLevel,
  StorePermission,
  hasPermission as checkPermission,
  isMaster as checkIsMaster,
  getUserStores as getStores,
  canManageStore,
  canEditStore,
  canViewStore,
  getStorePermissionLevel
} from './src/utils/permissions';
import {
  getUserDataFromFirestore,
  loginWithEmailAndPassword,
  createUser
} from './src/utils/userService';
import { getSession, saveSession, clearSession } from './src/utils/sessionService';
import {
  getStoreById,
  getStoresByOwner,
  createStore,
  updateStore,
  FirestoreStoreData
} from './src/utils/storeService';
import {
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
  FirestoreProductData
} from './src/utils/productService';

// Importar tipos e utilitários
import { User, Store, AuthState, UserRole, Gender } from './src/types';
import { formatCPF, formatZipCode, formatDate } from './src/utils/formatters';
import styles from './src/styles/appStyles';

// Importar componentes
import LoginScreen from './src/components/auth/LoginScreen';
import RegisterClientScreen from './src/components/auth/RegisterClientScreen';
import RegisterMerchantScreen from './src/components/auth/RegisterMerchantScreen';
import HomeScreen from './src/components/screens/HomeScreen';
import ProfileScreen from './src/components/profile/ProfileScreen';
import StoreDetailScreen from './src/components/store/StoreDetailScreen';
import StoreProductsScreen from './src/components/store/StoreProductsScreen';
import ProductDetailScreen from './src/components/store/ProductDetailScreen';
import CheckoutScreen from './src/components/store/CheckoutScreen';
import RegisterRoleScreen from './src/components/screens/RegisterRoleScreen';
import RankingScreen from './src/components/screens/RankingScreen';
import CompareScreen from './src/components/screens/CompareScreen';
import BuyCashbackScreen from './src/components/screens/BuyCashbackScreen';
import VouchersScreen from './src/components/screens/VouchersScreen';
import WalletScreen from './src/components/screens/WalletScreen';
import PromotionsScreen from './src/components/screens/PromotionsScreen';
import MyPurchasesScreen from './src/components/screens/MyPurchasesScreen';
import ManageStoreScreen from './src/components/profile/ManageStoreScreen';
import ManageProductsScreen from './src/components/profile/ManageProductsScreen';
import AddEditProductScreen from './src/components/profile/AddEditProductScreen';
import OrdersScreen from './src/components/profile/OrdersScreen';
import ReportsScreen from './src/components/profile/ReportsScreen';

// Helper function to render icon
const renderIcon = (icon: string, iconType: string = 'MaterialIcons', size: number = 24, color: string = 'white') => {
  if (iconType === 'MaterialIcons') {
    return <MaterialIcons name={icon as any} size={size} color={color} />;
  }
  return <Text>{icon}</Text>;
};

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    authScreen: 'login',
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [walletSubScreen, setWalletSubScreen] = useState<string | null>(null);
  const [profileSubScreen, setProfileSubScreen] = useState<string | null>(null);
  const [currentPromoCategory, setCurrentPromoCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [storeSubScreen, setStoreSubScreen] = useState<string | null>(null);

  // Estados para gerenciamento de loja e produtos
  const [userStore, setUserStore] = useState<FirestoreStoreData | null>(null);
  const [userProducts, setUserProducts] = useState<FirestoreProductData[]>([]);
  const [editingProduct, setEditingProduct] = useState<FirestoreProductData | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Estados para autenticação
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para registro
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerCpf, setRegisterCpf] = useState('');
  const [registerBirthDate, setRegisterBirthDate] = useState('');
  const [registerGender, setRegisterGender] = useState<Gender>('prefiro-nao-informar');
  const [registerStreet, setRegisterStreet] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [registerComplement, setRegisterComplement] = useState('');
  const [registerNeighborhood, setRegisterNeighborhood] = useState('');
  const [registerCity, setRegisterCity] = useState('');
  const [registerState, setRegisterState] = useState('');
  const [registerZipCode, setRegisterZipCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Memoizar handlers para evitar re-renderizações desnecessárias
  const handleLoginEmailChange = useCallback((text: string) => {
    setLoginEmail(text);
  }, []);

  const handleLoginPasswordChange = useCallback((text: string) => {
    setLoginPassword(text);
  }, []);

  const handleRegisterEmailChange = useCallback((text: string) => {
    setRegisterEmail(text);
  }, []);

  const handleRegisterPasswordChange = useCallback((text: string) => {
    setRegisterPassword(text);
  }, []);

  const handleRegisterConfirmPasswordChange = useCallback((text: string) => {
    setRegisterConfirmPassword(text);
  }, []);

  const handleRegisterNameChange = useCallback((text: string) => {
    setRegisterName(text);
  }, []);

  const handleRegisterCpfChange = useCallback((text: string) => {
    const formatted = formatCPF(text);
    if (formatted.replace(/[^\d]/g, '').length <= 11) {
      setRegisterCpf(formatted);
    }
  }, []);

  const handleRegisterBirthDateChange = useCallback((text: string) => {
    const formatted = formatDate(text);
    if (formatted.replace(/[^\d]/g, '').length <= 8) {
      setRegisterBirthDate(formatted);
    }
  }, []);

  const handleRegisterGenderChange = useCallback((gender: Gender) => {
    setRegisterGender(gender);
  }, []);

  const handleRegisterStreetChange = useCallback((text: string) => {
    setRegisterStreet(text);
  }, []);

  const handleRegisterNumberChange = useCallback((text: string) => {
    setRegisterNumber(text);
  }, []);

  const handleRegisterComplementChange = useCallback((text: string) => {
    setRegisterComplement(text);
  }, []);

  const handleRegisterNeighborhoodChange = useCallback((text: string) => {
    setRegisterNeighborhood(text);
  }, []);

  const handleRegisterCityChange = useCallback((text: string) => {
    setRegisterCity(text);
  }, []);

  const handleRegisterStateChange = useCallback((text: string) => {
    setRegisterState(text.toUpperCase().slice(0, 2));
  }, []);

  const handleRegisterZipCodeChange = useCallback((text: string) => {
    const formatted = formatZipCode(text);
    if (formatted.replace(/[^\d]/g, '').length <= 8) {
      setRegisterZipCode(formatted);
    }
  }, []);

  // Funções de validação
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  // Funções de verificação de permissões (wrappers para usar com authState.user)
  const hasPermission = useCallback((storeId: string | null, requiredPermission: PermissionLevel): boolean => {
    if (!authState.user) return false;
    return checkPermission(
      {
        permissionLevel: authState.user.permissionLevel,
        isMaster: authState.user.isMaster || false,
        storePermissions: authState.user.storePermissions || []
      },
      storeId,
      requiredPermission
    );
  }, [authState.user]);

  const isMasterUser = useCallback((): boolean => {
    if (!authState.user) return false;
    return checkIsMaster({
      permissionLevel: authState.user.permissionLevel,
      isMaster: authState.user.isMaster || false,
      storePermissions: authState.user.storePermissions || []
    });
  }, [authState.user]);

  const getUserStores = useCallback((): StorePermission[] => {
    if (!authState.user) return [];
    return getStores({
      permissionLevel: authState.user.permissionLevel,
      isMaster: authState.user.isMaster || false,
      storePermissions: authState.user.storePermissions || []
    });
  }, [authState.user]);

  const canManageStoreById = useCallback((storeId: string): boolean => {
    if (!authState.user) return false;
    return canManageStore(
      {
        permissionLevel: authState.user.permissionLevel,
        isMaster: authState.user.isMaster || false,
        storePermissions: authState.user.storePermissions || []
      },
      storeId
    );
  }, [authState.user]);

  const canEditStoreById = useCallback((storeId: string): boolean => {
    if (!authState.user) return false;
    return canEditStore(
      {
        permissionLevel: authState.user.permissionLevel,
        isMaster: authState.user.isMaster || false,
        storePermissions: authState.user.storePermissions || []
      },
      storeId
    );
  }, [authState.user]);

  const canViewStoreById = useCallback((storeId: string): boolean => {
    if (!authState.user) return false;
    return canViewStore(
      {
        permissionLevel: authState.user.permissionLevel,
        isMaster: authState.user.isMaster || false,
        storePermissions: authState.user.storePermissions || []
      },
      storeId
    );
  }, [authState.user]);

  const getStorePermissionLevelById = useCallback((storeId: string): PermissionLevel | null => {
    if (!authState.user) return null;
    return getStorePermissionLevel(
      {
        permissionLevel: authState.user.permissionLevel,
        isMaster: authState.user.isMaster || false,
        storePermissions: authState.user.storePermissions || []
      },
      storeId
    );
  }, [authState.user]);

  // Verificar sessão do usuário ao carregar o app
  useEffect(() => {
    const checkSession = async () => {
      setIsLoadingAuth(true);

      try {
        const userId = getSession();

        if (userId) {
          // Buscar dados do usuário do Firestore
          const firestoreData = await getUserDataFromFirestore(userId);

          if (firestoreData && firestoreData.id) {
            const user: User = {
              id: firestoreData.id,
              email: firestoreData.email || '',
              cpf: firestoreData.cpf || '',
              name: firestoreData.name || '',
              role: firestoreData.role || 'cliente',
              permissionLevel: firestoreData.permissionLevel || 'cliente',
              isMaster: firestoreData.isMaster || false,
              storePermissions: firestoreData.storePermissions || [],
              birthDate: firestoreData.birthDate,
              gender: firestoreData.gender,
              address: firestoreData.address,
            };

            setAuthState({
              isLoggedIn: true,
              user: user,
              authScreen: 'login',
            });
          } else {
            // Sessão inválida, limpar
            clearSession();
            setAuthState({
              isLoggedIn: false,
              user: null,
              authScreen: 'login',
            });
          }
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            authScreen: 'login',
          });
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        clearSession();
        setAuthState({
          isLoggedIn: false,
          user: null,
          authScreen: 'login',
        });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkSession();
  }, []);

  // Carregar loja do usuário quando ele fizer login ou quando o ID do usuário mudar
  useEffect(() => {
    if (authState.isLoggedIn && authState.user?.id) {
      console.log('Usuário autenticado, carregando loja...');
      loadUserStore();
    } else {
      setUserStore(null);
    }
  }, [authState.isLoggedIn, authState.user?.id, loadUserStore]);

  const handleBackToRegister = useCallback(() => {
    setAuthState({ ...authState, authScreen: 'register' });
  }, [authState]);

  const handleBackToLogin = useCallback(() => {
    setAuthState({ ...authState, authScreen: 'login' });
  }, [authState]);

  // Função para carregar a loja do usuário
  const loadUserStore = useCallback(async () => {
    if (!authState.user?.id) {
      console.log('loadUserStore: Usuário não autenticado ou sem ID');
      setUserStore(null);
      return;
    }

    try {
      setIsLoadingStore(true);
      console.log('Carregando lojas para usuário ID:', authState.user.id);
      const stores = await getStoresByOwner(authState.user.id);
      console.log('Lojas encontradas:', stores.length, stores);
      
      if (stores && stores.length > 0) {
        setUserStore(stores[0]);
        console.log('Loja carregada:', stores[0].id, stores[0].name);
      } else {
        console.log('Nenhuma loja encontrada para o usuário');
        setUserStore(null);
      }
    } catch (error) {
      console.error('Erro ao carregar loja do usuário:', error);
      setUserStore(null);
    } finally {
      setIsLoadingStore(false);
    }
  }, [authState.user?.id]);

  // Função para carregar os produtos do usuário (incluindo inativos)
  const loadUserProducts = useCallback(async () => {
    if (!userStore?.id) {
      setUserProducts([]);
      return;
    }

    try {
      setIsLoadingProducts(true);
      // Carregar todos os produtos, incluindo inativos (para gerenciamento)
      const products = await getProductsByStore(userStore.id, true);
      setUserProducts(products || []);
      console.log('Produtos carregados do Firestore:', products.length);
    } catch (error) {
      console.error('Erro ao carregar produtos do usuário:', error);
      setUserProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [userStore?.id]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            try {
              clearSession();
              setLoginEmail('');
              setLoginPassword('');
              setAuthState({
                isLoggedIn: false,
                user: null,
                authScreen: 'login',
              });
            } catch (error: any) {
              Alert.alert('Erro', 'Erro ao fazer logout: ' + (error.message || 'Erro desconhecido'));
            }
          },
        },
      ]
    );
  };

  const handleLogin = useCallback(async () => {
    if (!loginEmail.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail');
      return;
    }
    if (!loginPassword.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a senha');
      return;
    }

    // Validação de e-mail
    const isValidEmail = validateEmail(loginEmail);
    if (!isValidEmail) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return;
    }

    try {
      const userData = await loginWithEmailAndPassword(loginEmail, loginPassword);

      if (!userData || !userData.id) {
        Alert.alert('Erro', 'E-mail ou senha incorretos');
        return;
      }

      // Salvar sessão
      saveSession(userData.id);

      // Criar objeto User
      const user: User = {
        id: userData.id,
        email: userData.email || '',
        cpf: userData.cpf || '',
        name: userData.name || '',
        role: userData.role || 'cliente',
        permissionLevel: userData.permissionLevel || 'cliente',
        isMaster: userData.isMaster || false,
        storePermissions: userData.storePermissions || [],
        birthDate: userData.birthDate,
        gender: userData.gender,
        address: userData.address,
      };

      // Atualizar estado
      setAuthState({
        isLoggedIn: true,
        user: user,
        authScreen: 'login',
      });

      Alert.alert('Sucesso', 'Login realizado com sucesso!');

      // Limpar campos
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login';

      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erro', errorMessage);
    }
  }, [loginEmail, loginPassword]);

  const handleRegister = async () => {
    if (!registerEmail.trim() || !validateEmail(registerEmail)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return;
    }
    if (!registerPassword.trim() || registerPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (!registerName.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome completo');
      return;
    }
    if (!registerCpf.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o CPF');
      return;
    }

    // Se for cliente, validar campos adicionais
    if (selectedRole === 'cliente') {
      if (!registerBirthDate.trim()) {
        Alert.alert('Erro', 'Por favor, preencha a data de nascimento');
        return;
      }
      if (!registerStreet.trim() || !registerNumber.trim() || !registerNeighborhood.trim() ||
        !registerCity.trim() || !registerState.trim() || !registerZipCode.trim()) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos do endereço');
        return;
      }
    }

    try {
      // Preparar dados do usuário
      const userData: any = {
        email: registerEmail,
        password: registerPassword, // NOTA: Em produção, deve ser hash
        name: registerName,
        cpf: registerCpf.replace(/[^\d]/g, ''),
        role: selectedRole || 'cliente',
        permissionLevel: selectedRole === 'lojista' ? 'lojista' : 'cliente',
        isMaster: false,
        storePermissions: [],
      };

      // Adicionar dados específicos de cliente
      if (selectedRole === 'cliente') {
        userData.birthDate = registerBirthDate;
        userData.gender = registerGender;
        userData.address = {
          street: registerStreet,
          number: registerNumber,
          complement: registerComplement || '',
          neighborhood: registerNeighborhood,
          city: registerCity,
          state: registerState,
          zipCode: registerZipCode,
        };
      }

      // Criar usuário no Firestore
      const userId = await createUser(userData);

      if (!userId) {
        throw new Error('Erro ao criar usuário');
      }

      // Salvar sessão e fazer login automático
      saveSession(userId);

      // Buscar dados completos do usuário
      const firestoreData = await getUserDataFromFirestore(userId);

      if (firestoreData && firestoreData.id) {
        const user: User = {
          id: firestoreData.id,
          email: firestoreData.email || '',
          cpf: firestoreData.cpf || '',
          name: firestoreData.name || '',
          role: firestoreData.role || 'cliente',
          permissionLevel: firestoreData.permissionLevel || 'cliente',
          isMaster: firestoreData.isMaster || false,
          storePermissions: firestoreData.storePermissions || [],
          birthDate: firestoreData.birthDate,
          gender: firestoreData.gender,
          address: firestoreData.address,
        };

        setAuthState({
          isLoggedIn: true,
          user: user,
          authScreen: 'login',
        });
      }

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');

      // Limpar formulário
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterName('');
      setRegisterCpf('');
      setRegisterBirthDate('');
      setRegisterGender('prefiro-nao-informar');
      setRegisterStreet('');
      setRegisterNumber('');
      setRegisterComplement('');
      setRegisterNeighborhood('');
      setRegisterCity('');
      setRegisterState('');
      setRegisterZipCode('');
      setSelectedRole(null);
    } catch (error: any) {
      let errorMessage = 'Erro ao criar conta';

      if (error.message && error.message.includes('já está em uso')) {
        errorMessage = 'Este e-mail já está em uso';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erro', errorMessage);
    }
  };

  const categories = [
    { name: 'Vestuário', icon: 'checkroom', iconType: 'MaterialIcons' },
    { name: 'Alimentação', icon: 'restaurant', iconType: 'MaterialIcons' },
    { name: 'Eletrônicos', icon: 'smartphone', iconType: 'MaterialIcons' },
    { name: 'Farmácia', icon: 'local-pharmacy', iconType: 'MaterialIcons' },
    { name: 'Beleza', icon: 'face', iconType: 'MaterialIcons' },
    { name: 'Pet Shop', icon: 'pets', iconType: 'MaterialIcons' },
    { name: 'Academia', icon: 'fitness-center', iconType: 'MaterialIcons' },
    { name: 'Mais', icon: 'add', iconType: 'MaterialIcons' },
  ];

  const bottomNavItems = [
    { name: 'Início', icon: 'home', iconType: 'MaterialIcons', active: currentScreen === 'home', screen: 'home' },
    { name: 'Ranking', icon: 'bar-chart', iconType: 'MaterialIcons', active: currentScreen === 'ranking', screen: 'ranking' },
    { name: 'Comparar', icon: 'search', iconType: 'MaterialIcons', active: currentScreen === 'compare', screen: 'compare' },
    { name: 'Carteira', icon: 'account-balance-wallet', iconType: 'MaterialIcons', active: currentScreen === 'wallet', screen: 'wallet' },
    { name: 'Perfil', icon: 'person', iconType: 'MaterialIcons', active: currentScreen === 'profile', screen: 'profile' },
  ];

  // Dados para filtro "Mais Vendas"
  const salesRankingStores = [
    {
      id: 1,
      name: 'TechWorld',
      category: 'Eletrônicos',
      sales: 1247,
      rating: 4.9,
      cashback: '10%',
      logo: 'flash-on',
      logoType: 'MaterialIcons',
      logoBg: '#4CAF50',
      position: 1,
      isTop3: true,
    },
    {
      id: 2,
      name: 'Boutique Elegance',
      category: 'Vestuário',
      sales: 1189,
      rating: 4.8,
      cashback: '15%',
      logo: 'checkroom',
      logoType: 'MaterialIcons',
      logoBg: '#9E9E9E',
      position: 2,
      isTop3: true,
    },
    {
      id: 3,
      name: 'Restaurante Sabor',
      category: 'Alimentação',
      sales: 1056,
      rating: 4.7,
      cashback: '12%',
      logo: 'restaurant',
      logoType: 'MaterialIcons',
      logoBg: '#8D6E63',
      position: 3,
      isTop3: true,
    },
    {
      id: 4,
      name: 'Farmácia Saúde+',
      category: 'Farmácia',
      sales: 987,
      rating: 4.7,
      cashback: '8%',
      logo: 'local-pharmacy',
      logoType: 'MaterialIcons',
      logoBg: '#4CAF50',
      position: 4,
      isTop3: false,
    },
    {
      id: 5,
      name: 'Academia FitLife',
      category: 'Academia',
      sales: 876,
      rating: 4.6,
      cashback: '20%',
      logo: 'fitness-center',
      logoType: 'MaterialIcons',
      logoBg: '#2196F3',
      position: 5,
      isTop3: false,
    },
  ];

  // Dados para filtro "Maior Cashback" (ordenado por cashback)
  const cashbackRankingStores = [
    {
      id: 5,
      name: 'Academia FitLife',
      category: 'Academia',
      sales: 876,
      rating: 4.6,
      cashback: '20%',
      logo: 'fitness-center',
      logoType: 'MaterialIcons',
      logoBg: '#2196F3',
      position: 1,
      isTop3: true,
    },
    {
      id: 2,
      name: 'Boutique Elegance',
      category: 'Vestuário',
      sales: 1189,
      rating: 4.8,
      cashback: '15%',
      logo: 'checkroom',
      logoType: 'MaterialIcons',
      logoBg: '#9E9E9E',
      position: 2,
      isTop3: true,
    },
    {
      id: 3,
      name: 'Restaurante Sabor',
      category: 'Alimentação',
      sales: 1056,
      rating: 4.7,
      cashback: '12%',
      logo: 'restaurant',
      logoType: 'MaterialIcons',
      logoBg: '#8D6E63',
      position: 3,
      isTop3: true,
    },
    {
      id: 1,
      name: 'TechWorld',
      category: 'Eletrônicos',
      sales: 1247,
      rating: 4.9,
      cashback: '10%',
      logo: 'flash-on',
      logoType: 'MaterialIcons',
      logoBg: '#4CAF50',
      position: 4,
      isTop3: false,
    },
    {
      id: 4,
      name: 'Farmácia Saúde+',
      category: 'Farmácia',
      sales: 987,
      rating: 4.7,
      cashback: '8%',
      logo: 'local-pharmacy',
      logoType: 'MaterialIcons',
      logoBg: '#4CAF50',
      position: 5,
      isTop3: false,
    },
  ];

  // Dados para comparação de preços
  const compareResults = [
    {
      id: 1,
      storeName: 'TechWorld',
      distance: '1.2 km',
      rating: 4.9,
      cashback: '10%',
      originalPrice: 7299.00,
      cashbackAmount: 729.90,
      finalPrice: 6569.10,
      isBestOffer: true,
    },
    {
      id: 2,
      storeName: 'Eletrônicos Premium',
      distance: '2.5 km',
      rating: 4.7,
      cashback: '8%',
      originalPrice: 7499.00,
      cashbackAmount: 599.92,
      finalPrice: 6899.08,
      isBestOffer: false,
    },
    {
      id: 3,
      storeName: 'MegaStore Tech',
      distance: '3.1 km',
      rating: 4.8,
      cashback: '5%',
      originalPrice: 7599.00,
      cashbackAmount: 379.95,
      finalPrice: 7219.05,
      isBestOffer: false,
    },
  ];

  const featuredStores = [
    {
      id: 1,
      name: 'Boutique Elegance',
      category: 'Vestuário',
      distance: '0.5 km',
      rating: 4.8,
      cashback: '15%',
      badge: 'Top da Cidade',
      badgeColor: '#5C8FFC',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
      description: 'Loja especializada em roupas elegantes e modernas para todas as ocasiões.',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 99999-9999',
      hours: 'Seg-Sex: 9h-18h | Sáb: 9h-16h',
      products: [
        {
          id: 1,
          name: 'Vestido Elegante',
          price: 299.90,
          originalPrice: 399.90,
          image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
          category: 'Vestidos',
          rating: 4.9,
          reviews: 127,
        },
        {
          id: 2,
          name: 'Blusa Premium',
          price: 149.90,
          originalPrice: 199.90,
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
          category: 'Blusas',
          rating: 4.7,
          reviews: 89,
        },
        {
          id: 3,
          name: 'Calça Social',
          price: 199.90,
          originalPrice: 279.90,
          image: 'https://images.unsplash.com/photo-1506629905607-0b2b4b0b0b0b?w=300&h=300&fit=crop',
          category: 'Calças',
          rating: 4.8,
          reviews: 156,
        },
      ],
    },
    {
      id: 2,
      name: 'TechWorld',
      category: 'Eletrônicos',
      distance: '1.2 km',
      rating: 4.9,
      cashback: '10%',
      badge: 'Loja Premium',
      badgeColor: '#5C8FFC',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
      description: 'A melhor loja de eletrônicos com os últimos lançamentos em tecnologia.',
      address: 'Av. Paulista, 1000 - Bela Vista',
      phone: '(11) 88888-8888',
      hours: 'Seg-Sex: 8h-20h | Sáb-Dom: 9h-18h',
      products: [
        {
          id: 4,
          name: 'iPhone 15 Pro',
          price: 8999.00,
          originalPrice: 9999.00,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
          category: 'Smartphones',
          rating: 4.9,
          reviews: 234,
        },
        {
          id: 5,
          name: 'MacBook Air M2',
          price: 7999.00,
          originalPrice: 8999.00,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
          category: 'Notebooks',
          rating: 4.8,
          reviews: 189,
        },
        {
          id: 6,
          name: 'AirPods Pro',
          price: 1299.00,
          originalPrice: 1499.00,
          image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
          category: 'Acessórios',
          rating: 4.7,
          reviews: 312,
        },
      ],
    },
    {
      id: 3,
      name: 'Farmácia Central',
      category: 'Farmácia',
      distance: '0.8 km',
      rating: 4.7,
      cashback: '8%',
      badge: 'Loja do Mês',
      badgeColor: '#5C8FFC',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=200&fit=crop',
      description: 'Farmácia completa com medicamentos e produtos de saúde e beleza.',
      address: 'Rua da Saúde, 456 - Centro',
      phone: '(11) 77777-7777',
      hours: 'Seg-Dom: 24h',
      products: [
        {
          id: 7,
          name: 'Vitamina D3',
          price: 45.90,
          originalPrice: 59.90,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
          category: 'Vitaminas',
          rating: 4.6,
          reviews: 78,
        },
        {
          id: 8,
          name: 'Protetor Solar FPS 60',
          price: 29.90,
          originalPrice: 39.90,
          image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
          category: 'Cosméticos',
          rating: 4.8,
          reviews: 145,
        },
        {
          id: 9,
          name: 'Termômetro Digital',
          price: 35.90,
          originalPrice: 49.90,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
          category: 'Equipamentos',
          rating: 4.5,
          reviews: 92,
        },
      ],
    },
  ];

  // Componente da Tela de Detalhes da Loja
  if (!authState.isLoggedIn) {
    if (authState.authScreen === 'register') {
      return <RegisterRoleScreen />;
    }
    if (authState.authScreen === 'register-client') {
      return (
        <RegisterClientScreen
          registerName={registerName}
          registerEmail={registerEmail}
          registerCpf={registerCpf}
          registerBirthDate={registerBirthDate}
          registerGender={registerGender}
          registerStreet={registerStreet}
          registerNumber={registerNumber}
          registerComplement={registerComplement}
          registerNeighborhood={registerNeighborhood}
          registerCity={registerCity}
          registerState={registerState}
          registerZipCode={registerZipCode}
          registerPassword={registerPassword}
          registerConfirmPassword={registerConfirmPassword}
          onNameChange={handleRegisterNameChange}
          onEmailChange={handleRegisterEmailChange}
          onCpfChange={handleRegisterCpfChange}
          onBirthDateChange={handleRegisterBirthDateChange}
          onGenderChange={handleRegisterGenderChange}
          onStreetChange={handleRegisterStreetChange}
          onNumberChange={handleRegisterNumberChange}
          onComplementChange={handleRegisterComplementChange}
          onNeighborhoodChange={handleRegisterNeighborhoodChange}
          onCityChange={handleRegisterCityChange}
          onStateChange={handleRegisterStateChange}
          onZipCodeChange={handleRegisterZipCodeChange}
          onPasswordChange={handleRegisterPasswordChange}
          onConfirmPasswordChange={handleRegisterConfirmPasswordChange}
          onRegister={handleRegister}
          onBack={handleBackToRegister}
          onBackToLogin={handleBackToLogin}
          styles={styles}
        />
      );
    }
    if (authState.authScreen === 'register-merchant') {
      return (
        <RegisterMerchantScreen
          registerName={registerName}
          registerEmail={registerEmail}
          registerCpf={registerCpf}
          registerPassword={registerPassword}
          registerConfirmPassword={registerConfirmPassword}
          onNameChange={handleRegisterNameChange}
          onEmailChange={handleRegisterEmailChange}
          onCpfChange={handleRegisterCpfChange}
          onPasswordChange={handleRegisterPasswordChange}
          onConfirmPasswordChange={handleRegisterConfirmPasswordChange}
          onRegister={handleRegister}
          onBack={handleBackToRegister}
          onBackToLogin={handleBackToLogin}
          styles={styles}
        />
      );
    }
    return (
      <LoginScreen
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        onEmailChange={handleLoginEmailChange}
        onPasswordChange={handleLoginPasswordChange}
        onLogin={handleLogin}
        onRegisterPress={() => setAuthState({ ...authState, authScreen: 'register' })}
        styles={styles}
      />
    );
  }

  if (currentScreen === 'ranking') {
    return <RankingScreen />;
  }

  if (currentScreen === 'compare') {
    return <CompareScreen />;
  }

  if (currentScreen === 'promotions') {
    return <PromotionsScreen />;
  }

  if (currentScreen === 'wallet') {
    if (walletSubScreen === 'buy') {
      return <BuyCashbackScreen />;
    }
    if (walletSubScreen === 'vouchers') {
      return <VouchersScreen />;
    }
    return <WalletScreen />;
  }

  if (currentScreen === 'profile') {
    if (profileSubScreen === 'purchases') {
      return <MyPurchasesScreen />;
    }
    if (profileSubScreen === 'manage-store') {
      return (
        <ManageStoreScreen
          authState={authState}
          userStore={userStore}
          setProfileSubScreen={setProfileSubScreen}
          loadUserStore={loadUserStore}
        />
      );
    }
    if (profileSubScreen === 'products') {
      return (
        <ManageProductsScreen
          userStore={userStore}
          userProducts={userProducts}
          setProfileSubScreen={setProfileSubScreen}
          setEditingProduct={setEditingProduct}
          loadUserProducts={loadUserProducts}
        />
      );
    }
    if (profileSubScreen === 'add-product') {
      return (
        <AddEditProductScreen
          editingProduct={editingProduct}
          userStore={userStore}
          setProfileSubScreen={setProfileSubScreen}
          setEditingProduct={setEditingProduct}
          loadUserProducts={loadUserProducts}
        />
      );
    }
    if (profileSubScreen === 'orders') {
      return (
        <OrdersScreen
          setProfileSubScreen={setProfileSubScreen}
          userStore={userStore}
        />
      );
    }
    if (profileSubScreen === 'reports') {
      return (
        <ReportsScreen
          setProfileSubScreen={setProfileSubScreen}
        />
      );
    }
    return (
      <ProfileScreen
        authState={authState}
        setCurrentScreen={setCurrentScreen}
        setProfileSubScreen={setProfileSubScreen}
        userStore={userStore}
        userProducts={userProducts}
        handleLogout={handleLogout}
        bottomNavItems={bottomNavItems}
      />
    );
  }

  if (currentScreen === 'store-detail') {
    console.log('Renderizando store-detail, storeSubScreen:', storeSubScreen);
    console.log('selectedProduct:', selectedProduct);
    console.log('selectedStore:', selectedStore);

    if (storeSubScreen === 'products') {
      return <StoreProductsScreen />;
    }
    if (storeSubScreen === 'product-detail') {
      return <ProductDetailScreen />;
    }
    if (storeSubScreen === 'checkout') {
      return <CheckoutScreen />;
    }
    return <StoreDetailScreen />;
  }

  return (
    <HomeScreen
      searchText={searchText}
      setSearchText={setSearchText}
      setCurrentScreen={setCurrentScreen}
      handleLogout={handleLogout}
      categories={categories}
      featuredStores={featuredStores}
      bottomNavItems={bottomNavItems}
    />
  );
}
