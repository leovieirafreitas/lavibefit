# Guia de Deploy no Render

## 1. Configurar Variáveis de Ambiente

No painel do Render, vá em **Environment** e adicione as seguintes variáveis:

### Supabase (OBRIGATÓRIO)
```
NEXT_PUBLIC_SUPABASE_URL=https://jcytqknxxcqkfraonhwr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeXRxa254eGNxa2ZyYW9uaHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzUzNzgsImV4cCI6MjA4NDE1MTM3OH0.pDetfK3VpAgKp4mva_OfWzmdYZQs_I9Ajl7Ud1lwiNk
```

### Mercado Pago
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-7678614423650327-010316-4e62d5a7ba85897c05ffd72a6c844bab-285537284
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-a99319e6-58f6-4d6c-825f-4f7e807dc2b9
```

### WhatsApp
```
NEXT_PUBLIC_WHATSAPP_NUMBER=5592984665689
```

### Site URL
```
NEXT_PUBLIC_SITE_URL=https://seu-app.onrender.com
```
> ⚠️ **Importante**: Substitua `seu-app.onrender.com` pela URL real do seu app no Render

---

## 2. Autorizar Domínio no Supabase

1. Acesse o [painel do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** > **URL Configuration**
4. Adicione a URL do Render em:
   - **Site URL**: `https://seu-app.onrender.com`
   - **Redirect URLs**: `https://seu-app.onrender.com/**`

---

## 3. Configuração do Build no Render

### Comandos Necessários
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 20.x (recomendado)

### Passos para Deploy
1. Conecte seu repositório GitHub ao Render
2. Configure as variáveis de ambiente (passo 1)
3. Clique em **Manual Deploy** > **Clear build cache & deploy**
4. Aguarde o build completar (pode levar 5-10 minutos)

---

## 4. Verificação Pós-Deploy

### Verificar Logs do Render

Após o deploy, acesse os **Logs** no painel do Render e procure por:

✅ **Sucesso** - Você deve ver:
```
[SERVER] Carregando variáveis Supabase...
[SERVER] NEXT_PUBLIC_SUPABASE_URL: DEFINIDA
[SERVER] NEXT_PUBLIC_SUPABASE_ANON_KEY: DEFINIDA
✅ Cliente Supabase inicializado com sucesso!
```

❌ **Erro** - Se aparecer:
```
[SERVER] NEXT_PUBLIC_SUPABASE_URL: UNDEFINED
[SERVER] NEXT_PUBLIC_SUPABASE_ANON_KEY: UNDEFINED
```
→ As variáveis não foram carregadas. Veja **Troubleshooting** abaixo.

### Testar Funcionalidades

Acesse a URL do seu app e teste:

1. **Listagem de Produtos** (requer leitura do banco)
   - Abra a página inicial
   - Produtos devem carregar normalmente

2. **Favoritos** (requer escrita no banco)
   - Clique no ícone de coração em um produto
   - Verifique se salva corretamente

3. **Checkout** (requer leitura e escrita)
   - Adicione produtos ao carrinho
   - Prossiga para o checkout

4. **Console do Navegador** (F12)
   - Não deve haver erros 401 ou 404
   - Verifique a aba **Network** para requisições ao Supabase

---

## 5. Troubleshooting

### ❌ Erro 401/404 - Unauthorized

**Possíveis causas:**
- [ ] Variáveis não configuradas no painel do Render
- [ ] Build feito antes de adicionar as variáveis
- [ ] Domínio não autorizado no Supabase
- [ ] Cache antigo do build

**Soluções:**
1. Verifique se todas as variáveis estão no painel do Render
2. Faça **Clear build cache & deploy**
3. Confirme que o domínio está autorizado no Supabase
4. Verifique os logs para confirmar que as variáveis estão **DEFINIDAS**

### ❌ Variáveis Aparecem como UNDEFINED nos Logs

**Causa:** As variáveis não foram injetadas no build

**Solução:**
1. No painel do Render, vá em **Environment**
2. Confirme que as variáveis estão salvas (clique em **Save Changes**)
3. Faça **Manual Deploy** > **Clear build cache & deploy**
4. Aguarde o novo build e verifique os logs novamente

### ❌ Build Falha com Erro de Variáveis

**Causa:** Next.js está tentando validar as variáveis durante o build

**Solução:**
- As variáveis `NEXT_PUBLIC_*` devem estar configuradas **antes** do build
- Não deixe as variáveis vazias no painel do Render

### ❌ Funciona Localmente mas Não no Render

**Possíveis diferenças:**
- Vercel injeta variáveis automaticamente, Render precisa de configuração manual
- Certifique-se de que o arquivo `.env.production` não está sobrescrevendo as variáveis do painel

---

## 6. Checklist Final

Antes de considerar o deploy completo, confirme:

- [ ] Todas as variáveis de ambiente estão configuradas no painel do Render
- [ ] Build completou sem erros
- [ ] Logs mostram variáveis **DEFINIDAS**
- [ ] Domínio do Render está autorizado no Supabase
- [ ] Produtos carregam na página inicial
- [ ] Favoritos funcionam
- [ ] Checkout funciona
- [ ] Nenhum erro 401/404 no console do navegador

---

## 7. Suporte

Se o problema persistir após seguir todos os passos:

1. **Capture os logs do Render** (especialmente as linhas com `[SERVER]`)
2. **Capture o console do navegador** (F12 > Console e Network)
3. **Verifique o painel do Supabase** > Logs para ver se há requisições chegando
4. **Compare com a Vercel** - Se funciona na Vercel, compare as variáveis de ambiente

---

## 8. Diferenças entre Vercel e Render

| Aspecto | Vercel | Render |
|---------|--------|--------|
| Injeção de variáveis | Automática | Manual via painel |
| Cache de build | Inteligente | Pode precisar limpar manualmente |
| Logs de ambiente | Ocultos por padrão | Visíveis nos logs |
| Deploy | Automático no push | Manual ou automático |

**Dica:** O Render é mais "explícito" que a Vercel, então você verá mais logs de debug, o que facilita o troubleshooting!
