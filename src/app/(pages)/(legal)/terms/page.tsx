'use client'
import { useTranslation } from 'react-i18next'
import { Header, Footer } from '@/src/app/_components/Layout/index'

export default function Terms() {
    const { t } = useTranslation()
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
                    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="inline-flex items-center rounded-full bg-white/15 border border-white/20 px-3 py-1 text-sm font-medium mb-4">
                            {t('legal_document_badge')}
                        </div>
                        <h1 className="text-4xl font-bold">{t('terms_title')}</h1>
                        <p className="mt-3 text-blue-200">{t('legal_updated_at')} · {t('terms_hero_subtitle')}</p>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="space-y-10 text-gray-700 leading-relaxed">

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s1_title')}</h2>
                            <p>{t('terms_s1_p1')}</p>
                            <p className="mt-3">{t('terms_s1_p2')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s2_title')}</h2>
                            <p>{t('terms_s2_p1')}</p>
                            <ul className="mt-4 list-disc space-y-2 pl-6">
                                {['li1','li2','li3','li4','li5','li6','li7'].map(k => (
                                    <li key={k}>{t(`terms_s2_${k}`)}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s3_title')}</h2>
                            <p>{t('terms_s3_p1')}</p>
                            <p className="mt-3">{t('terms_s3_p2')}</p>
                            <p className="mt-3">{t('terms_s3_p3')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s4_title')}</h2>
                            <h3 className="mt-4 mb-2 text-lg font-semibold text-gray-800">{t('terms_s4_candidates_title')}</h3>
                            <ul className="list-disc space-y-2 pl-6">
                                {['li1','li2','li3','li4'].map(k => <li key={k}>{t(`terms_s4_c_${k}`)}</li>)}
                            </ul>
                            <h3 className="mt-4 mb-2 text-lg font-semibold text-gray-800">{t('terms_s4_companies_title')}</h3>
                            <ul className="list-disc space-y-2 pl-6">
                                {['li1','li2','li3','li4'].map(k => <li key={k}>{t(`terms_s4_e_${k}`)}</li>)}
                            </ul>
                            <h3 className="mt-4 mb-2 text-lg font-semibold text-gray-800">{t('terms_s4_mentors_title')}</h3>
                            <ul className="list-disc space-y-2 pl-6">
                                {['li1','li2','li3','li4'].map(k => <li key={k}>{t(`terms_s4_m_${k}`)}</li>)}
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s5_title')}</h2>
                            <p>{t('terms_s5_p1')}</p>
                            <p className="mt-3">{t('terms_s5_p2')}</p>
                        </section>

                        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                            <h2 className="mb-3 text-2xl font-semibold text-blue-900">{t('terms_s6_title')}</h2>
                            <p className="text-blue-800">{t('terms_s6_p1')}</p>
                            <p className="mt-3 text-blue-800">{t('terms_s6_p2')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s7_title')}</h2>
                            <p>{t('terms_s7_p1')}</p>
                            <p className="mt-3">{t('terms_s7_p2')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s8_title')}</h2>
                            <p>{t('terms_s8_intro')}</p>
                            <ul className="mt-3 list-disc space-y-2 pl-6">
                                {['li1','li2','li3','li4','li5','li6'].map(k => <li key={k}>{t(`terms_s8_${k}`)}</li>)}
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s9_title')}</h2>
                            <p>{t('terms_s9_p1')}</p>
                            <p className="mt-3">{t('terms_s9_p2')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s10_title')}</h2>
                            <p>{t('terms_s10_p1')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s11_title')}</h2>
                            <p>{t('terms_s11_p1')}</p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-900">{t('terms_s12_title')}</h2>
                            <p>{t('terms_s12_p1')}{' '}<a href="/#contato" className="text-blue-600 hover:underline">{t('terms_s12_link')}</a>.</p>
                        </section>

                        <div className="border-t border-gray-200 pt-8 flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>{t('legal_see_also')}</span>
                            <a href="/privacy" className="text-blue-600 hover:underline">{t('footer_privacy')}</a>
                            <a href="/cookies" className="text-blue-600 hover:underline">{t('footer_cookies')}</a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}