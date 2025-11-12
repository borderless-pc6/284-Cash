import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// TODO: Adicionar imports específicos necessários
// TODO: Adicionar props interface
// TODO: Adicionar tipos necessários

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

export default RegisterRoleScreen;
