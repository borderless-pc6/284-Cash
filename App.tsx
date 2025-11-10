import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
// @ts-ignore - @expo/vector-icons is available through expo
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from './src/config/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
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

// Helper function to render icon
const renderIcon = (icon: string, iconType: string = 'MaterialIcons', size: number = 24, color: string = 'white') => {
  if (iconType === 'MaterialIcons') {
    return <MaterialIcons name={icon as any} size={size} color={color} />;
  }
  return <Text>{icon}</Text>;
};

// Tipos e Interfaces
type UserRole = 'cliente' | 'lojista';
type Gender = 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-informar';

// Sistema de Permissões e Grupos
interface User {
  id: string;
  email: string;
  cpf: string;
  name: string;
  role: UserRole;
  permissionLevel: PermissionLevel; // Permissão principal do usuário
  storePermissions?: StorePermission[]; // Permissões em lojas específicas
  isMaster?: boolean; // Flag para permissão master
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

interface Store {
  id: string;
  name: string;
  ownerId?: string; // ID do dono da loja
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  authScreen: 'login' | 'register' | 'register-client' | 'register-merchant';
}

// Funções de formatação (fora do componente para evitar recriação)
const formatCPF = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const formatZipCode = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

const formatDate = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

// Componente da Tela de Login - movido para fora para evitar recriação
interface LoginScreenProps {
  loginEmail: string;
  loginPassword: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onLogin: () => void;
  onRegisterPress: () => void;
  styles: any;
}

const LoginScreenComponent = ({
  loginEmail,
  loginPassword,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onRegisterPress,
  styles
}: LoginScreenProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.loginContainer}>
      <StatusBar style="dark" />

      {/* Header Section */}
      <View style={styles.loginHeaderSection}>
        <View style={styles.loginLogoContainer}>
          <View style={styles.loginLogoBackground}>
            <MaterialIcons name="account-balance-wallet" size={40} color="white" />
            <View style={styles.loginStarIcon}>
              <MaterialIcons name="star" size={20} color="#1F2937" />
            </View>
          </View>
        </View>

        <Text style={styles.loginWelcomeText}>Bem-vindo de volta!</Text>
        <Text style={styles.loginSubtitleText}>Entre e aproveite cashback nas lojas locais</Text>
      </View>

      {/* Login Form */}
      <View style={styles.loginFormCard}>
        {/* Email/CPF Field */}
        <View style={styles.loginInputContainer}>
          <Text style={styles.loginInputLabel}>E-mail ou CPF</Text>
          <View style={styles.loginInputWrapper}>
            <MaterialIcons name="email" size={18} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              style={styles.loginTextInput}
              placeholder="seu@email.com ou 000.000.000-0"
              placeholderTextColor="#9CA3AF"
              value={loginEmail}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.loginInputContainer}>
          <View style={styles.loginPasswordHeader}>
            <Text style={styles.loginInputLabel}>Senha</Text>
            <TouchableOpacity>
              <Text style={styles.loginForgotPassword}>Esqueceu?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.loginInputWrapper}>
            <MaterialIcons name="lock" size={18} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              style={styles.loginTextInput}
              placeholder="Digite sua senha"
              placeholderTextColor="#9CA3AF"
              value={loginPassword}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={18}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.loginDivider}>
          <View style={styles.loginDividerLine} />
          <Text style={styles.loginDividerText}>ou continue com</Text>
          <View style={styles.loginDividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.loginSocialButtons}>
          <TouchableOpacity style={styles.loginSocialButton}>
            <Text style={styles.loginGoogleIcon}>G</Text>
            <Text style={styles.loginSocialButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginSocialButton}>
            <Text style={styles.loginFacebookIcon}>f</Text>
            <Text style={styles.loginSocialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.loginFooter}>
        <Text style={styles.loginFooterText}>Não tem uma conta? </Text>
        <TouchableOpacity onPress={onRegisterPress}>
          <Text style={styles.loginRegisterLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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

  // Verificar estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setIsLoadingAuth(false);

      if (firebaseUser) {
        // Usuário está autenticado
        // Nota: Você precisará buscar os dados adicionais do usuário (CPF, role, permissões, etc.) 
        // do Firestore ou outro banco de dados, pois o Firebase Auth só armazena email/uid
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          cpf: '', // Será necessário buscar do Firestore
          name: firebaseUser.displayName || '',
          role: 'cliente', // Será necessário buscar do Firestore
          permissionLevel: 'cliente', // Permissão padrão - será necessário buscar do Firestore
          isMaster: false, // Será necessário buscar do Firestore
          storePermissions: [], // Será necessário buscar do Firestore
        };

        // Só atualiza se o estado realmente mudou
        setAuthState((prevState) => {
          if (prevState.isLoggedIn && prevState.user?.id === user.id) {
            return prevState; // Não atualiza se já está logado com o mesmo usuário
          }
          return {
            isLoggedIn: true,
            user: user,
            authScreen: 'login',
          };
        });
      } else {
        // Usuário não está autenticado
        setAuthState((prevState) => {
          if (!prevState.isLoggedIn) {
            return prevState; // Não atualiza se já não está logado
          }
          return {
            isLoggedIn: false,
            user: null,
            authScreen: 'login',
          };
        });
      }
    });

    return () => unsubscribe();
  }, []);

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
          onPress: async () => {
            try {
              await signOut(auth);
              setLoginEmail('');
              setLoginPassword('');
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
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const firebaseUser = userCredential.user;

      // O estado de autenticação será atualizado automaticamente pelo useEffect
      // que monitora onAuthStateChanged
      Alert.alert('Sucesso', 'Login realizado com sucesso!');

      // Limpar campos
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Usuário desabilitado';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      } else if (error.message) {
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
    if (!registerCpf.trim() || !validateCPF(registerCpf.replace(/[^\d]/g, ''))) {
      Alert.alert('Erro', 'Por favor, insira um CPF válido');
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
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      const firebaseUser = userCredential.user;

      // Atualizar o displayName do usuário com o nome fornecido
      await updateProfile(firebaseUser, { displayName: registerName });

      // Nota: Para salvar dados adicionais (CPF, role, endereço, etc.), 
      // você precisará usar o Firestore ou Realtime Database
      // Por enquanto, apenas atualizamos o displayName no Firebase Auth

      // O estado de autenticação será atualizado automaticamente pelo useEffect
      // que monitora onAuthStateChanged
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

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca';
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
  const StoreDetailScreen = () => {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    const calculateCashback = (price: number) => {
      if (!selectedStore) return 0;
      const cashbackPercent = parseFloat(selectedStore.cashback.replace('%', ''));
      return (price * cashbackPercent) / 100;
    };

    if (!selectedStore) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Loja não encontrada</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.errorButtonText}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.storeDetailHeader}>
          <View style={styles.storeDetailHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.storeDetailTitle}>{selectedStore.name}</Text>
            <TouchableOpacity>
              <MaterialIcons name="share" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Store Image */}
          <View style={styles.storeDetailImageContainer}>
            <Image source={{ uri: selectedStore.image }} style={styles.storeDetailImage} />

            {/* Badges */}
            <View style={styles.storeDetailBadges}>
              <View style={[styles.badge, { backgroundColor: selectedStore.badgeColor }]}>
                <Text style={styles.badgeText}>{selectedStore.badge}</Text>
              </View>
              <View style={[styles.cashbackBadge, { backgroundColor: '#1E293B' }]}>
                <Text style={styles.cashbackText}>{selectedStore.cashback} cashback</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.storeDetailContent} showsVerticalScrollIndicator={false}>
          {/* Store Info */}
          <View style={styles.storeInfoSection}>
            <Text style={styles.storeDetailName}>{selectedStore.name}</Text>
            <Text style={styles.storeDetailCategory}>{selectedStore.category}</Text>
            <Text style={styles.storeDetailDescription}>{selectedStore.description}</Text>

            {/* Store Details */}
            <View style={styles.storeDetailItems}>
              <View style={styles.storeDetailItem}>
                <MaterialIcons name="place" size={18} color="white" />
                <Text style={styles.storeDetailItemText}>{selectedStore.address}</Text>
              </View>
              <View style={styles.storeDetailItem}>
                <MaterialIcons name="phone" size={18} color="white" />
                <Text style={styles.storeDetailItemText}>{selectedStore.phone}</Text>
              </View>
              <View style={styles.storeDetailItem}>
                <MaterialIcons name="access-time" size={18} color="white" />
                <Text style={styles.storeDetailItemText}>{selectedStore.hours}</Text>
              </View>
              <View style={styles.storeDetailItem}>
                <MaterialIcons name="star" size={18} color="white" />
                <Text style={styles.storeDetailItemText}>{selectedStore.rating} ({selectedStore.distance})</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.storeActionButtons}>
            <TouchableOpacity style={styles.storeActionButton}>
              <MaterialIcons name="phone" size={18} color="white" />
              <Text style={styles.storeActionButtonText}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storeActionButton}>
              <MaterialIcons name="map" size={18} color="white" />
              <Text style={styles.storeActionButtonText}>Navegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.storeActionButtonPrimary}
              onPress={() => setStoreSubScreen('products')}
            >
              <MaterialIcons name="shopping-bag" size={18} color="white" />
              <Text style={styles.storeActionButtonTextPrimary}>Ver Produtos</Text>
            </TouchableOpacity>
          </View>

          {/* Products Preview */}
          <View style={styles.productsPreviewSection}>
            <View style={styles.productsPreviewHeader}>
              <Text style={styles.productsPreviewTitle}>Produtos em Destaque</Text>
              <TouchableOpacity onPress={() => setStoreSubScreen('products')}>
                <Text style={styles.seeAllProductsLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedStore.products.slice(0, 3).map((product: any) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productPreviewCard}
                  onPress={() => {
                    console.log('Produto selecionado (preview):', product);
                    setSelectedProduct(product);
                    setStoreSubScreen('product-detail');
                  }}
                >
                  <Image source={{ uri: product.image }} style={styles.productPreviewImage} />
                  <Text style={styles.productPreviewName}>{product.name}</Text>
                  <View style={styles.productPreviewPrice}>
                    <Text style={styles.productPreviewCurrentPrice}>{formatPrice(product.price)}</Text>
                    <Text style={styles.productPreviewOriginalPrice}>{formatPrice(product.originalPrice)}</Text>
                  </View>
                  <View style={styles.productPreviewRating}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="star" size={14} color="#FFD700" />
                      <Text style={styles.productPreviewRatingText}> {product.rating}</Text>
                    </View>
                    <Text style={styles.productPreviewReviewsText}>({product.reviews})</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Produtos da Loja
  const StoreProductsScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    if (!selectedStore || !selectedStore.products) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Loja não encontrada</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setStoreSubScreen(null)}
            >
              <Text style={styles.errorButtonText}>Voltar à Loja</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const categories = ['Todos', ...Array.from(new Set(selectedStore.products.map((p: any) => p.category)))];

    const filteredProducts = selectedCategory === 'Todos'
      ? selectedStore.products
      : selectedStore.products.filter((p: any) => p.category === selectedCategory);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.storeProductsHeader}>
          <View style={styles.storeProductsHeaderTop}>
            <TouchableOpacity onPress={() => setStoreSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.storeProductsTitle}>Produtos - {selectedStore.name}</Text>
            <TouchableOpacity>
              <Text style={styles.filterIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesFilter}>
            {categories.map((category, index) => {
              const categoryStr = String(category);
              return (
                <TouchableOpacity
                  key={categoryStr}
                  style={[
                    styles.categoryFilterItem,
                    selectedCategory === categoryStr && styles.categoryFilterItemActive
                  ]}
                  onPress={() => setSelectedCategory(categoryStr)}
                >
                  <Text style={[
                    styles.categoryFilterText,
                    selectedCategory === categoryStr && styles.categoryFilterTextActive
                  ]}>
                    {categoryStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <ScrollView style={styles.storeProductsContent} showsVerticalScrollIndicator={false}>
          <View style={styles.productsGrid}>
            {filteredProducts.map((product: any) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => {
                  console.log('Produto selecionado:', product);
                  setSelectedProduct(product);
                  setStoreSubScreen('product-detail');
                }}
              >
                <Image source={{ uri: product.image }} style={styles.productImage} />

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>

                  <View style={styles.productPriceContainer}>
                    <Text style={styles.productCurrentPrice}>{formatPrice(product.price)}</Text>
                    <Text style={styles.productOriginalPrice}>{formatPrice(product.originalPrice)}</Text>
                  </View>

                  <View style={styles.productRating}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="star" size={14} color="#FFD700" />
                      <Text style={styles.productRatingText}> {product.rating}</Text>
                    </View>
                    <Text style={styles.productReviewsText}>({product.reviews})</Text>
                  </View>

                  <View style={styles.productCashback}>
                    <Text style={styles.productCashbackText}>
                      +{selectedStore.cashback} cashback
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Detalhes do Produto
  const ProductDetailScreen = () => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Preto');

    console.log('ProductDetailScreen - selectedProduct:', selectedProduct);
    console.log('ProductDetailScreen - selectedStore:', selectedStore);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    const calculateCashback = () => {
      if (!selectedProduct || !selectedStore) return 0;
      const cashbackPercent = parseFloat(selectedStore.cashback.replace('%', ''));
      return (selectedProduct.price * quantity * cashbackPercent) / 100;
    };

    if (!selectedProduct || !selectedStore) {
      console.log('Produto ou loja não encontrados, exibindo tela de erro');
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Produto não encontrado</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setStoreSubScreen('products')}
            >
              <Text style={styles.errorButtonText}>Voltar aos Produtos</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const totalPrice = selectedProduct.price * quantity;
    const cashbackAmount = calculateCashback();

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.productDetailHeader}>
          <View style={styles.productDetailHeaderTop}>
            <TouchableOpacity onPress={() => setStoreSubScreen('products')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.productDetailTitle}>Detalhes do Produto</Text>
            <TouchableOpacity>
              <MaterialIcons name="favorite" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.productDetailContent} showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <View style={styles.productDetailImageContainer}>
            <Image source={{ uri: selectedProduct.image }} style={styles.productDetailImage} />
          </View>

          {/* Product Info */}
          <View style={styles.productDetailInfo}>
            <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
            <Text style={styles.productDetailCategory}>{selectedProduct.category}</Text>

            <View style={styles.productDetailRating}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.productDetailRatingText}> {selectedProduct.rating}</Text>
              </View>
              <Text style={styles.productDetailReviewsText}>({selectedProduct.reviews} avaliações)</Text>
            </View>

            {/* Price */}
            <View style={styles.productDetailPriceContainer}>
              <Text style={styles.productDetailCurrentPrice}>{formatPrice(selectedProduct.price)}</Text>
              <Text style={styles.productDetailOriginalPrice}>{formatPrice(selectedProduct.originalPrice)}</Text>
              <View style={styles.productDetailDiscount}>
                <Text style={styles.productDetailDiscountText}>
                  {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                </Text>
              </View>
            </View>

            {/* Cashback Info */}
            <View style={styles.productDetailCashback}>
              <MaterialIcons name="account-balance-wallet" size={20} color="white" />
              <Text style={styles.productDetailCashbackText}>
                Ganhe {selectedStore.cashback} de cashback ({formatPrice(cashbackAmount)})
              </Text>
            </View>

            {/* Size Selection */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Tamanho</Text>
              <View style={styles.sizeOptions}>
                {['P', 'M', 'G', 'GG'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      selectedSize === size && styles.sizeOptionSelected
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                      styles.sizeOptionText,
                      selectedSize === size && styles.sizeOptionTextSelected
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Cor</Text>
              <View style={styles.colorOptions}>
                {['Preto', 'Branco', 'Azul', 'Vermelho'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      selectedColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <Text style={[
                      styles.colorOptionText,
                      selectedColor === color && styles.colorOptionTextSelected
                    ]}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity Selection */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Quantidade</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Product Description */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Descrição</Text>
              <Text style={styles.productDetailDescription}>
                Produto de alta qualidade com excelente custo-benefício.
                Perfeito para uso diário com design moderno e confortável.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.productDetailBottomBar}>
          <View style={styles.productDetailTotal}>
            <Text style={styles.productDetailTotalLabel}>Total:</Text>
            <Text style={styles.productDetailTotalPrice}>{formatPrice(totalPrice)}</Text>
            <Text style={styles.productDetailCashbackAmount}>
              +{formatPrice(cashbackAmount)} cashback
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => setStoreSubScreen('checkout')}
          >
            <Text style={styles.addToCartButtonText}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Componente da Tela de Checkout
  const CheckoutScreen = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cashback');
    const [useCashback, setUseCashback] = useState(true);
    const [cashbackAmount, setCashbackAmount] = useState(50.00);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    if (!selectedProduct || !selectedStore) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Produto não encontrado</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setStoreSubScreen('product-detail')}
            >
              <Text style={styles.errorButtonText}>Voltar ao Produto</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const subtotal = selectedProduct.price;
    const cashbackEarned = (subtotal * parseFloat(selectedStore.cashback.replace('%', ''))) / 100;
    const cashbackUsed = useCashback ? Math.min(cashbackAmount, subtotal) : 0;
    const total = subtotal - cashbackUsed;

    const paymentMethods = [
      { id: 'cashback', name: 'Cashback', icon: 'account-balance-wallet', iconType: 'MaterialIcons', description: 'Usar saldo disponível' },
      { id: 'pix', name: 'PIX', icon: 'flash-on', iconType: 'MaterialIcons', description: 'Aprovação instantânea' },
      { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card', iconType: 'MaterialIcons', description: 'Parcelamento disponível' },
    ];

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.checkoutHeader}>
          <View style={styles.checkoutHeaderTop}>
            <TouchableOpacity onPress={() => setStoreSubScreen('product-detail')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.checkoutTitle}>Finalizar Compra</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.checkoutContent} showsVerticalScrollIndicator={false}>
          {/* Product Summary */}
          <View style={styles.checkoutProductSummary}>
            <Image source={{ uri: selectedProduct.image }} style={styles.checkoutProductImage} />
            <View style={styles.checkoutProductInfo}>
              <Text style={styles.checkoutProductName}>{selectedProduct.name}</Text>
              <Text style={styles.checkoutProductCategory}>{selectedProduct.category}</Text>
              <Text style={styles.checkoutProductPrice}>{formatPrice(selectedProduct.price)}</Text>
            </View>
          </View>

          {/* Store Info */}
          <View style={styles.checkoutStoreInfo}>
            <Text style={styles.checkoutStoreName}>{selectedStore.name}</Text>
            <Text style={styles.checkoutStoreAddress}>{selectedStore.address}</Text>
            <Text style={styles.checkoutStoreCashback}>
              {selectedStore.cashback} de cashback disponível
            </Text>
          </View>

          {/* Payment Method */}
          <View style={styles.checkoutPaymentSection}>
            <Text style={styles.checkoutSectionTitle}>Forma de Pagamento</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.checkoutPaymentMethod,
                  selectedPaymentMethod === method.id && styles.checkoutPaymentMethodSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.checkoutPaymentMethodLeft}>
                  <MaterialIcons name={method.icon as any} size={20} color="white" />
                  <View style={styles.checkoutPaymentMethodInfo}>
                    <Text style={styles.checkoutPaymentMethodName}>{method.name}</Text>
                    <Text style={styles.checkoutPaymentMethodDescription}>{method.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.checkoutPaymentMethodRadio,
                  selectedPaymentMethod === method.id && styles.checkoutPaymentMethodRadioSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Cashback Usage */}
          {selectedPaymentMethod === 'cashback' && (
            <View style={styles.checkoutCashbackSection}>
              <Text style={styles.checkoutSectionTitle}>Usar Cashback</Text>
              <View style={styles.checkoutCashbackToggle}>
                <Text style={styles.checkoutCashbackToggleText}>Usar cashback disponível</Text>
                <TouchableOpacity
                  style={[styles.checkoutToggle, useCashback && styles.checkoutToggleActive]}
                  onPress={() => setUseCashback(!useCashback)}
                >
                  <View style={[styles.checkoutToggleButton, useCashback && styles.checkoutToggleButtonActive]} />
                </TouchableOpacity>
              </View>

              {useCashback && (
                <View style={styles.checkoutCashbackAmount}>
                  <Text style={styles.checkoutCashbackAmountLabel}>Valor a usar:</Text>
                  <TextInput
                    style={styles.checkoutCashbackAmountInput}
                    value={cashbackAmount.toString()}
                    onChangeText={(text) => setCashbackAmount(parseFloat(text) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.checkoutOrderSummary}>
            <Text style={styles.checkoutSectionTitle}>Resumo do Pedido</Text>

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryLabel}>Subtotal:</Text>
              <Text style={styles.checkoutSummaryValue}>{formatPrice(subtotal)}</Text>
            </View>

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryLabel}>Cashback usado:</Text>
              <Text style={styles.checkoutSummaryDiscount}>-{formatPrice(cashbackUsed)}</Text>
            </View>

            <View style={styles.checkoutSummaryDivider} />

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryTotalLabel}>Total:</Text>
              <Text style={styles.checkoutSummaryTotalValue}>{formatPrice(total)}</Text>
            </View>

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryLabel}>Cashback ganho:</Text>
              <Text style={styles.checkoutSummaryCashback}>+{formatPrice(cashbackEarned)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.checkoutBottomBar}>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  // Componente da Tela de Seleção de Perfil
  const RegisterRoleScreen = () => {
    return (
      <View style={styles.loginContainer}>
        <StatusBar style="dark" />

        {/* Header Section */}
        <View style={styles.loginHeaderSection}>
          <TouchableOpacity
            onPress={() => setAuthState({ ...authState, authScreen: 'login' })}
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 10 }}
          >
            <Text style={[styles.backIcon, { color: '#1F2937' }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.loginLogoContainer}>
            <View style={styles.loginLogoBackground}>
              <MaterialIcons name="account-balance-wallet" size={40} color="white" />
              <View style={styles.loginStarIcon}>
                <MaterialIcons name="star" size={20} color="#1F2937" />
              </View>
            </View>
          </View>

          <Text style={styles.loginWelcomeText}>Criar Conta</Text>
          <Text style={styles.loginSubtitleText}>Escolha o tipo de conta que deseja criar</Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.registerRoleContainer}>
          <TouchableOpacity
            style={[styles.registerRoleCard, selectedRole === 'cliente' && styles.registerRoleCardSelected]}
            onPress={() => {
              setSelectedRole('cliente');
              setAuthState({ ...authState, authScreen: 'register-client' });
            }}
          >
            <MaterialIcons name="person" size={48} color={selectedRole === 'cliente' ? '#5C8FFC' : '#6B7280'} style={{ marginBottom: 16 }} />
            <Text style={styles.registerRoleTitle}>Cliente</Text>
            <Text style={styles.registerRoleDescription}>
              Compre em lojas locais e ganhe cashback em cada compra
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerRoleCard, selectedRole === 'lojista' && styles.registerRoleCardSelected]}
            onPress={() => {
              setSelectedRole('lojista');
              setAuthState({ ...authState, authScreen: 'register-merchant' });
            }}
          >
            <MaterialIcons name="store" size={48} color={selectedRole === 'lojista' ? '#5C8FFC' : '#6B7280'} style={{ marginBottom: 16 }} />
            <Text style={styles.registerRoleTitle}>Lojista</Text>
            <Text style={styles.registerRoleDescription}>
              Cadastre sua loja e ofereça cashback para seus clientes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.loginFooter}>
          <Text style={styles.loginFooterText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => setAuthState({ ...authState, authScreen: 'login' })}>
            <Text style={styles.loginRegisterLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Componente da Tela de Cadastro de Cliente
  const RegisterClientScreen = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
      <ScrollView style={styles.loginContainer} showsVerticalScrollIndicator={false}>
        <StatusBar style="dark" />

        {/* Header Section */}
        <View style={styles.loginHeaderSection}>
          <TouchableOpacity
            onPress={() => setAuthState({ ...authState, authScreen: 'register' })}
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 10 }}
          >
            <Text style={[styles.backIcon, { color: '#1F2937' }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.loginLogoContainer}>
            <View style={styles.loginLogoBackground}>
              <MaterialIcons name="account-balance-wallet" size={40} color="white" />
            </View>
          </View>

          <Text style={styles.loginWelcomeText}>Cadastro de Cliente</Text>
          <Text style={styles.loginSubtitleText}>Preencha seus dados para começar</Text>
        </View>

        {/* Register Form */}
        <View style={styles.loginFormCard}>
          {/* Nome Completo */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Nome Completo *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="person" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Seu nome completo"
                placeholderTextColor="#9CA3AF"
                value={registerName}
                onChangeText={handleRegisterNameChange}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>E-mail *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="email" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                value={registerEmail}
                onChangeText={handleRegisterEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* CPF */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>CPF *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="badge" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="000.000.000-00"
                placeholderTextColor="#9CA3AF"
                value={registerCpf}
                onChangeText={handleRegisterCpfChange}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>
          </View>

          {/* Data de Nascimento */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Data de Nascimento *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="calendar-today" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
                value={registerBirthDate}
                onChangeText={handleRegisterBirthDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Sexo */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Sexo</Text>
            <View style={styles.registerGenderContainer}>
              {(['masculino', 'feminino', 'outro', 'prefiro-nao-informar'] as Gender[]).map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.registerGenderOption,
                    registerGender === gender && styles.registerGenderOptionSelected
                  ]}
                  onPress={() => setRegisterGender(gender)}
                >
                  <Text style={[
                    styles.registerGenderText,
                    registerGender === gender && styles.registerGenderTextSelected
                  ]}>
                    {gender === 'masculino' ? 'Masculino' :
                      gender === 'feminino' ? 'Feminino' :
                        gender === 'outro' ? 'Outro' : 'Prefiro não informar'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Endereço - Rua */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Rua *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="place" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Nome da rua"
                placeholderTextColor="#9CA3AF"
                value={registerStreet}
                onChangeText={handleRegisterStreetChange}
              />
            </View>
          </View>

          {/* Número e Complemento */}
          <View style={styles.registerAddressRow}>
            <View style={[styles.loginInputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.loginInputLabel}>Número *</Text>
              <View style={styles.loginInputWrapper}>
                <TextInput
                  style={styles.loginTextInput}
                  placeholder="123"
                  placeholderTextColor="#9CA3AF"
                  value={registerNumber}
                  onChangeText={handleRegisterNumberChange}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={[styles.loginInputContainer, { flex: 1 }]}>
              <Text style={styles.loginInputLabel}>Complemento</Text>
              <View style={styles.loginInputWrapper}>
                <TextInput
                  style={styles.loginTextInput}
                  placeholder="Apto, Bloco..."
                  placeholderTextColor="#9CA3AF"
                  value={registerComplement}
                  onChangeText={handleRegisterComplementChange}
                />
              </View>
            </View>
          </View>

          {/* Bairro */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Bairro *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="location-city" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Nome do bairro"
                placeholderTextColor="#9CA3AF"
                value={registerNeighborhood}
                onChangeText={handleRegisterNeighborhoodChange}
              />
            </View>
          </View>

          {/* Cidade e Estado */}
          <View style={styles.registerAddressRow}>
            <View style={[styles.loginInputContainer, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.loginInputLabel}>Cidade *</Text>
              <View style={styles.loginInputWrapper}>
                <TextInput
                  style={styles.loginTextInput}
                  placeholder="Cidade"
                  placeholderTextColor="#9CA3AF"
                  value={registerCity}
                  onChangeText={handleRegisterCityChange}
                />
              </View>
            </View>
            <View style={[styles.loginInputContainer, { flex: 1 }]}>
              <Text style={styles.loginInputLabel}>UF *</Text>
              <View style={styles.loginInputWrapper}>
                <TextInput
                  style={styles.loginTextInput}
                  placeholder="SP"
                  placeholderTextColor="#9CA3AF"
                  value={registerState}
                  onChangeText={handleRegisterStateChange}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          {/* CEP */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>CEP *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="local-post-office" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="00000-000"
                placeholderTextColor="#9CA3AF"
                value={registerZipCode}
                onChangeText={handleRegisterZipCodeChange}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Senha *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="lock" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9CA3AF"
                value={registerPassword}
                onChangeText={handleRegisterPasswordChange}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Senha */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Confirmar Senha *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="lock" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Digite a senha novamente"
                placeholderTextColor="#9CA3AF"
                value={registerConfirmPassword}
                onChangeText={handleRegisterConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
            <Text style={styles.loginButtonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.loginFooter}>
          <Text style={styles.loginFooterText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => setAuthState({ ...authState, authScreen: 'login' })}>
            <Text style={styles.loginRegisterLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Componente da Tela de Cadastro de Lojista (versão simplificada)
  const RegisterMerchantScreen = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
      <ScrollView style={styles.loginContainer} showsVerticalScrollIndicator={false}>
        <StatusBar style="dark" />

        {/* Header Section */}
        <View style={styles.loginHeaderSection}>
          <TouchableOpacity
            onPress={() => setAuthState({ ...authState, authScreen: 'register' })}
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 10 }}
          >
            <Text style={[styles.backIcon, { color: '#1F2937' }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.loginLogoContainer}>
            <View style={styles.loginLogoBackground}>
              <MaterialIcons name="store" size={40} color="white" />
            </View>
          </View>

          <Text style={styles.loginWelcomeText}>Cadastro de Lojista</Text>
          <Text style={styles.loginSubtitleText}>Preencha os dados da sua loja</Text>
        </View>

        {/* Register Form */}
        <View style={styles.loginFormCard}>
          {/* Nome da Loja */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Nome da Loja *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="store" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Nome da sua loja"
                placeholderTextColor="#9CA3AF"
                value={registerName}
                onChangeText={handleRegisterNameChange}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>E-mail *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="email" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                value={registerEmail}
                onChangeText={handleRegisterEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* CPF/CNPJ */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>CPF/CNPJ *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="badge" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                placeholderTextColor="#9CA3AF"
                value={registerCpf}
                onChangeText={(text) => {
                  const formatted = formatCPF(text);
                  if (formatted.replace(/[^\d]/g, '').length <= 14) {
                    setRegisterCpf(formatted);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Senha *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="lock" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9CA3AF"
                value={registerPassword}
                onChangeText={handleRegisterPasswordChange}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Senha */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>Confirmar Senha *</Text>
            <View style={styles.loginInputWrapper}>
              <MaterialIcons name="lock" size={18} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.loginTextInput}
                placeholder="Digite a senha novamente"
                placeholderTextColor="#9CA3AF"
                value={registerConfirmPassword}
                onChangeText={handleRegisterConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
            <Text style={styles.loginButtonText}>Cadastrar Loja</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.loginFooter}>
          <Text style={styles.loginFooterText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => setAuthState({ ...authState, authScreen: 'login' })}>
            <Text style={styles.loginRegisterLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Componente da Tela de Ranking
  const RankingScreen = () => {
    const [selectedTab, setSelectedTab] = useState('sales');

    // Selecionar dados baseado no filtro ativo
    const currentRankingStores = selectedTab === 'sales' ? salesRankingStores : cashbackRankingStores;
    const top3Stores = currentRankingStores.filter(store => store.isTop3);

    // Título dinâmico baseado no filtro
    const getTop3Title = () => {
      return selectedTab === 'sales' ? 'Top 3 do Mês' : 'Top 3 Cashback';
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.rankingHeader}>
          <View style={styles.rankingHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.rankingHeaderContent}>
              <Text style={styles.rankingTitle}>Rankings</Text>
              <Text style={styles.rankingSubtitle}>Descubra as lojas mais populares e com melhores cashbacks</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.rankingTabs}>
            <TouchableOpacity
              style={[styles.rankingTab, selectedTab === 'sales' && styles.rankingTabActive]}
              onPress={() => setSelectedTab('sales')}
            >
              <Text style={[styles.rankingTabText, selectedTab === 'sales' && styles.rankingTabTextActive]}>
                Mais Vendas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rankingTab, selectedTab === 'cashback' && styles.rankingTabActive]}
              onPress={() => setSelectedTab('cashback')}
            >
              <Text style={[styles.rankingTabText, selectedTab === 'cashback' && styles.rankingTabTextActive]}>
                Maior Cashback
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.rankingContent} showsVerticalScrollIndicator={false}>
          {/* Top 3 Section */}
          <View style={styles.top3Section}>
            <View style={styles.top3Header}>
              <MaterialIcons name="workspace-premium" size={24} color="#FFD700" />
              <Text style={styles.top3Title}>{getTop3Title()}</Text>
            </View>

            <View style={styles.top3Container}>
              {/* 2nd Place */}
              <View style={styles.top3Item}>
                <View style={styles.top3Medal}>
                  <MaterialIcons name="workspace-premium" size={20} color="#C0C0C0" />
                </View>
                <View style={[styles.top3Logo, { backgroundColor: top3Stores[1].logoBg }]}>
                  <MaterialIcons name={top3Stores[1].logo as any} size={24} color="white" />
                </View>
                <Text style={styles.top3StoreName}>{top3Stores[1].name}</Text>
                <Text style={styles.top3Sales}>
                  {selectedTab === 'sales' ? `${top3Stores[1].sales} vendas` : `${top3Stores[1].cashback} cashback`}
                </Text>
              </View>

              {/* 1st Place */}
              <View style={styles.top3Item}>
                <View style={styles.top3Crown}>
                  <MaterialIcons name="workspace-premium" size={24} color="#FFD700" />
                </View>
                <View style={[styles.top3Logo, styles.top3LogoFirst, { backgroundColor: top3Stores[0].logoBg }]}>
                  <MaterialIcons name={top3Stores[0].logo as any} size={24} color="white" />
                </View>
                <View style={styles.top3Badge}>
                  <Text style={styles.top3BadgeText}>
                    {selectedTab === 'sales' ? 'Loja do Mês' : 'Melhor Cashback'}
                  </Text>
                </View>
                <Text style={styles.top3StoreName}>{top3Stores[0].name}</Text>
                <Text style={styles.top3Sales}>
                  {selectedTab === 'sales' ? `${top3Stores[0].sales} vendas` : `${top3Stores[0].cashback} cashback`}
                </Text>
              </View>

              {/* 3rd Place */}
              <View style={styles.top3Item}>
                <View style={styles.top3Medal}>
                  <MaterialIcons name="workspace-premium" size={20} color="#CD7F32" />
                </View>
                <View style={[styles.top3Logo, { backgroundColor: top3Stores[2].logoBg }]}>
                  <MaterialIcons name={top3Stores[2].logo as any} size={24} color="white" />
                </View>
                <Text style={styles.top3StoreName}>{top3Stores[2].name}</Text>
                <Text style={styles.top3Sales}>
                  {selectedTab === 'sales' ? `${top3Stores[2].sales} vendas` : `${top3Stores[2].cashback} cashback`}
                </Text>
              </View>
            </View>
          </View>

          {/* Ranking List */}
          <View style={styles.rankingList}>
            {currentRankingStores.map((store) => (
              <TouchableOpacity key={store.id} style={styles.rankingItem}>
                <View style={styles.rankingItemLeft}>
                  {store.position <= 3 ? (
                    store.position === 1 ? (
                      <MaterialIcons name="workspace-premium" size={20} color="#FFD700" />
                    ) : store.position === 2 ? (
                      <MaterialIcons name="workspace-premium" size={20} color="#C0C0C0" />
                    ) : (
                      <MaterialIcons name="workspace-premium" size={20} color="#CD7F32" />
                    )
                  ) : (
                    <Text style={styles.rankingPosition}>#{store.position}</Text>
                  )}

                  <View style={[styles.rankingItemLogo, { backgroundColor: store.logoBg }]}>
                    <MaterialIcons name={store.logo as any} size={18} color="white" />
                  </View>

                  <View style={styles.rankingItemInfo}>
                    <Text style={styles.rankingItemName}>{store.name}</Text>
                    <Text style={styles.rankingItemCategory}>{store.category}</Text>
                    <Text style={styles.rankingItemSales}>
                      {selectedTab === 'sales' ? `${store.sales} vendas` : `${store.cashback} cashback`}
                    </Text>
                    <View style={styles.rankingItemRating}>
                      <Text style={styles.rankingItemRatingText}>{store.rating}</Text>
                      <MaterialIcons name="star" size={12} color="#FFD700" />
                    </View>
                  </View>
                </View>

                <View style={styles.rankingCashback}>
                  <Text style={styles.rankingCashbackPercent}>
                    {selectedTab === 'sales' ? store.cashback : `${store.sales}`}
                  </Text>
                  <Text style={styles.rankingCashbackText}>
                    {selectedTab === 'sales' ? 'cashback' : 'vendas'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.active ? '#5C8FFC' : '#9CA3AF'}
              />
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela de Comparar Preços
  const CompareScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedProduct, setSearchedProduct] = useState('iPhone 15 Pro 256GB');

    const handleSearch = () => {
      if (searchText.trim()) {
        setSearchedProduct(searchText);
      }
    };

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.compareHeader}>
          <View style={styles.compareHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.compareHeaderContent}>
              <Text style={styles.compareTitle}>Comparar Preços</Text>
              <Text style={styles.compareSubtitle}>Use IA para encontrar o melhor preço com cashback</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.compareContent} showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={18} color="white" />
              <TextInput
                style={styles.compareSearchInput}
                placeholder="Digite o nome do produto..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="camera-alt" size={18} color="white" />
                <Text style={styles.actionButtonText}>Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="file-upload" size={18} color="white" />
                <Text style={styles.actionButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

            {/* AI Smart Search Box */}
            <View style={styles.aiSearchBox}>
              <MaterialIcons name="auto-awesome" size={20} color="#60A5FA" />
              <View style={styles.aiSearchContent}>
                <Text style={styles.aiSearchTitle}>Busca Inteligente com IA</Text>
                <Text style={styles.aiSearchDescription}>
                  Tire uma foto ou faça upload de um print do produto. Nossa IA encontra as melhores ofertas para você!
                </Text>
              </View>
            </View>
          </View>

          {/* Results Section */}
          {searchedProduct && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Resultados para:</Text>
                <Text style={styles.resultsProduct}>{searchedProduct}</Text>
              </View>

              {/* Store Cards */}
              {compareResults.map((result) => (
                <View key={result.id} style={styles.compareCard}>
                  {/* Card Header */}
                  <View style={styles.compareCardHeader}>
                    {result.isBestOffer && (
                      <View style={styles.bestOfferBadge}>
                        <Text style={styles.bestOfferText}>Melhor Oferta</Text>
                      </View>
                    )}
                    <View style={styles.compareCardHeaderRight}>
                      <Text style={styles.compareCashbackBadge}>{result.cashback} cashback</Text>
                    </View>
                  </View>

                  {/* Store Info */}
                  <View style={styles.compareStoreInfo}>
                    <Text style={styles.compareStoreName}>{result.storeName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.compareStoreDetails}>
                        {result.distance}{' '}
                      </Text>
                      <MaterialIcons name="star" size={14} color="#FFD700" />
                      <Text style={styles.compareStoreDetails}>
                        {' '}{result.rating}
                      </Text>
                    </View>
                  </View>

                  {/* Price Details */}
                  <View style={styles.priceDetails}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Preço original:</Text>
                      <Text style={styles.priceValue}>{formatPrice(result.originalPrice)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Cashback:</Text>
                      <Text style={styles.cashbackValue}>-{formatPrice(result.cashbackAmount)}</Text>
                    </View>
                  </View>

                  {/* Separator */}
                  <View style={styles.priceSeparator} />

                  {/* Final Price */}
                  <View style={styles.finalPriceRow}>
                    <Text style={styles.finalPriceLabel}>Preço final:</Text>
                    <Text style={styles.finalPriceValue}>{formatPrice(result.finalPrice)}</Text>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity style={styles.viewStoreButton}>
                    <Text style={styles.viewStoreButtonText}>Ver na Loja</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.active ? '#5C8FFC' : '#9CA3AF'}
              />
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela de Comprar Cashback
  const BuyCashbackScreen = () => {
    const [selectedAmount, setSelectedAmount] = useState(50);
    const [selectedMethod, setSelectedMethod] = useState('pix');

    const cashbackPackages = [
      { id: 1, amount: 25, price: 20, bonus: 0, popular: false },
      { id: 2, amount: 50, price: 40, bonus: 5, popular: true },
      { id: 3, amount: 100, price: 80, bonus: 15, popular: false },
      { id: 4, amount: 200, price: 160, bonus: 40, popular: false },
    ];

    const paymentMethods = [
      { id: 'pix', name: 'PIX', icon: 'flash-on', iconType: 'MaterialIcons', description: 'Aprovação instantânea' },
      { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card', iconType: 'MaterialIcons', description: 'Parcelamento disponível' },
      { id: 'debit', name: 'Cartão de Débito', icon: 'account-balance', iconType: 'MaterialIcons', description: 'Débito em conta' },
    ];

    const selectedPackage = cashbackPackages.find(pkg => pkg.amount === selectedAmount);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.buyCashbackHeader}>
          <View style={styles.buyCashbackHeaderTop}>
            <TouchableOpacity onPress={() => setWalletSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.buyCashbackTitle}>Comprar Cashback</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.buyCashbackContent} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#60A5FA" />
              <Text style={styles.infoCardTitle}> Como funciona?</Text>
            </View>
            <Text style={styles.infoCardText}>
              Compre cashback e use em qualquer loja parceira. Quanto mais você compra, maior o bônus!
            </Text>
          </View>

          {/* Package Selection */}
          <View style={styles.packageSection}>
            <Text style={styles.sectionTitle}>Escolha seu pacote</Text>
            <View style={styles.packagesGrid}>
              {cashbackPackages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    selectedAmount === pkg.amount && styles.packageCardSelected,
                    pkg.popular && styles.packageCardPopular
                  ]}
                  onPress={() => setSelectedAmount(pkg.amount)}
                >
                  {pkg.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
                    </View>
                  )}
                  <Text style={styles.packageAmount}>R$ {pkg.amount}</Text>
                  <Text style={styles.packagePrice}>R$ {pkg.price}</Text>
                  {pkg.bonus > 0 && (
                    <Text style={styles.packageBonus}>+R$ {pkg.bonus} bônus</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Forma de pagamento</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedMethod === method.id && styles.paymentMethodCardSelected
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <MaterialIcons name={method.icon as any} size={20} color="white" />
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.paymentMethodRadio,
                  selectedMethod === method.id && styles.paymentMethodRadioSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo da compra</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cashback:</Text>
              <Text style={styles.summaryValue}>R$ {selectedPackage?.amount}</Text>
            </View>
            {selectedPackage && selectedPackage.bonus > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bônus:</Text>
                <Text style={styles.summaryBonusValue}>+R$ {selectedPackage.bonus}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total a pagar:</Text>
              <Text style={styles.summaryTotalValue}>R$ {selectedPackage?.price}</Text>
            </View>
          </View>

          {/* Buy Button */}
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Comprar Agora</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Vouchers
  const VouchersScreen = () => {
    const [activeTab, setActiveTab] = useState('available');

    const availableVouchers = [
      {
        id: 1,
        storeName: 'TechWorld',
        discount: '10%',
        description: 'Desconto em eletrônicos',
        expiryDate: '31/01/2025',
        minValue: 100,
        icon: 'flash-on',
        iconType: 'MaterialIcons',
        iconBg: '#4CAF50',
      },
      {
        id: 2,
        storeName: 'Boutique Elegance',
        discount: '15%',
        description: 'Desconto em roupas',
        expiryDate: '28/01/2025',
        minValue: 50,
        icon: 'checkroom',
        iconType: 'MaterialIcons',
        iconBg: '#9E9E9E',
      },
      {
        id: 3,
        storeName: 'Farmácia Saúde+',
        discount: '8%',
        description: 'Desconto em medicamentos',
        expiryDate: '25/01/2025',
        minValue: 30,
        icon: 'local-pharmacy',
        iconType: 'MaterialIcons',
        iconBg: '#4CAF50',
      },
    ];

    const usedVouchers = [
      {
        id: 4,
        storeName: 'Restaurante Sabor',
        discount: '12%',
        description: 'Desconto em refeições',
        usedDate: '15/01/2025',
        icon: 'restaurant',
        iconType: 'MaterialIcons',
        iconBg: '#8D6E63',
      },
    ];

    const currentVouchers = activeTab === 'available' ? availableVouchers : usedVouchers;

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.vouchersHeader}>
          <View style={styles.vouchersHeaderTop}>
            <TouchableOpacity onPress={() => setWalletSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.vouchersTitle}>Meus Vouchers</Text>
          </View>

          {/* Tabs */}
          <View style={styles.vouchersTabs}>
            <TouchableOpacity
              style={[styles.vouchersTab, activeTab === 'available' && styles.vouchersTabActive]}
              onPress={() => setActiveTab('available')}
            >
              <Text style={[styles.vouchersTabText, activeTab === 'available' && styles.vouchersTabTextActive]}>
                Disponíveis ({availableVouchers.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.vouchersTab, activeTab === 'used' && styles.vouchersTabActive]}
              onPress={() => setActiveTab('used')}
            >
              <Text style={[styles.vouchersTabText, activeTab === 'used' && styles.vouchersTabTextActive]}>
                Usados ({usedVouchers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.vouchersContent} showsVerticalScrollIndicator={false}>
          {currentVouchers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="confirmation-number" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>Nenhum voucher encontrado</Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'available'
                  ? 'Você não possui vouchers disponíveis no momento.'
                  : 'Você ainda não usou nenhum voucher.'
                }
              </Text>
            </View>
          ) : (
            currentVouchers.map((voucher) => (
              <View key={voucher.id} style={styles.voucherCard}>
                <View style={styles.voucherLeft}>
                  <View style={[styles.voucherIcon, { backgroundColor: voucher.iconBg }]}>
                    <MaterialIcons name={voucher.icon as any} size={24} color="white" />
                  </View>
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherStoreName}>{voucher.storeName}</Text>
                    <Text style={styles.voucherDiscount}>{voucher.discount} de desconto</Text>
                    <Text style={styles.voucherDescription}>{voucher.description}</Text>
                    {activeTab === 'available' ? (
                      <>
                        <Text style={styles.voucherExpiry}>Expira em: {'expiryDate' in voucher ? voucher.expiryDate : ''}</Text>
                        <Text style={styles.voucherMinValue}>Valor mínimo: R$ {'minValue' in voucher ? voucher.minValue : ''}</Text>
                      </>
                    ) : (
                      <Text style={styles.voucherUsedDate}>Usado em: {'usedDate' in voucher ? voucher.usedDate : ''}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.voucherRight}>
                  {activeTab === 'available' ? (
                    <TouchableOpacity style={styles.useVoucherButton}>
                      <Text style={styles.useVoucherButtonText}>Usar</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.usedBadge}>
                      <Text style={styles.usedBadgeText}>Usado</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Carteira
  const WalletScreen = () => {
    // Dados das transações do histórico
    const transactions = [
      {
        id: 1,
        storeName: 'Boutique Elegance',
        date: '17/01/2025',
        amount: 45.50,
        type: 'received',
        expiresIn: 43,
        icon: 'checkroom',
        iconType: 'MaterialIcons',
        iconBg: '#4CAF50',
        iconColor: '#2E7D32',
      },
      {
        id: 2,
        storeName: 'TechWorld',
        date: '16/01/2025',
        amount: 30.00,
        type: 'used',
        expiresIn: null,
        icon: 'flash-on',
        iconType: 'MaterialIcons',
        iconBg: '#FFCDD2',
        iconColor: '#D32F2F',
      },
      {
        id: 3,
        storeName: 'Farmácia Saúde+',
        date: '14/01/2025',
        amount: 12.80,
        type: 'received',
        expiresIn: 41,
        icon: 'local-pharmacy',
        iconType: 'MaterialIcons',
        iconBg: '#4CAF50',
        iconColor: '#2E7D32',
      },
      {
        id: 4,
        storeName: 'Restaurante Sabor',
        date: '13/01/2025',
        amount: 18.90,
        type: 'received',
        expiresIn: 40,
        icon: 'restaurant',
        iconType: 'MaterialIcons',
        iconBg: '#4CAF50',
        iconColor: '#2E7D32',
      },
      {
        id: 5,
        storeName: 'Clube iLocash',
        date: '09/01/2025',
        amount: 50.00,
        type: 'purchased',
        expiresIn: 36,
        icon: 'card-giftcard',
        iconType: 'MaterialIcons',
        iconBg: '#2196F3',
        iconColor: '#1976D2',
      },
    ];

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.walletHeader}>
          <View style={styles.walletHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.walletTitle}>Minha Carteira</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.walletContent} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Total em Cashback</Text>
            <Text style={styles.balanceAmount}>R$ 127,50</Text>
            <Text style={styles.balanceExpiry}>Expira em até 45 dias</Text>

            {/* Action Buttons */}
            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={styles.buyCashbackButton}
                onPress={() => setWalletSubScreen('buy')}
              >
                <MaterialIcons name="card-giftcard" size={16} color="white" />
                <Text style={styles.buyCashbackText}>Comprar Cashback</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewVouchersButton}
                onPress={() => setWalletSubScreen('vouchers')}
              >
                <Text style={styles.viewVouchersText}>Ver Vouchers</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>R$ 247</Text>
              <Text style={styles.statLabel}>Ganho Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>R$ 119</Text>
              <Text style={styles.statLabel}>Usado</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Transações</Text>
            </View>
          </View>

          {/* Cashback Distribution */}
          <View style={styles.distributionSection}>
            <Text style={styles.distributionTitle}>Distribuição de Cashback</Text>
            <View style={styles.distributionItem}>
              <View style={styles.distributionLeft}>
                <View style={styles.distributionDotFree} />
                <Text style={styles.distributionText}>Livre (todas as lojas)</Text>
              </View>
              <Text style={styles.distributionAmount}>R$ 85,00</Text>
            </View>
            <View style={styles.distributionItem}>
              <View style={styles.distributionLeft}>
                <View style={styles.distributionDotSpecific} />
                <Text style={styles.distributionText}>Lojas específicas</Text>
              </View>
              <Text style={styles.distributionAmount}>R$ 42,50</Text>
            </View>
          </View>

          {/* History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Histórico</Text>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBg }]}>
                    <MaterialIcons name={transaction.icon as any} size={24} color="white" />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionStore}>{transaction.storeName}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                    {transaction.expiresIn && (
                      <View style={styles.transactionExpiry}>
                        <MaterialIcons name="access-time" size={14} color="#9CA3AF" />
                        <Text style={styles.expiryText}>Expira em {transaction.expiresIn} dias</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'used' ? styles.transactionAmountUsed : styles.transactionAmountReceived
                  ]}>
                    {transaction.type === 'used' ? `R$ ${transaction.amount.toFixed(2).replace('.', ',')}` : `+R$ ${transaction.amount.toFixed(2).replace('.', ',')}`}
                  </Text>
                  <TouchableOpacity style={[
                    styles.transactionStatus,
                    transaction.type === 'purchased' ? styles.transactionStatusPurchased : styles.transactionStatusDefault
                  ]}>
                    <Text style={styles.transactionStatusText}>
                      {transaction.type === 'received' ? 'Recebido' :
                        transaction.type === 'used' ? 'Usado' : 'Comprado'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.active ? '#5C8FFC' : '#9CA3AF'}
              />
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela de Promoções
  const PromotionsScreen = () => {
    // Categorias de promoção
    const promoCategories = [
      { id: 'all', name: 'Todas', icon: 'local-fire-department', iconType: 'MaterialIcons', count: 20 },
      { id: 'flash', name: 'Flash Sales', icon: 'flash-on', iconType: 'MaterialIcons', count: 3 },
      { id: 'partnerships', name: 'Parcerias', icon: 'card-giftcard', iconType: 'MaterialIcons', count: 5 },
      { id: 'cashback', name: 'Cashback+', icon: 'trending-up', iconType: 'MaterialIcons', count: 12 },
    ];

    // Dados das promoções
    const promotions = [
      {
        id: 1,
        storeName: 'Fashion Style',
        category: 'flash',
        badge: 'Flash Sale',
        badgeColor: '#DC2626',
        badgeIcon: 'flash-on',
        badgeIconType: 'MaterialIcons',
        title: 'Flash Sale - 50% OFF',
        subtitle: 'Fashion Style',
        description: 'Toda a coleção de verão com metade do preço',
        timeLeft: '2h 30min',
        cashback: '15%',
        cashbackAmount: '15% Cashback',
      },
      {
        id: 2,
        storeName: 'Fashion Style + Tech Store',
        category: 'partnerships',
        badge: 'Parceria',
        badgeColor: '#9333EA',
        badgeIcon: 'card-giftcard',
        badgeIconType: 'MaterialIcons',
        title: 'Parceria Especial',
        subtitle: 'Fashion Style + Tech Store',
        description: 'Compre nas duas lojas e ganhe cashback combinado',
        timeLeft: '5 dias',
        cashback: '25%',
        cashbackAmount: '25% Cashback',
      },
      {
        id: 3,
        storeName: 'Boutique Elegance',
        category: 'cashback',
        badge: 'Cashback',
        badgeColor: '#5C8FFC',
        badgeIcon: 'trending-up',
        badgeIconType: 'MaterialIcons',
        title: 'Cashback Dobrado',
        subtitle: 'Boutique Elegance',
        description: 'Ganhe cashback em dobro em toda a loja',
        timeLeft: '7 dias',
        cashback: '30%',
        cashbackAmount: '30% Cashback',
      },
      {
        id: 4,
        storeName: 'TechWorld',
        category: 'flash',
        badge: 'Flash Sale',
        badgeColor: '#DC2626',
        badgeIcon: 'flash-on',
        badgeIconType: 'MaterialIcons',
        title: 'Mega Oferta Tech',
        subtitle: 'TechWorld',
        description: 'Smartphones e eletrônicos com até 40% OFF',
        timeLeft: '1h 15min',
        cashback: '18%',
        cashbackAmount: '18% Cashback',
      },
      {
        id: 5,
        storeName: 'Restaurante Sabor',
        category: 'cashback',
        badge: 'Cashback',
        badgeColor: '#5C8FFC',
        badgeIcon: 'trending-up',
        badgeIconType: 'MaterialIcons',
        title: 'Cashback Triplo',
        subtitle: 'Restaurante Sabor',
        description: 'Coma bem e ganhe cashback triplo',
        timeLeft: '3 dias',
        cashback: '36%',
        cashbackAmount: '36% Cashback',
      },
    ];

    // Filtrar promoções baseado na categoria selecionada
    const filteredPromotions = currentPromoCategory === 'all'
      ? promotions
      : promotions.filter(p => p.category === currentPromoCategory);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.promotionsHeader}>
          <View style={styles.promotionsHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.promotionsHeaderContent}>
              <Text style={styles.promotionsTitle}>Promoções</Text>
              <Text style={styles.promotionsSubtitle}>Ofertas especiais para você</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.promotionsContent} showsVerticalScrollIndicator={false}>
          {/* Category Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promoCategoriesContainer}
            contentContainerStyle={styles.promoCategoriesContent}
          >
            {promoCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.promoCategoryCard,
                  currentPromoCategory === category.id && styles.promoCategoryCardActive
                ]}
                onPress={() => setCurrentPromoCategory(category.id)}
              >
                <MaterialIcons name={category.icon as any} size={24} color={currentPromoCategory === category.id ? '#5C8FFC' : '#9CA3AF'} />
                <Text style={[
                  styles.promoCategoryCount,
                  currentPromoCategory === category.id && styles.promoCategoryCountActive
                ]}>{category.count}</Text>
                <Text style={[
                  styles.promoCategoryName,
                  currentPromoCategory === category.id && styles.promoCategoryNameActive
                ]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Promotions List */}
          <View style={styles.promotionsList}>
            {filteredPromotions.map((promo) => (
              <View key={promo.id} style={styles.promotionCard}>
                {/* Image Area */}
                <View style={styles.promotionImageContainer}>
                  {/* Placeholder for store image */}
                  <View style={styles.promotionImagePlaceholder}>
                    <MaterialIcons name="store" size={48} color="#9CA3AF" />
                  </View>

                  {/* Badge */}
                  <View style={[
                    styles.promotionBadge,
                    { backgroundColor: promo.badgeColor }
                  ]}>
                    <MaterialIcons name={promo.badgeIcon as any} size={16} color="white" />
                    <Text style={styles.promotionBadgeText}>{promo.badge}</Text>
                  </View>

                  {/* Title Overlay */}
                  <View style={styles.promotionTitleOverlay}>
                    <Text style={styles.promotionTitle}>{promo.title}</Text>
                    <Text style={styles.promotionSubtitle}>{promo.subtitle}</Text>
                  </View>

                  {/* Cashback Indicator */}
                  <View style={styles.promotionCashbackIndicator}>
                    <Text style={styles.promotionCashbackText}>{promo.cashbackAmount}</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.promotionDescription}>
                  <Text style={styles.promotionDescriptionText}>{promo.description}</Text>

                  {/* Timer */}
                  <View style={styles.promotionTimer}>
                    <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                    <Text style={styles.promotionTimerText}>Termina em {promo.timeLeft}</Text>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity style={styles.promotionButton}>
                    <MaterialIcons name="local-offer" size={16} color="white" />
                    <Text style={styles.promotionButtonText}>Aproveitar Oferta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.active ? '#5C8FFC' : '#9CA3AF'}
              />
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela de Minhas Compras
  const MyPurchasesScreen = () => {
    // Dados das compras
    const purchases = [
      {
        id: 1,
        storeName: 'TechWorld',
        date: '15/01/2025',
        amount: 299.99,
        cashback: 29.99,
        status: 'completed',
        icon: 'flash-on',
        iconType: 'MaterialIcons',
        iconBg: '#4CAF50',
      },
      {
        id: 2,
        storeName: 'Boutique Elegance',
        date: '17/01/2025',
        amount: 455.00,
        cashback: 68.25,
        status: 'completed',
        icon: '👔',
        iconBg: '#4CAF50',
      },
      {
        id: 3,
        storeName: 'Farmácia Saúde+',
        date: '14/01/2025',
        amount: 128.00,
        cashback: 12.80,
        status: 'pending',
        icon: '💊',
        iconBg: '#FFA726',
      },
      {
        id: 4,
        storeName: 'Restaurante Sabor',
        date: '13/01/2025',
        amount: 189.50,
        cashback: 18.90,
        status: 'completed',
        icon: '🍽️',
        iconBg: '#4CAF50',
      },
      {
        id: 5,
        storeName: 'Beleza & Estética',
        date: '10/01/2025',
        amount: 250.00,
        cashback: 62.50,
        status: 'completed',
        icon: '💄',
        iconBg: '#4CAF50',
      },
      {
        id: 6,
        storeName: 'Pet Shop Amigo',
        date: '08/01/2025',
        amount: 180.00,
        cashback: 27.00,
        status: 'completed',
        icon: '🐾',
        iconBg: '#4CAF50',
      },
    ];

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.purchasesHeader}>
          <View style={styles.purchasesHeaderTop}>
            <TouchableOpacity onPress={() => setProfileSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.purchasesTitle}>Minhas Compras</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.purchasesContent} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View style={styles.purchasesSummary}>
            <View style={styles.purchasesSummaryItem}>
              <Text style={styles.purchasesSummaryValue}>{purchases.length}</Text>
              <Text style={styles.purchasesSummaryLabel}>Total de Compras</Text>
            </View>
            <View style={styles.purchasesSummaryDivider} />
            <View style={styles.purchasesSummaryItem}>
              <Text style={styles.purchasesSummaryValue}>
                {formatPrice(purchases.reduce((sum, p) => sum + p.cashback, 0))}
              </Text>
              <Text style={styles.purchasesSummaryLabel}>Cashback Total</Text>
            </View>
          </View>

          {/* Purchases List */}
          <View style={styles.purchasesList}>
            <Text style={styles.purchasesListTitle}>Histórico de Compras</Text>
            {purchases.map((purchase) => (
              <TouchableOpacity key={purchase.id} style={styles.purchaseCard}>
                <View style={styles.purchaseCardLeft}>
                  <View style={[styles.purchaseIcon, { backgroundColor: purchase.iconBg }]}>
                    <Text style={styles.purchaseIconText}>{purchase.icon}</Text>
                  </View>
                  <View style={styles.purchaseInfo}>
                    <Text style={styles.purchaseStore}>{purchase.storeName}</Text>
                    <Text style={styles.purchaseDate}>{purchase.date}</Text>
                    <TouchableOpacity style={[
                      styles.purchaseStatus,
                      purchase.status === 'completed' ? styles.purchaseStatusCompleted : styles.purchaseStatusPending
                    ]}>
                      <Text style={styles.purchaseStatusText}>
                        {purchase.status === 'completed' ? '✓ Concluída' : '⏳ Pendente'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.purchaseCardRight}>
                  <Text style={styles.purchaseAmount}>{formatPrice(purchase.amount)}</Text>
                  <Text style={styles.purchaseCashback}>+{formatPrice(purchase.cashback)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => {
                setCurrentScreen(item.screen);
                setProfileSubScreen(null);
              }}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.active ? '#5C8FFC' : '#9CA3AF'}
              />
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela de Perfil
  const ProfileScreen = () => {
    // Obter dados do usuário autenticado
    const user = authState.user;
    const userName = user?.name || user?.email?.split('@')[0] || 'Usuário';
    const userEmail = user?.email || '';

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>Meu Perfil</Text>
            <TouchableOpacity>
              <MaterialIcons name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Info Section */}
          <View style={styles.profileInfoSection}>
            <View style={styles.profileAvatar}>
              <MaterialIcons name="person" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>

            <View style={styles.profileStats}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>R$ 245,80</Text>
                <Text style={styles.profileStatLabel}>Cashback Total</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>32</Text>
                <Text style={styles.profileStatLabel}>Compras</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
          {/* Achievements Section */}
          <View style={styles.achievementsCard}>
            <View style={styles.achievementsHeader}>
              <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
              <Text style={styles.achievementsTitle}>Conquistas</Text>
            </View>
            <View style={styles.achievementsButtons}>
              <TouchableOpacity style={styles.achievementButton}>
                <MaterialIcons name="star" size={24} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.achievementButton}>
                <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.achievementButton}>
                <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Menu Section */}
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                  <MaterialIcons name="account-balance-wallet" size={20} color="white" />
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>Minha Carteira</Text>
                  <Text style={styles.menuItemSubtitle}>R$ 245,80 disponível</Text>
                </View>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => setProfileSubScreen('purchases')}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                  <MaterialIcons name="shopping-bag" size={20} color="white" />
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>Minhas Compras</Text>
                  <Text style={styles.menuItemSubtitle}>Histórico completo</Text>
                </View>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                  <MaterialIcons name="notifications" size={20} color="white" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>3</Text>
                  </View>
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>Notificações</Text>
                  <Text style={styles.menuItemSubtitle}>3 novas ofertas</Text>
                </View>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Settings & Logout Section */}
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                  <MaterialIcons name="settings" size={20} color="white" />
                </View>
                <Text style={styles.menuItemTitle}>Configurações</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#DC2626' }]}>
                  <MaterialIcons name="logout" size={20} color="white" />
                </View>
                <Text style={[styles.menuItemTitle, { color: '#DC2626' }]}>Sair</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.active ? '#5C8FFC' : '#9CA3AF'}
              />
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela Home
  const HomeScreen = () => (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>ILocash</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="place" size={18} color="white" />
              <Text style={styles.locationText}>São Paulo, SP</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>R$ 127,50</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={18} color="white" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lojas ou produtos..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryItem}>
                <MaterialIcons name={category.icon as any} size={24} color="white" />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clube ILocash Banner */}
        <View style={styles.clubBanner}>
          <View style={styles.clubContent}>
            <MaterialIcons name="star" size={32} color="#60A5FA" />
            <Text style={styles.clubTitle}>Clube ILocash</Text>
            <Text style={styles.clubDescription}>Compre cashback e economize ainda mais!</Text>
            <TouchableOpacity style={styles.clubButton}>
              <Text style={styles.clubButtonText}>Conhecer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promoções Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoBannerContent}>
            <View style={styles.promoBannerLeft}>
              <MaterialIcons name="local-fire-department" size={32} color="white" />
              <View style={styles.promoBannerText}>
                <Text style={styles.promoBannerTitle}>Promoções</Text>
                <Text style={styles.promoBannerSubtitle}>Ofertas especiais para você</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.promoBannerButton}
              onPress={() => setCurrentScreen('promotions')}
            >
              <Text style={styles.promoBannerButtonText}>Ver ofertas</Text>
              <Text style={styles.promoBannerButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Stores Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lojas em Destaque</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('ranking')}>
              <Text style={styles.seeRankingLink}>Ver ranking</Text>
            </TouchableOpacity>
          </View>

          {/* Store Cards */}
          {featuredStores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeCard}
              onPress={() => {
                setSelectedStore(store);
                setCurrentScreen('store-detail');
              }}
            >
              <View style={styles.storeImageContainer}>
                <Image source={{ uri: store.image }} style={styles.storeImage} />

                {/* Badges */}
                <View style={styles.storeBadges}>
                  <View style={[styles.badge, { backgroundColor: store.badgeColor }]}>
                    <Text style={styles.badgeText}>{store.badge}</Text>
                  </View>
                  <View style={[styles.cashbackBadge, { backgroundColor: '#1E293B' }]}>
                    <Text style={styles.cashbackText}>{store.cashback} cashback</Text>
                  </View>
                </View>
              </View>

              {/* Store Info */}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeCategory}>{store.category}</Text>

                <View style={styles.storeDetails}>
                  <View style={styles.storeDetailItem}>
                    <MaterialIcons name="place" size={14} color="white" />
                    <Text style={styles.detailText}>{store.distance}</Text>
                  </View>
                  <View style={styles.storeDetailItem}>
                    <MaterialIcons name="star" size={14} color="white" />
                    <Text style={styles.detailText}>{store.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => setCurrentScreen(item.screen)}
          >
            <MaterialIcons
              name={item.icon as any}
              size={20}
              color={item.active ? '#5C8FFC' : '#9CA3AF'}
            />
            <Text style={[styles.navText, item.active && styles.navTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Mostrar loading enquanto verifica autenticação
  if (isLoadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>Carregando...</Text>
      </View>
    );
  }

  // Renderizar a tela baseada no estado de login e tela atual
  if (!authState.isLoggedIn) {
    if (authState.authScreen === 'register') {
      return <RegisterRoleScreen />;
    }
    if (authState.authScreen === 'register-client') {
      return <RegisterClientScreen />;
    }
    if (authState.authScreen === 'register-merchant') {
      return <RegisterMerchantScreen />;
    }
    return (
      <LoginScreenComponent
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
    return <ProfileScreen />;
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

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  // Login Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loginHeaderSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginLogoContainer: {
    marginBottom: 20,
  },
  loginLogoBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#5C8FFC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loginStarIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  loginWelcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  loginSubtitleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginFormCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginInputContainer: {
    marginBottom: 20,
  },
  loginInputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  loginPasswordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loginForgotPassword: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: '500',
  },
  loginInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loginTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  loginButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  loginDividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  loginSocialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loginSocialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    marginHorizontal: 6,
  },
  loginGoogleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 8,
  },
  loginFacebookIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1877F2',
    marginRight: 8,
  },
  loginSocialButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginFooterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginRegisterLink: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  // Register Role Selection Styles
  registerRoleContainer: {
    gap: 16,
    marginBottom: 30,
  },
  registerRoleCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  registerRoleCardSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#F0F7FF',
  },
  registerRoleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  registerRoleDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Register Form Styles
  registerGenderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  registerGenderOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  registerGenderOptionSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#F0F7FF',
  },
  registerGenderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerGenderTextSelected: {
    color: '#5C8FFC',
    fontWeight: '600',
  },
  registerAddressRow: {
    flexDirection: 'row',
    gap: 10,
  },
  // Home Screen Styles
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Header Styles
  header: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: 'white',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  // Main Content Styles
  mainContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeRankingLink: {
    fontSize: 14,
    color: '#60A5FA',
    fontWeight: '500',
  },
  // Categories Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '22%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Club Banner
  clubBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  clubContent: {
    alignItems: 'center',
  },
  clubIcon: {
    fontSize: 32,
    marginBottom: 12,
    color: '#60A5FA',
  },
  clubTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginBottom: 8,
  },
  clubDescription: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  clubButton: {
    backgroundColor: '#60A5FA',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  clubButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  promoBanner: {
    backgroundColor: '#5C8FFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  promoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoBannerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  promoBannerText: {
    flex: 1,
  },
  promoBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  promoBannerSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  promoBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  promoBannerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginRight: 6,
  },
  promoBannerButtonIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C8FFC',
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#9CA3AF',
  },
  navIconActive: {
    color: '#5C8FFC',
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#5C8FFC',
  },
  // Store Card Styles
  storeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  storeImageContainer: {
    position: 'relative',
    height: 160,
  },
  storeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storeBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  cashbackBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  storeInfo: {
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Ranking Screen Styles
  rankingHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  rankingHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 16,
    marginTop: 4,
  },
  rankingHeaderContent: {
    flex: 1,
  },
  rankingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  rankingSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  rankingTabs: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 4,
  },
  rankingTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  rankingTabActive: {
    backgroundColor: '#0F172A',
  },
  rankingTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  rankingTabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  rankingContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Top 3 Section Styles
  top3Section: {
    marginTop: 24,
    marginBottom: 32,
  },
  top3Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  top3Icon: {
    fontSize: 20,
    marginRight: 8,
  },
  top3Title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  top3Container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  top3Item: {
    alignItems: 'center',
    flex: 1,
  },
  top3Medal: {
    marginBottom: 8,
  },
  top3MedalIcon: {
    fontSize: 24,
  },
  top3Crown: {
    marginBottom: 8,
  },
  top3CrownIcon: {
    fontSize: 24,
  },
  top3Logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  top3LogoFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  top3LogoIcon: {
    fontSize: 24,
    color: 'white',
  },
  top3Badge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  top3BadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  top3StoreName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  top3Sales: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Ranking List Styles
  rankingList: {
    marginBottom: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rankingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingCrownIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  rankingMedalIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  rankingPosition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginRight: 12,
    minWidth: 32,
  },
  rankingItemLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankingItemLogoIcon: {
    fontSize: 18,
    color: 'white',
  },
  rankingItemInfo: {
    flex: 1,
  },
  rankingItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  rankingItemCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  rankingItemSales: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  rankingItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingItemRatingText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  rankingStarIcon: {
    fontSize: 12,
  },
  rankingCashback: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rankingCashbackPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  rankingCashbackText: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
  },
  // Compare Screen Styles
  compareHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  compareHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  compareHeaderContent: {
    flex: 1,
    alignItems: 'center',
  },
  compareTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  compareSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  compareContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Search Section Styles
  searchSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  compareSearchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#9CA3AF',
  },
  compareSearchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 6,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  aiSearchBox: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  aiSearchIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  aiSearchContent: {
    flex: 1,
  },
  aiSearchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  aiSearchDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  // Results Section Styles
  resultsSection: {
    marginTop: 24,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  resultsProduct: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Compare Card Styles
  compareCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compareCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bestOfferBadge: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bestOfferText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  compareCardHeaderRight: {
    alignItems: 'flex-end',
  },
  compareCashbackBadge: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compareStoreInfo: {
    marginBottom: 16,
  },
  compareStoreName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  compareStoreDetails: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Price Details Styles
  priceDetails: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  cashbackValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  priceSeparator: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 12,
  },
  finalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  finalPriceLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  finalPriceValue: {
    fontSize: 18,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  viewStoreButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewStoreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Wallet Screen Styles
  walletHeader: {
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  walletHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  walletContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Balance Card Styles
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  balanceExpiry: {
    fontSize: 14,
    color: 'white',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyCashbackButton: {
    flex: 1,
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  buyCashbackIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buyCashbackText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  viewVouchersButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  viewVouchersText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  // Stats Cards Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  // Distribution Section Styles
  distributionSection: {
    marginBottom: 24,
  },
  distributionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionDotFree: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5C8FFC',
    marginRight: 12,
  },
  distributionDotSpecific: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9CA3AF',
    marginRight: 12,
  },
  distributionText: {
    fontSize: 14,
    color: 'white',
  },
  distributionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  // History Section Styles
  historySection: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  transactionExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionAmountReceived: {
    color: '#10B981',
  },
  transactionAmountUsed: {
    color: '#EF4444',
  },
  transactionStatus: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  transactionStatusDefault: {
    backgroundColor: '#374151',
  },
  transactionStatusPurchased: {
    backgroundColor: '#5C8FFC',
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  // Buy Cashback Screen Styles
  buyCashbackHeader: {
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buyCashbackHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyCashbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  buyCashbackContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Info Card Styles
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  // Package Section Styles
  packageSection: {
    marginBottom: 24,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  packageCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  packageCardPopular: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  packageAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 16,
    color: '#5C8FFC',
    marginBottom: 4,
  },
  packageBonus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  // Payment Section Styles
  paymentSection: {
    marginBottom: 24,
  },
  paymentMethodCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodCardSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentMethodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  paymentMethodRadioSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#5C8FFC',
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  summaryBonusValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 18,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  // Buy Button Styles
  buyButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Vouchers Screen Styles
  vouchersHeader: {
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  vouchersHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vouchersTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  vouchersTabs: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 4,
  },
  vouchersTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  vouchersTabActive: {
    backgroundColor: '#1E293B',
  },
  vouchersTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  vouchersTabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  vouchersContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Voucher Card Styles
  voucherCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  voucherIconText: {
    fontSize: 20,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherStoreName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  voucherDiscount: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  voucherDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  voucherExpiry: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 2,
  },
  voucherMinValue: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  voucherUsedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  voucherRight: {
    alignItems: 'flex-end',
  },
  useVoucherButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  useVoucherButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  usedBadge: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  usedBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  // Store Detail Screen Styles
  storeDetailHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeDetailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  shareIcon: {
    fontSize: 20,
    color: 'white',
  },
  storeDetailImageContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  storeDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storeDetailBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeDetailContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  storeInfoSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  storeDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  storeDetailCategory: {
    fontSize: 16,
    color: '#5C8FFC',
    marginBottom: 12,
  },
  storeDetailDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 20,
  },
  storeDetailItems: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  storeDetailItemIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  storeDetailItemText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  storeActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  storeActionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  storeActionButtonPrimary: {
    flex: 2,
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  storeActionButtonIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  storeActionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  storeActionButtonTextPrimary: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  productsPreviewSection: {
    marginBottom: 20,
  },
  productsPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  seeAllProductsLink: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: '500',
  },
  productPreviewCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 150,
  },
  productPreviewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productPreviewName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  productPreviewPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPreviewCurrentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginRight: 8,
  },
  productPreviewOriginalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productPreviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPreviewRatingText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  productPreviewReviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Store Products Screen Styles
  storeProductsHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeProductsHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  filterIcon: {
    fontSize: 20,
    color: 'white',
  },
  categoriesFilter: {
    marginBottom: 8,
  },
  categoryFilterItem: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryFilterItemActive: {
    backgroundColor: '#0F172A',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  storeProductsContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCurrentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginRight: 8,
  },
  productOriginalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRatingText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  productReviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  productCashback: {
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  productCashbackText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  // Product Detail Screen Styles
  productDetailHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productDetailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
    color: 'white',
  },
  productDetailContent: {
    flex: 1,
    backgroundColor: '#000000',
  },
  productDetailImageContainer: {
    height: 300,
    backgroundColor: '#1A1A1A',
  },
  productDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetailInfo: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  productDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  productDetailCategory: {
    fontSize: 16,
    color: '#5C8FFC',
    marginBottom: 12,
  },
  productDetailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productDetailRatingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
  },
  productDetailReviewsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  productDetailPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productDetailCurrentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginRight: 12,
  },
  productDetailOriginalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  productDetailDiscount: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productDetailDiscountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  productDetailCashback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  productDetailCashbackIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  productDetailCashbackText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  productDetailSection: {
    marginBottom: 24,
  },
  productDetailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sizeOptionSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  sizeOptionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  sizeOptionTextSelected: {
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  colorOptionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  colorOptionTextSelected: {
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 20,
  },
  productDetailDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  productDetailBottomBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  productDetailTotal: {
    flex: 1,
  },
  productDetailTotalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  productDetailTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  productDetailCashbackAmount: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  addToCartButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Checkout Screen Styles
  checkoutHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  checkoutHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  checkoutContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  checkoutProductSummary: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  checkoutProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  checkoutProductInfo: {
    flex: 1,
  },
  checkoutProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  checkoutProductCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  checkoutProductPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C8FFC',
  },
  checkoutStoreInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  checkoutStoreName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  checkoutStoreAddress: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  checkoutStoreCashback: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  checkoutPaymentSection: {
    marginBottom: 20,
  },
  checkoutSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  checkoutPaymentMethod: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  checkoutPaymentMethodSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  checkoutPaymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkoutPaymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  checkoutPaymentMethodInfo: {
    flex: 1,
  },
  checkoutPaymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  checkoutPaymentMethodDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkoutPaymentMethodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  checkoutPaymentMethodRadioSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#5C8FFC',
  },
  checkoutCashbackSection: {
    marginBottom: 20,
  },
  checkoutCashbackToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  checkoutCashbackToggleText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  checkoutToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  checkoutToggleActive: {
    backgroundColor: '#5C8FFC',
  },
  checkoutToggleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  checkoutToggleButtonActive: {
    alignSelf: 'flex-end',
  },
  checkoutCashbackAmount: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  checkoutCashbackAmountLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  checkoutCashbackAmountInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: '#374151',
  },
  checkoutOrderSummary: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  checkoutSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkoutSummaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  checkoutSummaryValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  checkoutSummaryDiscount: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  checkoutSummaryDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  checkoutSummaryTotalLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  checkoutSummaryTotalValue: {
    fontSize: 18,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  checkoutSummaryCashback: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  checkoutBottomBar: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  checkoutButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Error Screen Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Profile Screen Styles
  profileHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsIcon: {
    fontSize: 24,
    color: 'white',
  },
  profileInfoSection: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileAvatarIcon: {
    fontSize: 40,
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  profileStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'white',
    opacity: 0.3,
  },
  profileContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  achievementsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: {
    fontSize: 24,
  },
  menuCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  // My Purchases Screen Styles
  purchasesHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  purchasesHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  purchasesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  purchasesContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  purchasesSummary: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  purchasesSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  purchasesSummaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2D3748',
    marginHorizontal: 20,
  },
  purchasesSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  purchasesSummaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  purchasesList: {
    marginBottom: 20,
  },
  purchasesListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  purchaseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  purchaseCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  purchaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  purchaseIconText: {
    fontSize: 22,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  purchaseDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  purchaseStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  purchaseStatusCompleted: {
    backgroundColor: '#10B981',
  },
  purchaseStatusPending: {
    backgroundColor: '#F59E0B',
  },
  purchaseStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  purchaseCardRight: {
    alignItems: 'flex-end',
  },
  purchaseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  purchaseCashback: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981',
  },
  // Promotions Screen Styles
  promotionsHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  promotionsHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promotionsHeaderContent: {
    flex: 1,
    alignItems: 'center',
  },
  promotionsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  promotionsSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  promotionsContent: {
    flex: 1,
    backgroundColor: '#000000',
  },
  promoCategoriesContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  promoCategoriesContent: {
    paddingRight: 20,
  },
  promoCategoryCard: {
    width: 90,
    height: 110,
    backgroundColor: '#5C8FFC',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCategoryCardActive: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#5C8FFC',
  },
  promoCategoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  promoCategoryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  promoCategoryCountActive: {
    color: '#5C8FFC',
  },
  promoCategoryName: {
    fontSize: 11,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  promoCategoryNameActive: {
    fontWeight: 'bold',
  },
  promotionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  promotionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  promotionImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  promotionImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotionImageIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  promotionBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promotionBadgeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  promotionBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  promotionTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  promotionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  promotionSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  promotionCashbackIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(92, 143, 252, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promotionCashbackText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  promotionDescription: {
    padding: 16,
  },
  promotionDescriptionText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
    marginBottom: 12,
  },
  promotionTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionTimerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  promotionTimerText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  promotionButton: {
    backgroundColor: '#5C8FFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  promotionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  promotionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});