import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";

interface AIGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (shortDesc: string) => Promise<void>;
}

export function AIGenerationModal({ isOpen, onClose, onGenerate }: AIGenerationModalProps) {
    const [shortDesc, setShortDesc] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!shortDesc.trim()) return;
        setIsLoading(true);
        try {
            await onGenerate(shortDesc);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Sparkles size={20} />
                        <h2 className="font-semibold">Assistente de IA</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-600 text-sm">
                        Descreva brevemente a vaga e deixe nossa IA sugerir o título, descrição completa, perguntas e habilidades ideais para a vaga.
                    </p>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Contexto da Vaga</label>
                        <textarea
                            value={shortDesc}
                            onChange={(e) => setShortDesc(e.target.value)}
                            placeholder="Ex: Vaga para vendedor de automóveis."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none text-sm"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !shortDesc.trim()}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Gerar Conteúdo
                    </button>
                </div>
            </div>
        </div>
    );
}
