import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// Import Roboto font for Material UI
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Import theme registry client component
import ThemeRegistry from "@/components/ThemeRegistry";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sistema de Cadastro de Pessoas",
  description: "Aplicação para gerenciamento de cadastro de pessoas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={roboto.className}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
