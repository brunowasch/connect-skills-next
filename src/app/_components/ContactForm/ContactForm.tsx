'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

type Status = 'idle' | 'sending' | 'success' | 'error'

interface ContactFormProps {
    variant?: 'card' | 'compact'
    defaultUserType?: string
}

function removeLinks(text: string): string {
    return text
        .replace(/https?:\/\/[^\s]+/gi, '[Link Removido]')
        .replace(/www\.[^\s]+/gi, '[Link Removido]')
        .replace(/[a-zA-Z0-9-]+\.(com|net|org|io|ai|co|br|info|biz|edu|gov|me|app|dev)[^\s]*/gi, '[Link Removido]')
}

export function ContactForm({ variant = 'card', defaultUserType = '' }: ContactFormProps) {
    const { t } = useTranslation()

    const [fullName, setFullName] = useState('')
    const [userType, setUserType] = useState(defaultUserType)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const honeyRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (honeyRef.current) {
            honeyRef.current.value = 'zen'
            honeyRef.current.style.display = 'none'
        }
    }, [])

    const isCompact = variant === 'compact'

    const userTypeOptions = [
        { value: 'candidate', label: t('contact_type_candidate', 'Candidato') },
        { value: 'company', label: t('contact_type_company', 'Empresa') },
        { value: 'mentor', label: t('contact_type_mentor', 'Mentor') },
    ]

    const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setter(removeLinks(e.target.value))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')
        setErrorMsg('')

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    userType,
                    subject,
                    message,
                    department: honeyRef.current?.value ?? '',
                }),
            })

            const data = await res.json()
            if (data.success) {
                setStatus('success')
                setFullName(''); setUserType(defaultUserType); setSubject(''); setMessage('')
            } else {
                setStatus('error')
                setErrorMsg(t('contact_form_error', 'Ocorreu um erro. Tente novamente.'))
            }
        } catch {
            setStatus('error')
            setErrorMsg(t('contact_form_error', 'Ocorreu um erro. Tente novamente.'))
        }
    }

    const inputClass = `w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100`
    const labelClass = `mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide`

    if (status === 'success') {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-green-50 border border-green-100 text-center ${isCompact ? 'p-5' : 'p-10'}`}>
                <FaCheckCircle className="text-4xl text-green-500" />
                <p className="font-semibold text-green-800">{t('contact_form_success_title', 'Mensagem enviada!')}</p>
                <p className="text-sm text-green-700">{t('contact_form_success_desc', 'Entraremos em contato em breve.')}</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-2 rounded-lg border border-green-400 px-4 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition"
                >
                    {t('contact_form_send_another', 'Enviar outra mensagem')}
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 ${isCompact ? '' : ''}`} noValidate>
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                <label htmlFor="department">Department</label>
                <input
                    ref={honeyRef}
                    id="department"
                    name="department"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue="zen"
                />
            </div>

            {/* Full name */}
            <div>
                <label htmlFor="contact_fullName" className={labelClass}>
                    {t('contact_form_fullname', 'Nome completo')} <span className="text-red-400">*</span>
                </label>
                <input
                    id="contact_fullName"
                    type="text"
                    required
                    maxLength={200}
                    placeholder={t('contact_form_fullname_placeholder', 'Seu nome completo')}
                    value={fullName}
                    onChange={handleChange(setFullName)}
                    className={inputClass}
                />
            </div>

            {/* User type dropdown */}
            <div>
                <label htmlFor="contact_userType" className={labelClass}>
                    {t('contact_form_usertype', 'Tipo de usuário')} <span className="text-red-400">*</span>
                </label>
                <select
                    id="contact_userType"
                    required
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                >
                    <option value="" disabled>{t('contact_form_usertype_placeholder', 'Selecione...')}</option>
                    {userTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Subject */}
            <div>
                <label htmlFor="contact_subject" className={labelClass}>
                    {t('contact_form_subject', 'Assunto')} <span className="text-red-400">*</span>
                </label>
                <input
                    id="contact_subject"
                    type="text"
                    required
                    maxLength={300}
                    placeholder={t('contact_form_subject_placeholder', 'Descreva o assunto brevemente')}
                    value={subject}
                    onChange={handleChange(setSubject)}
                    className={inputClass}
                />
            </div>

            {/* Message */}
            <div>
                <label htmlFor="contact_message" className={labelClass}>
                    {t('contact_form_message', 'Mensagem')} <span className="text-red-400">*</span>
                </label>
                <textarea
                    id="contact_message"
                    required
                    rows={isCompact ? 3 : 4}
                    maxLength={2000}
                    placeholder={t('contact_form_message_placeholder', 'Escreva sua mensagem aqui...')}
                    value={message}
                    onChange={handleChange(setMessage)}
                    className={`${inputClass} resize-none`}
                />
            </div>

            {/* Error */}
            {status === 'error' && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
                    <FaExclamationCircle className="shrink-0" />
                    {errorMsg}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={status === 'sending'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {status === 'sending' ? (
                    <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('contact_form_sending', 'Enviando...')}
                    </>
                ) : (
                    <>
                        <FaPaperPlane />
                        {t('contact_form_submit', 'Enviar mensagem')}
                    </>
                )}
            </button>
        </form>
    )
}
