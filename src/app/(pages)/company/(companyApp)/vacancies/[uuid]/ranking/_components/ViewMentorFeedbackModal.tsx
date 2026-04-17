import { X, CheckCircle, BrainCircuit, Activity, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MentorFeedback {
    comportamental: string | null;
    tecnico: string | null;
    geral: string | null;
    nota_comportamental: number | null;
    nota_tecnica: number | null;
    nota_geral: number | null;
    enviado_em: Date | null;
    candidato_entrou_em: Date | null;
    candidato_saiu_em: Date | null;
    candidato_compareceu: boolean | null;
    falta_marcada_pelo_mentor: boolean | null;
}

interface ViewMentorFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    feedback: MentorFeedback | null;
}

export function ViewMentorFeedbackModal({ isOpen, onClose, candidateName, feedback }: ViewMentorFeedbackModalProps) {
    const { t } = useTranslation();

    if (!isOpen || !feedback) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center p-4 z-[100] animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative my-auto border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 rounded-t-2xl z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            Feedback do Mentor
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Avaliação de {candidateName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {/* Attendance Highlight */}
                        {feedback.candidato_compareceu === false && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={20} />
                                <div>
                                    <h3 className="font-bold text-red-800">Candidato Não Compareceu</h3>
                                    <p className="text-sm mt-1 text-red-600">
                                        {feedback.falta_marcada_pelo_mentor 
                                            ? "O mentor sinalizou que o candidato não compareceu à entrevista."
                                            : "O tempo limite da reunião encerrou sem o comparecimento do candidato."}
                                    </p>
                                </div>
                            </div>
                        )}
                        {feedback.candidato_compareceu === true && feedback.candidato_entrou_em && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
                                <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                <div className="text-sm">
                                    <span className="font-bold">Presença Registrada:</span> Ingressou às {new Date(feedback.candidato_entrou_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    {feedback.candidato_saiu_em && (
                                        <> e saiu às {new Date(feedback.candidato_saiu_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.</>
                                    )}
                                    {!feedback.candidato_saiu_em && <> (Ainda em chamada ou aba aberta).</>}
                                </div>
                            </div>
                        )}

                        {feedback.enviado_em && (
                         <>
                         {/* Nota Geral Highlight */}
                         <div className="bg-gradient-to-br from-indigo-50 flex items-center gap-4 to-blue-50 border border-blue-100 p-5 rounded-xl">
                            <div className="flex flex-col items-center justify-center bg-white rounded-full h-16 w-16 shadow-sm border border-indigo-100 flex-shrink-0">
                                <span className="text-2xl font-black text-indigo-600">{feedback.nota_geral || 0}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                                    <BrainCircuit size={18} className="text-indigo-500" />
                                    Feedback Geral
                                </h3>
                                <p className="text-indigo-800 text-sm mt-1">
                                    {feedback.geral}
                                </p>
                            </div>
                         </div>
                         </>
                        )}

                        {feedback.enviado_em && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Comportamental */}
                            <div className="bg-white border flex flex-col gap-3 border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Activity size={16} className="text-green-500" />
                                        Comportamental
                                    </h4>
                                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-bold">
                                        Nota: {feedback.nota_comportamental || 0}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap flex-1">
                                    {feedback.comportamental}
                                </p>
                            </div>

                            {/* Técnico */}
                            <div className="bg-white border flex flex-col gap-3 border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-blue-500" />
                                        Técnico
                                    </h4>
                                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm font-bold">
                                        Nota: {feedback.nota_tecnica || 0}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap flex-1">
                                    {feedback.tecnico}
                                </p>
                            </div>
                        </div>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-2xl flex justify-between items-center z-10 w-full">
                    <span className="text-xs text-gray-500">
                        {feedback.enviado_em ? `Enviado em: ${new Date(feedback.enviado_em).toLocaleDateString('pt-BR')} às ${new Date(feedback.enviado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : "Não avaliado"}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors shadow-sm"
                    >
                        {t('close', 'Fechar')}
                    </button>
                </div>
            </div>
        </div>
    );
}
