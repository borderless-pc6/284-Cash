# Configuração das Regras do Firestore

## Erro: Missing or insufficient permissions

Este erro ocorre porque as regras de segurança do Firestore não estão configuradas para permitir leitura/escrita na coleção `users`.

## Solução Rápida (Desenvolvimento)

### Opção 1: Configurar no Console do Firebase (Recomendado)

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Regras**
4. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Permitir leitura e escrita para todos (apenas para desenvolvimento)
      allow read, write: if true;
    }
  }
}
```

5. Clique em **Publicar**

### Opção 2: Usar Firebase CLI

Se você tem o Firebase CLI instalado:

```bash
firebase deploy --only firestore:rules
```

## ⚠️ IMPORTANTE - Segurança em Produção

As regras acima permitem **qualquer pessoa** ler e escrever dados. Isso é **apenas para desenvolvimento**.

Para produção, você deve implementar regras mais restritivas, por exemplo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Permitir leitura apenas do próprio documento
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Permitir escrita apenas na criação (se não existir) ou atualização do próprio documento
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Nota**: Como você desabilitou o Firebase Auth, precisará implementar um sistema de autenticação customizado ou usar tokens JWT para validar as requisições nas regras.

