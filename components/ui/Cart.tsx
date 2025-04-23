import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, SmileIcon } from "lucide-react";
import { useCart } from "@/context/cartContext";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthController from "../model/auth/AuthController";

interface CartProps {
  cartOpen?: boolean;
  setCartOpen: (open: boolean) => void;
}

const Cart = ({ cartOpen, setCartOpen }: CartProps) => {
  const { cart, removeFromCart, updateQuantity } = useCart() || { cart: [], removeFromCart: () => {}, updateQuantity: () => {} };
  const {data:session}=useSession()
  // حساب السعر الإجمالي
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);






  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 overflow-scroll flex flex-col p-6 w-full md:w-1/3"
        >
          {/* زر الإغلاق */}
          <button className="self-end p-2 text-gray-700 hover:text-red-500 transition-all" onClick={() => setCartOpen(false)}>
            <X className="h-6 w-6" />
          </button>

          {/* عنوان العربة */}
          <h2 className="text-2xl font-bold mb-6 text-gray-800">عربة التسوق</h2>

          {cart.length === 0 ? (
            <div className="flex items-center justify-center text-xl gap-4 mt-[10rem]">
              <p className="text-center text-gray-500">السلة فارغة , اضف بعض المنتجات لها </p>
              <SmileIcon className="text-gray-400"/>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl shadow-sm">
                  {/* صورة العنصر */}
                  <Image src={item.image} alt={item.name} width={70} height={70} className="rounded-lg" />

                  {/* تفاصيل العنصر */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.price.toFixed(2)} ريال</p>
                    <p className="text-sm text-gray-600"> الكمية :{item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-800">المجموع الفرعي: {(item.price * item.quantity).toFixed(2)} ريال</p>
                  </div>

                  {/* التحكم في الكمية */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-all">
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="font-semibold text-lg w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-all">
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* إزالة العنصر */}
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* قسم السعر الإجمالي */}
              <div className="flex justify-between text-xl font-bold border-t pt-5 mt-5 text-slate-700">
                <span>الإجمالي:</span>
                <span>{totalPrice} ريال</span>
              </div>

              {/* زر صفحه الدفع */}
              {
                session?.user.id?
                <Link onClick={()=>setCartOpen(false)} href={'/checkout'} className="w-full bg-red-500 text-white py-3 text-center rounded-lg text-lg font-bold hover:bg-red-600 transition-all">
                الانتقال إلى الدفع
              </Link>
                  : <AuthController title="سجل الدخول لاتمام الطلب"/>
              }
                
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cart;
