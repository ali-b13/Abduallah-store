import type { Metadata } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/cartContext";
import { Toaster } from 'react-hot-toast';
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
      <div dir="rtl"
        className={` antialiased `}
      >

        <CartProvider>
         
        <Navbar/>
        {children}
        <Toaster position="top-center" />
        <Footer/>
        </CartProvider>
      </div>
  );
}
