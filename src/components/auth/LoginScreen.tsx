import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Gender } from '../../types';

export interface LoginScreenProps {
  loginEmail: string;
  loginPassword: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onLogin: () => void;
  onRegisterPress: () => void;
  styles: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  loginEmail,
  loginPassword,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onRegisterPress,
  styles
}) => {
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

export default LoginScreen;

