'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Menu, X, LogOut, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Cart from './ui/Cart'
import { useCart } from '@/context/cartContext'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import AuthController from './model/auth/AuthController'
import { signOut, useSession } from 'next-auth/react'
import SkeletonNavBar from './skeltons/Navbar'

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { cart } = useCart()
  const links = [
    { name: 'الرئيسية', href: '/' },
    { name: 'التسوق', href: '/products' },
    { name: 'طلباتي', href: '/orders' },
    { name: 'تواصل معنا', href: '/contact-us' },
  ]

  if (status === "loading") return <SkeletonNavBar />

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Logo />

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center text-center">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`hover:text-primary transition-colors font-medium ${
                  pathname === link.href ? "text-primary" : "text-gray-700"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {session?.user.isAdmin && (
              <Link 
                href="/admin-panel/dashboard"
                className="hover:text-primary transition-colors font-medium"
              >
                لوحة التحكم
              </Link>
            )}
               <button
              className="p-2 hover:text-primary transition-colors relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {session?.user ? (
              <LogOutButton />
            ) : (
              <AuthController title='تسجيل الدخول' />
            )}
              
          </div>

          {/* Mobile Menu Button and Cart */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              className="p-2 hover:text-primary transition-colors relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:text-primary transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="md:hidden fixed inset-0 bg-white z-40 pt-16"
            >
              <div className="p-4 space-y-4">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-4 py-3 text-lg rounded-lg hover:bg-gray-100 ${
                      pathname === link.href ? "text-primary font-bold" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {session?.user.isAdmin && (
                  <Link
                    href="/admin-panel/dashboard"
                    className={`block px-4 py-3 text-lg rounded-lg hover:bg-gray-100 ${
                      pathname === '/admin-panel/dashboard' ? "text-primary font-bold" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    لوحة التحكم
                  </Link>
                )}

                <div className="border-t pt-4 mt-4">
                  {session?.user ? (
                    <MobileLogOutButton />
                  ) : (
                    <div className="px-4">
                      <AuthController 
                        title='تسجيل الدخول' 
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Cart setCartOpen={setCartOpen} cartOpen={cartOpen} />
    </nav>
  )
}

const LogOutButton = () => {
  return (
    <div className="group relative isolate overflow-hidden rounded-lg border border-primary/20 bg-white/10 backdrop-blur-lg transition-all duration-300 hover:border-primary/30 hover:bg-white/20 px-4 py-2 shadow-lg hover:shadow-xl">
      <button 
        onClick={() => signOut()}
        className="flex items-center gap-2"
      >
        <span className="text-sm font-medium text-primary transition-all duration-300 group-hover:-translate-x-1">
          تسجيل خروج
        </span>
        <div className="relative h-5 w-5 text-primary transition-all duration-300 group-hover:translate-x-1">
          <div className="absolute inset-0 opacity-100 transition-opacity group-hover:opacity-0">
            <LogOut className="h-full w-full" />
          </div>
          <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowRight className="h-full w-full" />
          </div>
        </div>
      </button>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  )
}

const MobileLogOutButton = () => {
  return (
    <button
      onClick={() => signOut()}
      className="w-full flex items-center justify-between px-4 py-3 text-lg text-red-600 hover:bg-red-50 rounded-lg"
    >
      <span>تسجيل خروج</span>
      <LogOut className="h-5 w-5" />
    </button>
  )
}