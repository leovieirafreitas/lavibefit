# PWA - Progressive Web App

O La Vibe Fit agora funciona como um Progressive Web App (PWA)! Isso significa que os usuários podem:

## Recursos PWA

✅ **Instalar o app** no dispositivo (desktop e mobile)
✅ **Funcionar offline** com cache inteligente
✅ **Receber atualizações automáticas** do service worker
✅ **Experiência nativa** em dispositivos móveis
✅ **Ícone na tela inicial** como um app nativo

## Como Instalar

### Desktop (Chrome/Edge)
1. Acesse o site em produção
2. Clique no ícone de instalação (⊕) na barra de endereços
3. Clique em "Instalar"
4. O app será adicionado aos seus aplicativos

### Android (Chrome)
1. Acesse o site
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

### iOS (Safari)
1. Acesse o site
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"
4. Confirme

## Arquivos PWA

- **`/public/manifest.json`** - Configuração do app (nome, ícones, cores)
- **`/public/sw.js`** - Service Worker para cache e offline
- **`/public/icon-192x192.png`** - Ícone 192x192px
- **`/public/icon-512x512.png`** - Ícone 512x512px
- **`/public/apple-touch-icon.png`** - Ícone para iOS
- **`/src/components/PWARegister.tsx`** - Componente de registro do SW

## Estratégia de Cache

O service worker usa as seguintes estratégias:

- **Cache First**: Recursos estáticos (imagens, CSS, JS)
- **Network First**: Páginas dinâmicas e dados
- **Sem cache**: APIs do Supabase (sempre busca dados atualizados)

## Desenvolvimento

O service worker está **desabilitado em desenvolvimento** para facilitar o debug. Ele só funciona em produção.

Para testar localmente:
```bash
npm run build
npm start
```

## Verificação

Para verificar se o PWA está funcionando:

1. Abra o Chrome DevTools
2. Vá para a aba "Application"
3. Verifique:
   - **Manifest**: deve mostrar as informações do app
   - **Service Workers**: deve mostrar o SW ativo
   - **Cache Storage**: deve mostrar os caches criados

## Lighthouse

Execute o Lighthouse no Chrome DevTools para verificar o score PWA:
- Deve ter score >= 90
- Todos os critérios PWA devem estar ✓

## Atualizações

O service worker verifica atualizações a cada 1 minuto. Quando uma nova versão é detectada, ela é instalada automaticamente na próxima vez que o usuário recarregar a página.
