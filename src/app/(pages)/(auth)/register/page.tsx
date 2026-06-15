import { Suspense } from 'react'
import { Header, Footer } from "@/src/app/_components/Layout/index"
import { RegisterCard } from '@/src/app/(pages)/(auth)/register/_components/Register'

export default function Register() {
  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterCard />
      </Suspense>
      <Footer />
    </>
  )
}
