import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '../styles/main.scss';
import '../app/globals.css';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:"Qodwa | Quran Platform",
  description: "Qodwa is a platform that helps you to memorize the Quran easily and effectively.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning={true} className={inter.className}>{children}</body>
    </html>
  );
}
