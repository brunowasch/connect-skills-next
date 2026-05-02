"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Calendar, Clock, ChevronLeft, Building2, Key } from "lucide-react";

interface Props {
    entrevistaId: string;
    status: string;
    vagaTitle: string;
    companyName: string;
    companyPhoto: string | null;
    date: string;
    horaInicio: string;
    codigo: string;
    candidatoCompareceu: boolean;
}

export default function OnsiteInterviewDetailsClient({
    status,
    vagaTitle,
    companyName,
    companyPhoto,
    date,
    horaInicio,
    codigo,
    candidatoCompareceu,
}: Props) {
    const router = useRouter();

    if (status !== "CONFIRMADA" && status !== "CONCLUIDA") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                <p className="text-gray-500">Entrevista não está confirmada ou não foi encontrada.</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Voltar</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
            <button 
                onClick={() => router.back()}
                className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Voltar
            </button>

            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                        {companyPhoto ? (
                            <img src={companyPhoto} alt={companyName} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-10 h-10 text-gray-400" />
                        )}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{vagaTitle}</h1>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 font-medium text-lg">
                            <Building2 className="w-5 h-5" />
                            {companyName}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Data</p>
                                <p className="font-semibold text-gray-900">{date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Horário</p>
                                <p className="font-semibold text-gray-900">{horaInicio}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50 flex flex-col justify-center">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Local</p>
                                <p className="font-semibold text-gray-900 mb-1">Presencial</p>
                                <p className="text-sm text-gray-600">A empresa entrará em contato com o endereço completo.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
                        
                        <Key className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                        <h2 className="text-xl text-slate-300 font-medium mb-2">Seu Código de Participação</h2>
                        
                        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-sm mx-auto mb-6 backdrop-blur-sm">
                            <p className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-[0.2em]">{codigo}</p>
                        </div>
                        
                        {candidatoCompareceu ? (
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Presença confirmada pela empresa
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm max-w-md mx-auto">
                                Apresente este código na recepção da empresa ou para o entrevistador no dia da entrevista para registrar sua presença.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
