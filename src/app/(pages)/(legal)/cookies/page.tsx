'use client'
import { useTranslation } from 'react-i18next'
import { Header, Footer } from '@/src/app/_components/Layout/index'

const BROWSERS = [
    { name: 'Google Chrome', href: 'https://support.google.com/chrome/answer/95647' },
    { name: 'Mozilla Firefox', href: 'https://support.mozilla.org/pt-BR/kb/cookies-informacoes-que-os-sites-armazenam-no-seu-' },
    { name: 'Apple Safari', href: 'https://support.apple.com/pt-br/guide/safari/sfri11471/mac' },
    { name: 'Microsoft Edge', href: 'https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
]

const COOKIE_ROWS = [
    { typeKey: 'cookies_type_session', purposeKey: 'cookies_purpose_session', required: true },
    { typeKey: 'cookies_type_prefs',   purposeKey: 'cookies_purpose_prefs',   required: true },
    { typeKey: 'cookies_type_functional', purposeKey: 'cookies_purpose_functional', required: false },
    { typeKey: 'cookies_type_security', purposeKey: 'cookies_purpose_security', required: true },
    { typeKey: 'cookies_type_analytics', purposeKey: 'cookies_purpose_analytics', required: false },
]

export default function Cookies() {
    const { t } = useTranslation()
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-indigo-700 to-blue-800 text-white">
                    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="inline-flex items-center rounded-full bg-white/15 border border-white/20 px-3 py-1 text-sm font-medium mb-4">
                            {t('cookies_badge')}
                        </div>
                        <h1 className="text-4xl font-bold">{t('cookies_title')}</h1>
                        <p className="mt-3 text-indigo-200">{t('legal_updated_at')} · {t('cookies_hero_subtitle')}</p>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="space-y-10 text-gray-700 leading-relaxed">

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s1_title')}</h2>
                            <p>{t('cookies_s1_p1')}</p>
                            <p className="mt-3">{t('cookies_s1_p2')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s2_title')}</h2>
                            <p>{t('cookies_s2_intro')}</p>
                            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-left text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">{t('cookies_table_type')}</th>
                                            <th className="px-4 py-3 font-semibold">{t('cookies_table_purpose')}</th>
                                            <th className="px-4 py-3 font-semibold">{t('cookies_table_required')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {COOKIE_ROWS.map((row, i) => (
                                            <tr key={row.typeKey} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                                                <td className="px-4 py-3 font-medium text-gray-800">{t(row.typeKey)}</td>
                                                <td className="px-4 py-3">{t(row.purposeKey)}</td>
                                                <td className="px-4 py-3">
                                                    {row.required
                                                        ? <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{t('cookies_required_yes')}</span>
                                                        : <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{t('cookies_required_optional')}</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s3_title')}</h2>
                            <p>{t('cookies_s3_p1')}</p>
                            <p className="mt-3">{t('cookies_s3_p2')}</p>
                            <p className="mt-3 rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-slate-700 text-sm">
                                <strong>{t('cookies_s3_warning')}</strong>
                            </p>
                        </section>

                        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                            <h2 className="mb-3 text-2xl font-semibold text-blue-900">{t('cookies_s4_title')}</h2>
                            <p className="text-blue-800">{t('cookies_s4_p1')}</p>
                            <p className="mt-3 text-blue-800">{t('cookies_s4_p2')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s5_title')}</h2>
                            <p>{t('cookies_s5_p1')}</p>
                            <ul className="mt-3 list-disc space-y-2 pl-6">
                                <li>{t('cookies_s5_li1')}</li>
                                <li>{t('cookies_s5_li2')}</li>
                            </ul>
                            <p className="mt-3">{t('cookies_s5_p2')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s6_title')}</h2>
                            <p>{t('cookies_s6_p1')}</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {BROWSERS.map(b => (
                                    <a key={b.name} href={b.href} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:text-blue-600 transition">
                                        {b.name}
                                    </a>
                                ))}
                            </div>
                            <p className="mt-4 rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-slate-700 text-sm">
                                <strong>{t('cookies_s6_warning')}</strong>
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s7_title')}</h2>
                            <ul className="mt-3 list-disc space-y-2 pl-6">
                                {['li1','li2','li3','li4'].map(k => <li key={k}>{t(`cookies_s7_${k}`)}</li>)}
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s8_title')}</h2>
                            <p>{t('cookies_s8_p1')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s9_title')}</h2>
                            <p>{t('cookies_s9_p1')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('cookies_s10_title')}</h2>
                            <p>{t('cookies_s10_p1')}{' '}<a href="/#contato" className="text-blue-600 hover:underline">{t('cookies_s10_link')}</a>.</p>
                        </section>

                        <div className="border-t border-gray-200 pt-8 flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>{t('legal_see_also')}</span>
                            <a href="/terms" className="text-blue-600 hover:underline">{t('footer_terms')}</a>
                            <a href="/privacy" className="text-blue-600 hover:underline">{t('footer_privacy')}</a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}