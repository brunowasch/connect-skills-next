import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Connect Skills",
  description: "Conectando talentos ao mercado de trabalho",
};

import { Toaster } from "sonner";
import { I18nProvider } from "./_components/Providers/I18nProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className={montserrat.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              closeButton: "!left-auto !right-2 !top-2 !transform-none"
            }
          }}
        />
      </body>
    </html>
  );
}
