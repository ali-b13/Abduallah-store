"use client"
import { useEffect, useState } from 'react'
import { ShoppingCart, MapPin, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import OrderStatus from "@/components/model/order/index"
import { useCart } from '@/context/cartContext'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import validator from 'validator'
import Image from 'next/image'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  currency?: {
    code: string
    name: string
  }
}

interface CurrencyGroup {
  currency: {
    code: string
    name: string
  }
  items: CartItem[]
  subtotal: number
}

interface AddressForm {
  address: string
  setAddress:(e:string)=>void;
  handlePlaceOrder:()=>void
}

const CheckoutComponent = () => {
  const { cart, clearCart } = useCart()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error' | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Authentication and cart check
  useEffect(() => {
    if (status === 'loading') return
    if (!session || cart.length === 0) router.push('/')
  }, [session, cart, status, router])

  // Group items by currency
  const groupItemsByCurrency = (items: CartItem[]): Record<string, CurrencyGroup> => 
    items.reduce((acc, item) => {
      const currencyCode = item.currency?.code || 'UNKNOWN'
      if (!acc[currencyCode]) {
        acc[currencyCode] = {
          currency: item.currency || { code: 'UNKNOWN', name: 'عملة غير معروفة' },
          items: [],
          subtotal: 0
        }
      }
      acc[currencyCode].items.push(item)
      acc[currencyCode].subtotal += item.price * item.quantity
      return acc
    }, {} as Record<string, CurrencyGroup>)

  const handlePlaceOrder = async () => {
    try {
      setModalStatus('processing')
      setErrorMessage(null)
      
      // Input validation
      const sanitizedAddress = validator.escape(address.trim())
      if (!sanitizedAddress || sanitizedAddress.length < 10) {
        setErrorMessage('الرجاء إدخال عنوان صحيح (10 أحرف على الأقل)')
      setModalStatus('error')
      return;
      }

      const response = await fetch('/api/store-data/orders/place-order', {
        method: 'POST',
        headers: { 
            'user-agent': 'Mozilla/.*',
            'accept': 'application/json',
            'content-type': 'application/json',
        },
        body: JSON.stringify({ 
          address: sanitizedAddress,
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            currency: item.currency?.code || 'UNKNOWN'
          }))
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'فشل في تقديم الطلب')
      }

      // Clear cart and show success
       setTimeout(() => {
        clearCart()
       }, 5000);
      setOrderId(data.orderId)
      setModalStatus('success')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';

      setErrorMessage(errorMessage)
      setModalStatus('error')
    }
  }

  const handleModalClose = () => {
    setModalStatus(null)
    if (modalStatus === 'success') {
      router.push('/orders')
    }
  }

  if (status === 'loading' || !session || cart.length === 0) {
    return <CheckoutSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AddressForm 
            address={address}
            setAddress={setAddress}
            handlePlaceOrder={handlePlaceOrder}
          />
          
          <OrderSummary groups={Object.values(groupItemsByCurrency(cart))} />
        </div>
      </div>

      <OrderStatus
        status={modalStatus}
        onClose={handleModalClose}
        orderId={orderId || ""}
        errorMessage={errorMessage || ""}
      />
    </div>
  )
}

// Sub-components
const Header = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-12 flex items-center flex-row-reverse gap-4"
  >
    <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-lg">
      <ShoppingCart className="h-8 w-8 text-white" />
    </div>
    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
      عملية الدفع
    </h1>
  </motion.div>
)

const AddressForm = ({ address, setAddress, handlePlaceOrder }:AddressForm) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
  >
    <div className="flex items-center flex-row-reverse mb-8 pb-6 border-b border-gray-200">
      <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg mr-4">
        <MapPin className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">تفاصيل الشحن</h2>
    </div>

    <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder() }}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 text-right">
            العنوان الكامل
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 text-right text-gray-800"
            rows={4}
            placeholder="الرجاء إدخال العنوان الكامل للتسليم..."
            required
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full mt-10 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        type="submit"
      >
        تأكيد الطلب الآن
      </motion.button>
    </form>
  </motion.div>
)

const OrderSummary = ({ groups }:{groups:CurrencyGroup[]}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-fit sticky top-8"
  >
    <div className="flex items-center flex-row-reverse mb-8 pb-6 border-b border-gray-200">
      <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg mr-4">
        <Globe className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">ملخص الطلب</h2>
    </div>

    {groups.map((group) => (
      <CurrencyGroup key={group.currency.code} group={group} />
    ))}
  </motion.div>
)

const CurrencyGroup = ({ group }: { group: CurrencyGroup }) => (
  <div className="mb-10 pb-10 border-b border-gray-200 last:border-0">
    <div className="flex items-center flex-row-reverse mb-6">
      <h3 className="text-lg font-semibold text-gray-700">
        ({group.currency.code}) {group.currency.name}
      </h3>
    </div>

    {group.items.map((item) => (
      <div key={item.id} className="flex items-center flex-row-reverse mb-6 p-4 rounded-xl hover:bg-gray-50">
        <Image
          src={item.image}
          alt={item.name}
          width={160}
          height={160}
          className="w-20 h-20 object-cover rounded-xl ml-6 border-2 border-gray-200"
        />
        <div className="flex-1 text-right">
          <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
          <p className="text-gray-600 text-sm mt-1">
            {item.quantity} × {item.price.toFixed(2)} {group.currency.code}
          </p>
        </div>
        <div className="text-left">
          <p className="text-lg font-semibold text-red-600">
            {(item.price * item.quantity).toFixed(2)} {group.currency.code}
          </p>
        </div>
      </div>
    ))}

    <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
      <span className="text-xl font-bold text-red-600">
        {group.subtotal.toFixed(2)} {group.currency.code}
      </span>
      <span className="text-lg font-semibold text-gray-700">المجموع الفرعي</span>
    </div>
  </div>
)

const CheckoutSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse">
        <div className="h-14 bg-gray-200 rounded-xl w-1/3 mb-12" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-8" />
            <div className="space-y-6">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-14 bg-gray-200 rounded-xl mt-10" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl h-fit sticky top-8">
            <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-8" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center flex-row-reverse">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl ml-6" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
              <div className="h-5 bg-gray-200 rounded w-1/4 mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)



export default CheckoutComponent