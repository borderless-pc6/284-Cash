# Deploy do App 284-cash

## Deploy Online - Guia Rápido

Este guia explica como fazer o deploy online do seu app Expo.

### Opção 1: Deploy na Vercel (Recomendado)

1. **Login na Vercel:**
```bash
npx vercel login
```

2. **Executar o deploy:**
```bash
npm run deploy
```

O comando irá:
- Exportar o app para web
- Fazer deploy na Vercel
- Gerar uma URL pública

### Opção 2: Deploy usando Expo Hosting (EAS)

1. **Configurar o projeto EAS:**
```bash
npx eas project:init
```

2. **Fazer update do app:**
```bash
npx eas update --channel production --message "Deploy inicial"
```

### Opção 3: Deploy Manual (Netlify Drop)

1. Vá para: https://app.netlify.com/drop
2. Arraste a pasta `dist` para a área de upload
3. Seu app estará online instantaneamente!

### Opção 4: Deploy usando GitHub Pages

1. Crie um repositório no GitHub
2. Faça commit dos arquivos da pasta `dist`
3. Configure GitHub Pages para servir a integração `dist`

---

## Estrutura dos Arquivos

- `dist/` - Arquivos exportados prontos para deploy
- `vercel.json` - Configuração do Vercel
- `eas.json` - Configuração do EAS
- `app.config.js` - Configuração do Expo

## Comandos Disponíveis

- `npm start` - Iniciar em modo desenvolvimento
- `npm run export` - Exportar para web
- `npm run deploy` - Fazer deploy completo
- `npm run deploy:vercel` - Deploy apenas na Vercel

