"use client";

import React, { useEffect, useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function GlobalToast() {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const checkToast = () => {
            const pendingMessage = localStorage.getItem('global_toast');
            if (pendingMessage) {
                try {
                    const data = JSON.parse(pendingMessage);
                    setMessage(data);
                    setVisible(true);
                    localStorage.removeItem('global_toast');

                    const timer = setTimeout(() => {
                        setVisible(false);
                    }, 5000);

                    return () => clearTimeout(timer);
                } catch (e) {
                    localStorage.removeItem('global_toast');
                }
            }
        };

        checkToast();

        window.addEventListener('storage', checkToast);
        return () => window.removeEventListener('storage', checkToast);
    }, [pathname]);

    if (!visible || !message) return null;

    return (
        <div className="fixed bottom-10 right-6 sm:right-10 z-[9999] min-w-[320px] max-w-[90vw] animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className={`bg-white rounded-2xl shadow-2xl border-l-4 p-4 flex items-center gap-4 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'
                }`}>
                <div className={`p-2 rounded-full flex-shrink-0 ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {message.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                        {message.type === 'success' ? 'Ótimo!' : 'Atenção'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                        {message.text}
                    </p>
                </div>

                <button
                    onClick={() => setVisible(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
