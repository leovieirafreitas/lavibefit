# 🎨 Sistema de Toast e Notificações - La Vibe Fit

## 📋 Visão Geral

Sistema completo de notificações toast e diálogos de confirmação customizados com a identidade visual do La Vibe Fit, substituindo os pop-ups nativos do navegador (`alert`, `confirm`, `prompt`).

## ✨ Recursos

- ✅ **Toasts Animados** - 4 tipos (Success, Error, Warning, Info)
- ✅ **Modal de Confirmação** - Estilizado com cores do sistema
- ✅ **Auto-dismiss** - Toasts desaparecem automaticamente após 4s
- ✅ **Animações Suaves** - Slide-in, fade-in, scale-in
- ✅ **Responsivo** - Funciona em mobile e desktop
- ✅ **Z-index Alto** - Sempre visível acima de outros elementos

## 🎯 Como Usar

### 1. Importar o Hook

```typescript
import { useToast } from '@/contexts/ToastContext';
```

### 2. Usar no Componente

```typescript
export default function MyComponent() {
    const { showSuccess, showError, showWarning, showInfo, confirm } = useToast();

    // ... seu código
}
```

## 📝 Exemplos de Uso

### Toast de Sucesso ✅

```typescript
const handleSave = async () => {
    try {
        await saveData();
        showSuccess('Dados salvos com sucesso!');
    } catch (error) {
        showError('Erro ao salvar dados');
    }
};
```

### Toast de Erro ❌

```typescript
showError('Erro ao processar pagamento');
```

### Toast de Aviso ⚠️

```typescript
showWarning('Estoque baixo! Apenas 3 unidades restantes.');
```

### Toast de Informação ℹ️

```typescript
showInfo('Produto adicionado ao carrinho');
```

### Modal de Confirmação 🔔

```typescript
const handleDelete = () => {
    confirm(
        'Tem certeza que deseja excluir este produto?\n\nEsta ação não pode ser desfeita.',
        () => {
            // Código executado se o usuário confirmar
            deleteProduct();
            showSuccess('Produto excluído com sucesso!');
        }
    );
};
```

## 🔄 Substituindo Código Antigo

### ANTES (alert nativo):
```typescript
alert('Produto adicionado ao carrinho!');
```

### DEPOIS (toast customizado):
```typescript
const { showSuccess } = useToast();
showSuccess('Produto adicionado ao carrinho!');
```

---

### ANTES (confirm nativo):
```typescript
if (confirm('Deseja excluir?')) {
    deleteItem();
}
```

### DEPOIS (modal customizado):
```typescript
const { confirm, showSuccess } = useToast();
confirm('Deseja excluir este item?', () => {
    deleteItem();
    showSuccess('Item excluído!');
});
```

## 🎨 Tipos de Toast

| Tipo | Cor | Ícone | Uso |
|------|-----|-------|-----|
| **Success** | Verde | ✓ | Ações bem-sucedidas |
| **Error** | Vermelho | ⚠ | Erros e falhas |
| **Warning** | Amarelo | ⚠ | Avisos importantes |
| **Info** | Azul | ℹ | Informações gerais |

## 🎭 Componentes Criados

### 1. ToastContext.tsx
- Provider global de toasts
- Gerenciamento de estado
- Auto-dismiss automático

### 2. Animações CSS (globals.css)
```css
@keyframes slideInRight { ... }
@keyframes scaleIn { ... }
@keyframes fadeIn { ... }
```

## 📦 Estrutura do Toast

```tsx
<div className="fixed top-4 right-4 z-[9999]">
    {/* Toast aparece aqui */}
    <div className="bg-green-500 text-white px-6 py-4 rounded-lg">
        <Icon /> Mensagem
        <button>X</button>
    </div>
</div>
```

## 📦 Estrutura do Modal de Confirmação

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl">
        {/* Header com gradiente rosa */}
        <div className="bg-gradient-to-r from-[#DD3468] to-pink-600">
            <h3>Confirmação</h3>
        </div>
        
        {/* Corpo com mensagem */}
        <div className="px-6 py-6">
            <p>{message}</p>
        </div>
        
        {/* Footer com botões */}
        <div className="flex gap-3">
            <button>Cancelar</button>
            <button className="bg-[#DD3468]">Confirmar</button>
        </div>
    </div>
</div>
```

## 🎯 Casos de Uso Comuns

### 1. Adicionar ao Carrinho
```typescript
const { showSuccess } = useToast();

const handleAddToCart = () => {
    addToCart(product);
    showSuccess('Produto adicionado ao carrinho!');
};
```

### 2. Formulário de Contato
```typescript
const { showSuccess, showError } = useToast();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await sendEmail(formData);
        showSuccess('Mensagem enviada com sucesso!');
    } catch (error) {
        showError('Erro ao enviar mensagem. Tente novamente.');
    }
};
```

### 3. Excluir Item com Confirmação
```typescript
const { confirm, showSuccess, showError } = useToast();

const handleDelete = (id) => {
    confirm(
        'Tem certeza que deseja excluir este item?',
        async () => {
            try {
                await deleteItem(id);
                showSuccess('Item excluído com sucesso!');
            } catch (error) {
                showError('Erro ao excluir item');
            }
        }
    );
};
```

### 4. Salvar Configurações
```typescript
const { showSuccess, showWarning } = useToast();

const handleSave = async () => {
    if (!isValid()) {
        showWarning('Preencha todos os campos obrigatórios');
        return;
    }
    
    await saveSettings();
    showSuccess('Configurações salvas!');
};
```

## 🚀 Próximos Passos

1. ✅ Substituir todos os `alert()` por `showSuccess()` ou `showError()`
2. ✅ Substituir todos os `confirm()` por `confirm()`
3. ✅ Testar em todos os fluxos da aplicação
4. ✅ Ajustar textos das mensagens se necessário

## 💡 Dicas

- **Mensagens curtas**: Mantenha as mensagens concisas (máx. 2 linhas)
- **Ações claras**: Use verbos de ação ("Salvo", "Excluído", "Enviado")
- **Contexto**: Inclua o que foi afetado ("Produto excluído", não apenas "Excluído")
- **Feedback imediato**: Mostre o toast assim que a ação ocorrer

## 🎨 Cores do Sistema

```css
--primary: #DD3468 (Rosa La Vibe Fit)
--success: #10B981 (Verde)
--error: #EF4444 (Vermelho)
--warning: #F59E0B (Amarelo)
--info: #3B82F6 (Azul)
```

---

**Status**: ✅ Implementado  
**Data**: 2026-01-18  
**Autor**: Antigravity AI
