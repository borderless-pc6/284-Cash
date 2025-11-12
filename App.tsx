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

// Interface para props do RegisterClientScreen
interface RegisterClientScreenProps {
  registerName: string;
  registerEmail: string;
  registerCpf: string;
  registerBirthDate: string;
  registerGender: Gender;
  registerStreet: string;
  registerNumber: string;
  registerComplement: string;
  registerNeighborhood: string;
  registerCity: string;
  registerState: string;
  registerZipCode: string;
  registerPassword: string;
  registerConfirmPassword: string;
  onNameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onCpfChange: (text: string) => void;
  onBirthDateChange: (text: string) => void;
  onGenderChange: (gender: Gender) => void;
  onStreetChange: (text: string) => void;
  onNumberChange: (text: string) => void;
  onComplementChange: (text: string) => void;
  onNeighborhoodChange: (text: string) => void;
  onCityChange: (text: string) => void;
  onStateChange: (text: string) => void;
  onZipCodeChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onRegister: () => void;
  onBack: () => void;
  onBackToLogin: () => void;
  styles: any;
}

// Interface para props do RegisterMerchantScreen
interface RegisterMerchantScreenProps {
  registerName: string;
  registerEmail: string;
  registerCpf: string;
  registerPassword: string;
  registerConfirmPassword: string;
  onNameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onCpfChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onRegister: () => void;
  onBack: () => void;
  onBackToLogin: () => void;
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

// Componente da Tela de Cadastro de Cliente (fora do App para evitar recriações)
const RegisterClientScreen = memo(({
  registerName,
  registerEmail,
  registerCpf,
  registerBirthDate,
  registerGender,
  registerStreet,
  registerNumber,
  registerComplement,
  registerNeighborhood,
  registerCity,
  registerState,
  registerZipCode,
  registerPassword,
  registerConfirmPassword,
  onNameChange,
  onEmailChange,
  onCpfChange,
  onBirthDateChange,
  onGenderChange,
  onStreetChange,
  onNumberChange,
  onComplementChange,
  onNeighborhoodChange,
  onCityChange,
  onStateChange,
  onZipCodeChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRegister,
  onBack,
  onBackToLogin,
  styles
}: RegisterClientScreenProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <ScrollView style={styles.loginContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header Section */}
      <View style={styles.loginHeaderSection}>
        <TouchableOpacity
          onPress={onBack}
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
              key="register-name"
              style={styles.loginTextInput}
              placeholder="Seu nome completo"
              placeholderTextColor="#9CA3AF"
              value={registerName}
              onChangeText={onNameChange}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.loginInputContainer}>
          <Text style={styles.loginInputLabel}>E-mail *</Text>
          <View style={styles.loginInputWrapper}>
            <MaterialIcons name="email" size={18} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              key="register-email-client"
              style={styles.loginTextInput}
              placeholder="seu@email.com"
              placeholderTextColor="#9CA3AF"
              value={registerEmail}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* CPF */}
        <View style={styles.loginInputContainer}>
          <Text style={styles.loginInputLabel}>CPF *</Text>
          <View style={styles.loginInputWrapper}>
            <MaterialIcons name="badge" size={18} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              key="register-cpf"
              style={styles.loginTextInput}
              placeholder="000.000.000-00"
              placeholderTextColor="#9CA3AF"
              value={registerCpf}
              onChangeText={onCpfChange}
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
              key="register-birthdate"
              style={styles.loginTextInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9CA3AF"
              value={registerBirthDate}
              onChangeText={onBirthDateChange}
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
                onPress={() => onGenderChange(gender)}
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
              key="register-street"
              style={styles.loginTextInput}
              placeholder="Nome da rua"
              placeholderTextColor="#9CA3AF"
              value={registerStreet}
              onChangeText={onStreetChange}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Número e Complemento */}
        <View style={styles.registerAddressRow}>
          <View style={[styles.loginInputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.loginInputLabel}>Número *</Text>
            <View style={styles.loginInputWrapper}>
              <TextInput
                key="register-number"
                style={styles.loginTextInput}
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                value={registerNumber}
                onChangeText={onNumberChange}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={[styles.loginInputContainer, { flex: 1 }]}>
            <Text style={styles.loginInputLabel}>Complemento</Text>
            <View style={styles.loginInputWrapper}>
              <TextInput
                key="register-complement"
                style={styles.loginTextInput}
                placeholder="Apto, Bloco..."
                placeholderTextColor="#9CA3AF"
                value={registerComplement}
                onChangeText={onComplementChange}
                autoCapitalize="words"
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
              key="register-neighborhood"
              style={styles.loginTextInput}
              placeholder="Nome do bairro"
              placeholderTextColor="#9CA3AF"
              value={registerNeighborhood}
              onChangeText={onNeighborhoodChange}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Cidade e Estado */}
        <View style={styles.registerAddressRow}>
          <View style={[styles.loginInputContainer, { flex: 2, marginRight: 10 }]}>
            <Text style={styles.loginInputLabel}>Cidade *</Text>
            <View style={styles.loginInputWrapper}>
              <TextInput
                key="register-city"
                style={styles.loginTextInput}
                placeholder="Cidade"
                placeholderTextColor="#9CA3AF"
                value={registerCity}
                onChangeText={onCityChange}
                autoCapitalize="words"
              />
            </View>
          </View>
          <View style={[styles.loginInputContainer, { flex: 1 }]}>
            <Text style={styles.loginInputLabel}>UF *</Text>
            <View style={styles.loginInputWrapper}>
              <TextInput
                key="register-state"
                style={styles.loginTextInput}
                placeholder="SP"
                placeholderTextColor="#9CA3AF"
                value={registerState}
                onChangeText={onStateChange}
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
              key="register-zipcode"
              style={styles.loginTextInput}
              placeholder="00000-000"
              placeholderTextColor="#9CA3AF"
              value={registerZipCode}
              onChangeText={onZipCodeChange}
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
              key="register-password-client"
              style={styles.loginTextInput}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              value={registerPassword}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
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
              key="register-confirm-password-client"
              style={styles.loginTextInput}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#9CA3AF"
              value={registerConfirmPassword}
              onChangeText={onConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
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
        <TouchableOpacity style={styles.loginButton} onPress={onRegister}>
          <Text style={styles.loginButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.loginFooter}>
        <Text style={styles.loginFooterText}>Já tem uma conta? </Text>
        <TouchableOpacity onPress={onBackToLogin}>
          <Text style={styles.loginRegisterLink}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});

// Componente da Tela de Cadastro de Lojista (fora do App para evitar recriações)
const RegisterMerchantScreen = memo(({
  registerName,
  registerEmail,
  registerCpf,
  registerPassword,
  registerConfirmPassword,
  onNameChange,
  onEmailChange,
  onCpfChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRegister,
  onBack,
  onBackToLogin,
  styles
}: RegisterMerchantScreenProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <ScrollView style={styles.loginContainer} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Header Section */}
      <View style={styles.loginHeaderSection}>
        <TouchableOpacity
          onPress={onBack}
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
              key="register-name-merchant"
              style={styles.loginTextInput}
              placeholder="Nome da sua loja"
              placeholderTextColor="#9CA3AF"
              value={registerName}
              onChangeText={onNameChange}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.loginInputContainer}>
          <Text style={styles.loginInputLabel}>E-mail *</Text>
          <View style={styles.loginInputWrapper}>
            <MaterialIcons name="email" size={18} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              key="register-email-merchant"
              style={styles.loginTextInput}
              placeholder="seu@email.com"
              placeholderTextColor="#9CA3AF"
              value={registerEmail}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* CPF/CNPJ */}
        <View style={styles.loginInputContainer}>
          <Text style={styles.loginInputLabel}>CPF/CNPJ *</Text>
          <View style={styles.loginInputWrapper}>
            <MaterialIcons name="badge" size={18} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              key="register-cpf-merchant"
              style={styles.loginTextInput}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              placeholderTextColor="#9CA3AF"
              value={registerCpf}
              onChangeText={onCpfChange}
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
              key="register-password-merchant"
              style={styles.loginTextInput}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              value={registerPassword}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
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
              key="register-confirm-password-merchant"
              style={styles.loginTextInput}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#9CA3AF"
              value={registerConfirmPassword}
              onChangeText={onConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
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
        <TouchableOpacity style={styles.loginButton} onPress={onRegister}>
          <Text style={styles.loginButtonText}>Cadastrar Loja</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.loginFooter}>
        <Text style={styles.loginFooterText}>Já tem uma conta? </Text>
        <TouchableOpacity onPress={onBackToLogin}>
          <Text style={styles.loginRegisterLink}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});

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

  // Callbacks estáveis para mudanças de tela
  const handleBackToRegister = useCallback(() => {
    setAuthState(prev => ({ ...prev, authScreen: 'register' }));
  }, []);

  const handleBackToLogin = useCallback(() => {
    setAuthState(prev => ({ ...prev, authScreen: 'login' }));
  }, []);

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
  // Função para carregar loja do usuário
  const loadUserStore = useCallback(async () => {
    const user = authState.user;
    if (!user || !user.id) {
      setIsLoadingStore(false);
      setUserStore(null);
      return;
    }

    setIsLoadingStore(true);
    try {
      const stores = await getStoresByOwner(user.id);
      if (stores.length > 0) {
        setUserStore(stores[0]);
        // Carregar produtos da loja
        const products = await getProductsByStore(stores[0].id || '');
        setUserProducts(products || []);
      } else {
        // Não tem loja, limpar estado
        setUserStore(null);
        setUserProducts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar loja:', error);
      setUserStore(null);
      setUserProducts([]);
    } finally {
      setIsLoadingStore(false);
    }
  }, [authState.user]);

  // Carregar loja quando o usuário estiver logado e for lojista
  useEffect(() => {
    const user = authState.user;
    const isLojista = user?.role === 'lojista' || user?.permissionLevel === 'lojista';
    if (authState.isLoggedIn && isLojista) {
      loadUserStore();
    }
  }, [authState.isLoggedIn, authState.user, loadUserStore]);

  // Tela de Gerenciamento de Loja
  const ManageStoreScreen = () => {
    const user = authState.user;
    const [storeName, setStoreName] = useState('');
    const [storeCategory, setStoreCategory] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [storeEmail, setStoreEmail] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Atualizar campos quando userStore for carregado
    useEffect(() => {
      if (userStore) {
        setStoreName(userStore.name || '');
        setStoreCategory(userStore.category || '');
        setStoreAddress(userStore.address || '');
        setStorePhone(userStore.phone || '');
        setStoreEmail(userStore.email || '');
        setStoreDescription(userStore.description || '');
      }
    }, [userStore]);

    const handleSaveStore = async () => {
      if (!user || !user.id) {
        Alert.alert('Erro', 'Usuário não encontrado');
        return;
      }

      if (!storeName.trim()) {
        Alert.alert('Erro', 'O nome da loja é obrigatório');
        return;
      }

      setIsSaving(true);
      try {
        if (userStore?.id) {
          // Atualizar loja existente
          const success = await updateStore(userStore.id, {
            name: storeName,
            category: storeCategory,
            address: storeAddress,
            phone: storePhone,
            email: storeEmail,
            description: storeDescription,
          });
          if (success) {
            Alert.alert('Sucesso', 'Loja atualizada com sucesso!');
            await loadUserStore();
            setProfileSubScreen(null);
          } else {
            Alert.alert('Erro', 'Erro ao atualizar loja');
          }
        } else {
          // Criar nova loja
          const storeId = await createStore({
            name: storeName,
            ownerId: user.id,
            category: storeCategory,
            address: storeAddress,
            phone: storePhone,
            email: storeEmail,
            description: storeDescription,
            isActive: true,
          });
          if (storeId) {
            Alert.alert('Sucesso', 'Loja criada com sucesso!');
            await loadUserStore();
            setProfileSubScreen(null);
          } else {
            Alert.alert('Erro', 'Erro ao criar loja');
          }
        }
      } catch (error) {
        console.error('Erro ao salvar loja:', error);
        Alert.alert('Erro', 'Erro ao salvar loja');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <TouchableOpacity onPress={() => setProfileSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>Gerenciar Loja</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
          <View style={styles.menuCard}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome da Loja *</Text>
              <TextInput
                style={styles.formInput}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="Digite o nome da loja"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoria</Text>
              <TextInput
                style={styles.formInput}
                value={storeCategory}
                onChangeText={setStoreCategory}
                placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Endereço</Text>
              <TextInput
                style={styles.formInput}
                value={storeAddress}
                onChangeText={setStoreAddress}
                placeholder="Digite o endereço da loja"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Telefone</Text>
              <TextInput
                style={styles.formInput}
                value={storePhone}
                onChangeText={setStorePhone}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>E-mail</Text>
              <TextInput
                style={styles.formInput}
                value={storeEmail}
                onChangeText={setStoreEmail}
                placeholder="contato@loja.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, { minHeight: 100, textAlignVertical: 'top' }]}
                value={storeDescription}
                onChangeText={setStoreDescription}
                placeholder="Descreva sua loja..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
              onPress={handleSaveStore}
              disabled={isSaving}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Salvando...' : userStore?.id ? 'Atualizar Loja' : 'Criar Loja'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Tela de Gerenciamento de Produtos (MOCKADA)
  const ManageProductsScreen = () => {
    // Dados mockados para desenvolvimento
    const [mockProducts] = useState<FirestoreProductData[]>([
      {
        id: '1',
        storeId: userStore?.id || 'mock-store',
        name: 'Produto Exemplo 1',
        description: 'Descrição do produto exemplo',
        price: 99.90,
        originalPrice: 149.90,
        category: 'Eletrônicos',
        stock: 10,
        isActive: true,
        rating: 4.5,
        reviewsCount: 23,
      },
      {
        id: '2',
        storeId: userStore?.id || 'mock-store',
        name: 'Produto Exemplo 2',
        description: 'Outro produto de exemplo',
        price: 199.90,
        category: 'Roupas',
        stock: 5,
        isActive: true,
        rating: 4.8,
        reviewsCount: 15,
      },
    ]);

    const [localProducts, setLocalProducts] = useState<FirestoreProductData[]>(mockProducts);

    // Função de voltar
    const handleGoBack = useCallback(() => {
      setProfileSubScreen(null);
    }, []);

    const handleDeleteProduct = (productId: string) => {
      Alert.alert(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir este produto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
            },
          },
        ]
      );
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <TouchableOpacity 
              onPress={handleGoBack}
              style={{ zIndex: 1000, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={0.7}
              disabled={false}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>Meus Produtos</Text>
            <TouchableOpacity 
              onPress={() => {
                if (!userStore?.id) {
                  Alert.alert('Aviso', 'Você precisa criar uma loja primeiro');
                  return;
                }
                setEditingProduct(null);
                setProfileSubScreen('add-product');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.profileContent} 
          showsVerticalScrollIndicator={false}
        >
          {localProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory" size={64} color="#6B7280" />
              <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setEditingProduct(null);
                  setProfileSubScreen('add-product');
                }}
              >
                <Text style={styles.primaryButtonText}>Adicionar Primeiro Produto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Header com estatísticas */}
              <View style={styles.productsHeader}>
                <View style={styles.productsStatsCard}>
                  <View style={styles.productsStatItem}>
                    <MaterialIcons name="inventory" size={20} color="#5C8FFC" />
                    <View style={styles.productsStatText}>
                      <Text style={styles.productsStatValue}>{localProducts.length}</Text>
                      <Text style={styles.productsStatLabel}>
                        {localProducts.length === 1 ? 'Produto' : 'Produtos'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.productsStatDivider} />
                  <View style={styles.productsStatItem}>
                    <MaterialIcons name="check-circle" size={20} color="#10B981" />
                    <View style={styles.productsStatText}>
                      <Text style={styles.productsStatValue}>
                        {localProducts.filter(p => p.isActive).length}
                      </Text>
                      <Text style={styles.productsStatLabel}>Ativos</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Lista de produtos */}
              <View style={styles.productsList}>
                {localProducts.map((product, index) => (
                  <View key={product.id} style={styles.manageProductCard}>
                    {/* Badge de status */}
                    {product.isActive && (
                      <View style={styles.productStatusBadge}>
                        <MaterialIcons name="check-circle" size={12} color="#10B981" />
                        <Text style={[styles.productStatusText, { marginLeft: 4 }]}>Ativo</Text>
                      </View>
                    )}
                    
                    <View style={styles.productCardContent}>
                      <View style={styles.productCardLeft}>
                        <View style={styles.productHeaderRow}>
                          <Text style={styles.productCardName}>{product.name}</Text>
                        </View>
                        
                        {product.category && (
                          <View style={styles.productCategoryBadge}>
                            <Text style={styles.productCategoryText}>{product.category}</Text>
                          </View>
                        )}

                        <View style={styles.productPriceRow}>
                          <Text style={styles.productCardPrice}>
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </Text>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <View style={styles.productDiscountContainer}>
                              <Text style={styles.productCardOriginalPrice}>
                                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                              </Text>
                              <View style={{ marginLeft: 8 }}>
                                <View style={styles.productDiscountBadge}>
                                  <Text style={styles.productDiscountText}>
                                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>

                        {product.stock !== undefined && (
                          <View style={styles.productStockRow}>
                            <MaterialIcons name="inventory-2" size={14} color="#9CA3AF" />
                            <Text style={[styles.productCardStock, { marginLeft: 6 }]}>
                              {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'} em estoque
                            </Text>
                          </View>
                        )}

                        {product.rating && (
                          <View style={styles.productRatingRow}>
                            <MaterialIcons name="star" size={14} color="#FBBF24" />
                            <Text style={[styles.productRatingText, { marginLeft: 4 }]}>
                              {product.rating.toFixed(1)} ({product.reviewsCount || 0} avaliações)
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.productCardRight}>
                        <TouchableOpacity
                          style={[styles.productActionButton, styles.productEditButton, { marginBottom: 8 }]}
                          onPress={() => {
                            setEditingProduct(product);
                            setProfileSubScreen('add-product');
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="edit" size={18} color="#5C8FFC" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.productActionButton, styles.productDeleteButton]}
                          onPress={() => product.id && handleDeleteProduct(product.id)}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="delete" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  // Tela de Pedidos (MOCKADA)
  const OrdersScreen = () => {
    // Dados mockados de pedidos de produtos físicos
    const [orders] = useState([
      {
        id: '1',
        orderNumber: '#ORD-2024-001',
        customerName: 'João Silva',
        customerEmail: 'joao@email.com',
        shippingAddress: 'Rua das Flores, 123 - São Paulo, SP',
        items: [
          { name: 'Camiseta Básica Preta', quantity: 2, price: 99.90, size: 'M' },
          { name: 'Tênis Esportivo', quantity: 1, price: 299.90, size: '42' },
        ],
        total: 499.70,
        status: 'pending', // pending, confirmed, processing, shipped, delivered, cancelled
        paymentMethod: 'PIX',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        notes: 'Entregar na portaria',
      },
      {
        id: '2',
        orderNumber: '#ORD-2024-002',
        customerName: 'Maria Santos',
        customerEmail: 'maria@email.com',
        shippingAddress: 'Av. Paulista, 1000 - São Paulo, SP',
        items: [
          { name: 'Vestido Floral', quantity: 1, price: 199.90, size: 'P' },
        ],
        total: 199.90,
        status: 'confirmed',
        paymentMethod: 'Cartão',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
        notes: '',
      },
      {
        id: '3',
        orderNumber: '#ORD-2024-003',
        customerName: 'Pedro Oliveira',
        customerEmail: 'pedro@email.com',
        shippingAddress: 'Rua Augusta, 500 - São Paulo, SP',
        items: [
          { name: 'Calça Jeans', quantity: 2, price: 249.90, size: 'G' },
        ],
        total: 499.80,
        status: 'processing',
        paymentMethod: 'PIX',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        notes: 'Cliente preferiu retirar na loja',
      },
      {
        id: '4',
        orderNumber: '#ORD-2024-004',
        customerName: 'Ana Costa',
        customerEmail: 'ana@email.com',
        shippingAddress: 'Rua Consolação, 200 - São Paulo, SP',
        items: [
          { name: 'Blusa de Moletom', quantity: 1, price: 149.90, size: 'M' },
          { name: 'Shorts Esportivo', quantity: 1, price: 89.90, size: 'M' },
        ],
        total: 239.80,
        status: 'shipped',
        paymentMethod: 'Cartão',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        trackingCode: 'BR123456789BR',
        notes: '',
      },
      {
        id: '5',
        orderNumber: '#ORD-2024-005',
        customerName: 'Carlos Mendes',
        customerEmail: 'carlos@email.com',
        shippingAddress: 'Av. Faria Lima, 1500 - São Paulo, SP',
        items: [
          { name: 'Tênis Casual', quantity: 1, price: 399.90, size: '43' },
        ],
        total: 399.90,
        status: 'delivered',
        paymentMethod: 'PIX',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        notes: '',
      },
    ]);

    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const filteredOrders = filterStatus 
      ? orders.filter(order => order.status === filterStatus)
      : orders;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return '#F59E0B';
        case 'confirmed': return '#3B82F6';
        case 'processing': return '#8B5CF6';
        case 'shipped': return '#10B981';
        case 'delivered': return '#059669';
        case 'cancelled': return '#DC2626';
        default: return '#6B7280';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'pending': return 'Aguardando Pagamento';
        case 'confirmed': return 'Confirmado';
        case 'processing': return 'Em Separação';
        case 'shipped': return 'Enviado';
        case 'delivered': return 'Entregue';
        case 'cancelled': return 'Cancelado';
        default: return status;
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return 'schedule';
        case 'confirmed': return 'check-circle';
        case 'processing': return 'inventory';
        case 'shipped': return 'local-shipping';
        case 'delivered': return 'done-all';
        case 'cancelled': return 'cancel';
        default: return 'help';
      }
    };

    const formatDate = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
      } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
      } else {
        return 'Agora';
      }
    };

    const handleGoBack = useCallback(() => {
      setProfileSubScreen(null);
    }, []);

    const handleUpdateStatus = (orderId: string, newStatus: string) => {
      Alert.alert(
        'Atualizar Status',
        `Deseja atualizar o status do pedido para "${getStatusLabel(newStatus)}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => {
              Alert.alert('Sucesso', 'Status atualizado! (Mockado)');
            },
          },
        ]
      );
    };

    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <TouchableOpacity 
              onPress={handleGoBack}
              style={{ zIndex: 1000, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>Pedidos</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
          {/* Estatísticas rápidas */}
          <View style={styles.ordersStatsContainer}>
            <View style={styles.ordersStatCard}>
              <MaterialIcons name="schedule" size={20} color="#F59E0B" />
              <Text style={styles.ordersStatValue}>{statusCounts.pending}</Text>
              <Text style={styles.ordersStatLabel}>Aguardando</Text>
            </View>
            <View style={styles.ordersStatCard}>
              <MaterialIcons name="inventory" size={20} color="#8B5CF6" />
              <Text style={styles.ordersStatValue}>{statusCounts.processing}</Text>
              <Text style={styles.ordersStatLabel}>Em Separação</Text>
            </View>
            <View style={styles.ordersStatCard}>
              <MaterialIcons name="local-shipping" size={20} color="#10B981" />
              <Text style={styles.ordersStatValue}>{statusCounts.shipped}</Text>
              <Text style={styles.ordersStatLabel}>Enviados</Text>
            </View>
          </View>

          {/* Filtros */}
          <View style={styles.ordersFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ordersFilters}>
              <TouchableOpacity
                style={[styles.ordersFilterButton, !filterStatus && styles.ordersFilterButtonActive]}
                onPress={() => setFilterStatus(null)}
              >
                <Text style={[styles.ordersFilterText, !filterStatus && styles.ordersFilterTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ordersFilterButton, filterStatus === 'pending' && styles.ordersFilterButtonActive]}
                onPress={() => setFilterStatus('pending')}
              >
                <Text style={[styles.ordersFilterText, filterStatus === 'pending' && styles.ordersFilterTextActive]}>
                  Pendentes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ordersFilterButton, filterStatus === 'confirmed' && styles.ordersFilterButtonActive]}
                onPress={() => setFilterStatus('confirmed')}
              >
                <Text style={[styles.ordersFilterText, filterStatus === 'confirmed' && styles.ordersFilterTextActive]}>
                  Confirmados
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ordersFilterButton, filterStatus === 'processing' && styles.ordersFilterButtonActive]}
                onPress={() => setFilterStatus('processing')}
              >
                <Text style={[styles.ordersFilterText, filterStatus === 'processing' && styles.ordersFilterTextActive]}>
                  Em Separação
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ordersFilterButton, filterStatus === 'shipped' && styles.ordersFilterButtonActive]}
                onPress={() => setFilterStatus('shipped')}
              >
                <Text style={[styles.ordersFilterText, filterStatus === 'shipped' && styles.ordersFilterTextActive]}>
                  Enviados
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Lista de pedidos */}
          <View style={styles.ordersList}>
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="receipt" size={64} color="#6B7280" />
                <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
              </View>
            ) : (
              filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View style={styles.orderCardHeaderLeft}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    </View>
                    <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                      <MaterialIcons 
                        name={getStatusIcon(order.status) as any} 
                        size={14} 
                        color={getStatusColor(order.status)} 
                      />
                      <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                        {getStatusLabel(order.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderCustomerInfo}>
                    <MaterialIcons name="person" size={16} color="#9CA3AF" />
                    <Text style={styles.orderCustomerName}>{order.customerName}</Text>
                  </View>

                  <View style={styles.orderItemsContainer}>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.orderItem}>
                        <View style={styles.orderItemLeft}>
                          <Text style={styles.orderItemName}>
                            {item.quantity}x {item.name}
                          </Text>
                          {item.size && (
                            <Text style={styles.orderItemSize}>Tamanho: {item.size}</Text>
                          )}
                        </View>
                        <Text style={styles.orderItemPrice}>
                          R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {order.shippingAddress && (
                    <View style={styles.orderShippingAddress}>
                      <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
                      <Text style={styles.orderShippingAddressText}>{order.shippingAddress}</Text>
                    </View>
                  )}

                  {order.trackingCode && (
                    <View style={styles.orderTracking}>
                      <MaterialIcons name="local-shipping" size={16} color="#5C8FFC" />
                      <Text style={styles.orderTrackingLabel}>Código de Rastreamento:</Text>
                      <Text style={styles.orderTrackingCode}>{order.trackingCode}</Text>
                    </View>
                  )}

                  {order.notes && (
                    <View style={styles.orderNotes}>
                      <MaterialIcons name="note" size={14} color="#9CA3AF" />
                      <Text style={styles.orderNotesText}>{order.notes}</Text>
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <View style={styles.orderPaymentInfo}>
                      <MaterialIcons 
                        name={order.paymentMethod === 'PIX' ? 'account-balance-wallet' : 'credit-card'} 
                        size={16} 
                        color="#9CA3AF" 
                      />
                      <Text style={styles.orderPaymentText}>{order.paymentMethod}</Text>
                    </View>
                    <Text style={styles.orderTotal}>
                      Total: R$ {order.total.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>

                  {/* Botões de ação */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <View style={styles.orderActions}>
                      {order.status === 'pending' && (
                        <TouchableOpacity
                          style={[styles.orderActionButton, { backgroundColor: '#3B82F6' }]}
                          onPress={() => handleUpdateStatus(order.id, 'confirmed')}
                        >
                          <MaterialIcons name="check" size={16} color="white" />
                          <Text style={styles.orderActionButtonText}>Confirmar Pagamento</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'confirmed' && (
                        <TouchableOpacity
                          style={[styles.orderActionButton, { backgroundColor: '#8B5CF6' }]}
                          onPress={() => handleUpdateStatus(order.id, 'processing')}
                        >
                          <MaterialIcons name="inventory" size={16} color="white" />
                          <Text style={styles.orderActionButtonText}>Iniciar Separação</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'processing' && (
                        <TouchableOpacity
                          style={[styles.orderActionButton, { backgroundColor: '#10B981' }]}
                          onPress={() => handleUpdateStatus(order.id, 'shipped')}
                        >
                          <MaterialIcons name="local-shipping" size={16} color="white" />
                          <Text style={styles.orderActionButtonText}>Marcar como Enviado</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'shipped' && (
                        <TouchableOpacity
                          style={[styles.orderActionButton, { backgroundColor: '#059669' }]}
                          onPress={() => handleUpdateStatus(order.id, 'delivered')}
                        >
                          <MaterialIcons name="done-all" size={16} color="white" />
                          <Text style={styles.orderActionButtonText}>Marcar como Entregue</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Tela de Relatórios (MOCKADA)
  const ReportsScreen = () => {
    // Dados mockados
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

    const stats = {
      today: {
        revenue: 1250.50,
        orders: 8,
        averageTicket: 156.31,
        growth: 12.5,
      },
      week: {
        revenue: 8450.30,
        orders: 52,
        averageTicket: 162.51,
        growth: 8.3,
      },
      month: {
        revenue: 34200.80,
        orders: 198,
        averageTicket: 172.73,
        growth: 15.2,
      },
      year: {
        revenue: 285600.00,
        orders: 1650,
        averageTicket: 173.27,
        growth: 22.1,
      },
    };

    const currentStats = stats[selectedPeriod];

    const topProducts = [
      { name: 'Produto Exemplo 1', sales: 45, revenue: 4495.50 },
      { name: 'Produto Exemplo 2', sales: 32, revenue: 6396.80 },
      { name: 'Produto Premium', sales: 18, revenue: 3598.20 },
    ];

    const handleGoBack = useCallback(() => {
      setProfileSubScreen(null);
    }, []);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <TouchableOpacity 
              onPress={handleGoBack}
              style={{ zIndex: 1000, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>Relatórios</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
          {/* Seletor de período */}
          <View style={styles.reportsPeriodSelector}>
            <TouchableOpacity
              style={[styles.reportsPeriodButton, selectedPeriod === 'today' && styles.reportsPeriodButtonActive]}
              onPress={() => setSelectedPeriod('today')}
            >
              <Text style={[styles.reportsPeriodText, selectedPeriod === 'today' && styles.reportsPeriodTextActive]}>
                Hoje
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportsPeriodButton, selectedPeriod === 'week' && styles.reportsPeriodButtonActive]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[styles.reportsPeriodText, selectedPeriod === 'week' && styles.reportsPeriodTextActive]}>
                Semana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportsPeriodButton, selectedPeriod === 'month' && styles.reportsPeriodButtonActive]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[styles.reportsPeriodText, selectedPeriod === 'month' && styles.reportsPeriodTextActive]}>
                Mês
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportsPeriodButton, selectedPeriod === 'year' && styles.reportsPeriodButtonActive]}
              onPress={() => setSelectedPeriod('year')}
            >
              <Text style={[styles.reportsPeriodText, selectedPeriod === 'year' && styles.reportsPeriodTextActive]}>
                Ano
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cards de estatísticas principais */}
          <View style={styles.reportsStatsGrid}>
            <View style={styles.reportsStatCard}>
              <View style={styles.reportsStatHeader}>
                <MaterialIcons name="attach-money" size={24} color="#10B981" />
                <View style={[styles.reportsGrowthBadge, { backgroundColor: '#10B98120' }]}>
                  <MaterialIcons name="trending-up" size={12} color="#10B981" />
                  <Text style={[styles.reportsGrowthText, { color: '#10B981' }]}>
                    +{currentStats.growth}%
                  </Text>
                </View>
              </View>
              <Text style={styles.reportsStatValue}>
                R$ {currentStats.revenue.toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.reportsStatLabel}>Receita Total</Text>
            </View>

            <View style={styles.reportsStatCard}>
              <View style={styles.reportsStatHeader}>
                <MaterialIcons name="receipt" size={24} color="#5C8FFC" />
              </View>
              <Text style={styles.reportsStatValue}>{currentStats.orders}</Text>
              <Text style={styles.reportsStatLabel}>Pedidos</Text>
            </View>

            <View style={styles.reportsStatCard}>
              <View style={styles.reportsStatHeader}>
                <MaterialIcons name="shopping-cart" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.reportsStatValue}>
                R$ {currentStats.averageTicket.toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.reportsStatLabel}>Ticket Médio</Text>
            </View>
          </View>

          {/* Gráfico de vendas (simulado) */}
          <View style={styles.reportsChartCard}>
            <View style={styles.reportsChartHeader}>
              <Text style={styles.reportsChartTitle}>Vendas por Dia</Text>
              <MaterialIcons name="bar-chart" size={20} color="#5C8FFC" />
            </View>
            <View style={styles.reportsChartPlaceholder}>
              <MaterialIcons name="show-chart" size={48} color="#3A3A3A" />
              <Text style={styles.reportsChartPlaceholderText}>
                Gráfico de vendas (Mockado)
              </Text>
            </View>
          </View>

          {/* Top produtos */}
          <View style={styles.reportsTopProductsCard}>
            <View style={styles.reportsTopProductsHeader}>
              <MaterialIcons name="star" size={24} color="#FBBF24" />
              <Text style={styles.reportsTopProductsTitle}>Produtos Mais Vendidos</Text>
            </View>
            {topProducts.map((product, index) => (
              <View key={index} style={styles.reportsTopProductItem}>
                <View style={styles.reportsTopProductLeft}>
                  <View style={styles.reportsTopProductRank}>
                    <Text style={styles.reportsTopProductRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.reportsTopProductInfo}>
                    <Text style={styles.reportsTopProductName}>{product.name}</Text>
                    <Text style={styles.reportsTopProductSales}>
                      {product.sales} {product.sales === 1 ? 'venda' : 'vendas'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportsTopProductRevenue}>
                  R$ {product.revenue.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))}
          </View>

          {/* Resumo de pagamentos */}
          <View style={styles.reportsPaymentCard}>
            <View style={styles.reportsPaymentHeader}>
              <MaterialIcons name="account-balance-wallet" size={24} color="#8B5CF6" />
              <Text style={styles.reportsPaymentTitle}>Métodos de Pagamento</Text>
            </View>
            <View style={styles.reportsPaymentItem}>
              <View style={styles.reportsPaymentMethod}>
                <MaterialIcons name="account-balance-wallet" size={20} color="#10B981" />
                <Text style={styles.reportsPaymentMethodText}>PIX</Text>
              </View>
              <Text style={styles.reportsPaymentValue}>
                R$ {(currentStats.revenue * 0.65).toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.reportsPaymentPercent}>65%</Text>
            </View>
            <View style={styles.reportsPaymentItem}>
              <View style={styles.reportsPaymentMethod}>
                <MaterialIcons name="credit-card" size={20} color="#5C8FFC" />
                <Text style={styles.reportsPaymentMethodText}>Cartão</Text>
              </View>
              <Text style={styles.reportsPaymentValue}>
                R$ {(currentStats.revenue * 0.35).toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.reportsPaymentPercent}>35%</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Tela de Adicionar/Editar Produto
  const AddEditProductScreen = () => {
    const isEditing = editingProduct !== null;
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productOriginalPrice, setProductOriginalPrice] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productStock, setProductStock] = useState('0');
    const [isSaving, setIsSaving] = useState(false);

    // Atualizar campos quando editingProduct mudar
    useEffect(() => {
      if (editingProduct) {
        setProductName(editingProduct.name || '');
        setProductDescription(editingProduct.description || '');
        setProductPrice(editingProduct.price?.toString() || '');
        setProductOriginalPrice(editingProduct.originalPrice?.toString() || '');
        setProductCategory(editingProduct.category || '');
        setProductStock(editingProduct.stock?.toString() || '0');
      } else {
        // Limpar campos quando não estiver editando
        setProductName('');
        setProductDescription('');
        setProductPrice('');
        setProductOriginalPrice('');
        setProductCategory('');
        setProductStock('0');
      }
    }, [editingProduct]);

    const handleSaveProduct = async () => {
      // Validações básicas
      if (!productName.trim()) {
        Alert.alert('Erro', 'O nome do produto é obrigatório');
        return;
      }

      const price = parseFloat(productPrice.replace(',', '.'));
      if (isNaN(price) || price <= 0) {
        Alert.alert('Erro', 'Preço inválido');
        return;
      }

      setIsSaving(true);
      
      // Simular delay de salvamento (mockado)
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert(
          'Sucesso', 
          isEditing ? 'Produto atualizado com sucesso! (Mockado)' : 'Produto criado com sucesso! (Mockado)',
          [
            {
              text: 'OK',
              onPress: () => {
                setProfileSubScreen('products');
                setEditingProduct(null);
              }
            }
          ]
        );
      }, 500);
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <TouchableOpacity onPress={() => {
              setProfileSubScreen('products');
              setEditingProduct(null);
            }}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>
              {isEditing ? 'Editar Produto' : 'Adicionar Produto'}
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
          <View style={styles.menuCard}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Produto *</Text>
              <TextInput
                style={styles.formInput}
                value={productName}
                onChangeText={setProductName}
                placeholder="Digite o nome do produto"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, { minHeight: 100, textAlignVertical: 'top' }]}
                value={productDescription}
                onChangeText={setProductDescription}
                placeholder="Descreva o produto..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preço *</Text>
              <TextInput
                style={styles.formInput}
                value={productPrice}
                onChangeText={(text) => {
                  const numbers = text.replace(/[^\d,]/g, '');
                  setProductPrice(numbers);
                }}
                placeholder="0,00"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preço Original (opcional)</Text>
              <TextInput
                style={styles.formInput}
                value={productOriginalPrice}
                onChangeText={(text) => {
                  const numbers = text.replace(/[^\d,]/g, '');
                  setProductOriginalPrice(numbers);
                }}
                placeholder="0,00"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoria</Text>
              <TextInput
                style={styles.formInput}
                value={productCategory}
                onChangeText={setProductCategory}
                placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Estoque</Text>
              <TextInput
                style={styles.formInput}
                value={productStock}
                onChangeText={(text) => {
                  const numbers = text.replace(/[^\d]/g, '');
                  setProductStock(numbers);
                }}
                placeholder="0"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
              onPress={handleSaveProduct}
              disabled={isSaving}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Adicionar Produto'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const ProfileScreen = () => {
    // Obter dados do usuário autenticado
    const user = authState.user;
    const userName = user?.name || user?.email?.split('@')[0] || 'Usuário';
    const userEmail = user?.email || '';
    const isLojista = user?.role === 'lojista' || user?.permissionLevel === 'lojista';

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>{isLojista ? 'Minha Loja' : 'Meu Perfil'}</Text>
            <TouchableOpacity>
              <MaterialIcons name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Info Section */}
          <View style={styles.profileInfoSection}>
            <View style={styles.profileAvatar}>
              <MaterialIcons name={isLojista ? "store" : "person"} size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>

            <View style={styles.profileStats}>
              {isLojista ? (
                <>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>R$ 12.450,00</Text>
                    <Text style={styles.profileStatLabel}>Receita Total</Text>
                  </View>
                  <View style={styles.profileStatDivider} />
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>156</Text>
                    <Text style={styles.profileStatLabel}>Vendas</Text>
                  </View>
                  <View style={styles.profileStatDivider} />
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>42</Text>
                    <Text style={styles.profileStatLabel}>Produtos</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>R$ 245,80</Text>
                    <Text style={styles.profileStatLabel}>Cashback Total</Text>
                  </View>
                  <View style={styles.profileStatDivider} />
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>32</Text>
                    <Text style={styles.profileStatLabel}>Compras</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
          {isLojista ? (
            <>
              {/* Dashboard Stats for Lojista */}
              <View style={styles.achievementsCard}>
                <View style={styles.achievementsHeader}>
                  <MaterialIcons name="dashboard" size={24} color="#5C8FFC" />
                  <Text style={styles.achievementsTitle}>Dashboard</Text>
                </View>
                <View style={styles.merchantStatsGrid}>
                  <View style={styles.merchantStatCard}>
                    <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
                    <Text style={styles.merchantStatValue}>R$ 2.340,00</Text>
                    <Text style={styles.merchantStatLabel}>Este Mês</Text>
                  </View>
                  <View style={styles.merchantStatCard}>
                    <MaterialIcons name="people" size={24} color="#5C8FFC" />
                    <Text style={styles.merchantStatValue}>89</Text>
                    <Text style={styles.merchantStatLabel}>Clientes</Text>
                  </View>
                  <View style={styles.merchantStatCard}>
                    <MaterialIcons name="star" size={24} color="#FFD700" />
                    <Text style={styles.merchantStatValue}>4.8</Text>
                    <Text style={styles.merchantStatLabel}>Avaliação</Text>
                  </View>
                  <View style={styles.merchantStatCard}>
                    <MaterialIcons name="shopping-cart" size={24} color="#DC2626" />
                    <Text style={styles.merchantStatValue}>12</Text>
                    <Text style={styles.merchantStatLabel}>Pedidos</Text>
                  </View>
                </View>
              </View>

              {/* Main Menu Section for Lojista */}
              <View style={styles.menuCard}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setProfileSubScreen('manage-store')}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                      <MaterialIcons name="store" size={20} color="white" />
                    </View>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemTitle}>Gerenciar Loja</Text>
                      <Text style={styles.menuItemSubtitle}>
                        {userStore ? 'Editar informações da loja' : 'Criar sua loja'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setProfileSubScreen('products')}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                      <MaterialIcons name="inventory" size={20} color="white" />
                    </View>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemTitle}>Meus Produtos</Text>
                      <Text style={styles.menuItemSubtitle}>
                        {userProducts.length} {userProducts.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setProfileSubScreen('orders')}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                      <MaterialIcons name="receipt" size={20} color="white" />
                    </View>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemTitle}>Pedidos</Text>
                      <Text style={styles.menuItemSubtitle}>Gerenciar pedidos recebidos</Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => setProfileSubScreen('reports')}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                      <MaterialIcons name="analytics" size={20} color="white" />
                    </View>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemTitle}>Relatórios</Text>
                      <Text style={styles.menuItemSubtitle}>Vendas e estatísticas</Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#1E3A8A' }]}>
                      <MaterialIcons name="account-balance-wallet" size={20} color="white" />
                    </View>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemTitle}>Financeiro</Text>
                      <Text style={styles.menuItemSubtitle}>Extrato e pagamentos</Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Achievements Section for Cliente */}
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

              {/* Main Menu Section for Cliente */}
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
            </>
          )}

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
    if (profileSubScreen === 'manage-store') {
      return <ManageStoreScreen />;
    }
    if (profileSubScreen === 'products') {
      return <ManageProductsScreen />;
    }
    if (profileSubScreen === 'add-product') {
      return <AddEditProductScreen />;
    }
    if (profileSubScreen === 'orders') {
      return <OrdersScreen />;
    }
    if (profileSubScreen === 'reports') {
      return <ReportsScreen />;
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
  merchantStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  merchantStatCard: {
    width: '48%',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  merchantStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  merchantStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
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
  // Form Styles
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: '#374151',
  },
  primaryButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  // Products List Styles
  productsHeader: {
    marginBottom: 16,
  },
  productsStatsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  productsStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productsStatText: {
    marginLeft: 8,
  },
  productsStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  productsStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  productsStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 16,
  },
  productsList: {
    paddingVertical: 4,
  },
  productCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productCardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  productHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCardName: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  productCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  productCategoryText: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '500',
  },
  productPriceRow: {
    marginBottom: 8,
  },
  productCardPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginBottom: 4,
  },
  productDiscountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCardOriginalPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  productDiscountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productDiscountText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  productStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  productCardStock: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  productRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  productRatingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  productStatusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  productStatusText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  productCardRight: {
    flexDirection: 'column',
  },
  productActionButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productEditButton: {
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  productDeleteButton: {
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  manageProductCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  // Orders Screen Styles
  ordersStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ordersStatCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 12,
  },
  ordersStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  ordersStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  ordersFiltersContainer: {
    marginBottom: 16,
  },
  ordersFilters: {
    flexDirection: 'row',
  },
  ordersFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 8,
  },
  ordersFilterButtonActive: {
    backgroundColor: '#5C8FFC',
    borderColor: '#5C8FFC',
  },
  ordersFilterText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  ordersFilterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderCardHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCustomerName: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  orderItemsContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
  },
  orderItemSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  orderShippingAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  orderShippingAddressText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
    marginLeft: 6,
    lineHeight: 18,
  },
  orderTracking: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    flexWrap: 'wrap',
  },
  orderTrackingLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
    marginRight: 6,
  },
  orderTrackingCode: {
    fontSize: 12,
    color: '#5C8FFC',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  orderNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderNotesText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
    marginLeft: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  orderPaymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderPaymentText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C8FFC',
  },
  orderActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  orderActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  orderActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Reports Screen Styles
  reportsPeriodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  reportsPeriodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportsPeriodButtonActive: {
    backgroundColor: '#5C8FFC',
  },
  reportsPeriodText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  reportsPeriodTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  reportsStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  reportsStatCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
    marginRight: 12,
  },
  reportsStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportsGrowthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reportsGrowthText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  reportsStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  reportsStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reportsChartCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  reportsChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportsChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  reportsChartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
  },
  reportsChartPlaceholderText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  reportsTopProductsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  reportsTopProductsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportsTopProductsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  reportsTopProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  reportsTopProductLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportsTopProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportsTopProductRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5C8FFC',
  },
  reportsTopProductInfo: {
    flex: 1,
  },
  reportsTopProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  reportsTopProductSales: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reportsTopProductRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  reportsPaymentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  reportsPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportsPaymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  reportsPaymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  reportsPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportsPaymentMethodText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  reportsPaymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginRight: 12,
  },
  reportsPaymentPercent: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});