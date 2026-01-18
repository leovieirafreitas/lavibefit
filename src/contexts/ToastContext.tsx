"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    showWarning: (message: string) => void;
    confirm: (message: string, onConfirm: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);
    const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

    const confirm = useCallback((message: string, onConfirm: () => void) => {
        setConfirmDialog({ message, onConfirm });
    }, []);

    const handleConfirm = () => {
        if (confirmDialog) {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
        }
    };

    const handleCancel = () => {
        setConfirmDialog(null);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500',
                    icon: CheckCircle,
                    iconColor: 'text-white'
                };
            case 'error':
                return {
                    bg: 'bg-red-500',
                    icon: AlertCircle,
                    iconColor: 'text-white'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500',
                    icon: AlertTriangle,
                    iconColor: 'text-white'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-500',
                    icon: Info,
                    iconColor: 'text-white'
                };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
                {toasts.map((toast) => {
                    const styles = getToastStyles(toast.type);
                    const Icon = styles.icon;

                    return (
                        <div
                            key={toast.id}
                            className={`${styles.bg} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md pointer-events-auto animate-slideInRight`}
                        >
                            <Icon className={styles.iconColor} size={20} />
                            <p className="flex-1 text-sm font-medium">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="hover:bg-white/20 rounded p-1 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Confirm Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#DD3468] to-pink-600 px-6 py-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Confirmação
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                {confirmDialog.message}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-5 py-2.5 rounded-lg bg-[#DD3468] text-white font-bold text-sm hover:bg-[#c42d5c] transition-colors shadow-lg"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
