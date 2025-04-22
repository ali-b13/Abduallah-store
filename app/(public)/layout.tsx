import type { Metadata } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/cartContext";
import { Toaster } from 'react-hot-toast';
export const metadata: Metadata = {
  title: "متجر عبدالله",
  description: "متجر يبيع ويوصل المنتجات إلى منزلك",
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
