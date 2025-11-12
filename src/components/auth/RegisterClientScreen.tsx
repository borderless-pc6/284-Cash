import React, { useState, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Gender } from '../../types';


export interface RegisterClientScreenProps {
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

const RegisterClientScreen: React.FC<RegisterClientScreenProps> = memo(({
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


export default RegisterClientScreen;
