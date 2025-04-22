import type { Metadata } from "next";
import "@/app/globals.css";
import { SessionCustomProvider } from "@/context/SessionProvider";
export const metadata: Metadata = {
  title: "Abduallah Store",
  description: "Store that sells and delivers items to your home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">

      <SessionCustomProvider>
      <body
        className={` antialiased `}
        >
       
        {children}
       
      </body>
        </SessionCustomProvider>
    </html>
  );
}
