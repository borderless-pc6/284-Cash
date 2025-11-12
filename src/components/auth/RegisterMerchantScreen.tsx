import React, { useState, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Gender } from '../../types';


export interface RegisterMerchantScreenProps {
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

const RegisterMerchantScreen: React.FC<RegisterMerchantScreenProps> = memo(({
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


export default RegisterMerchantScreen;
