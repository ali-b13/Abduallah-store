'use client';

import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { SiWhatsapp, SiFacebook, SiInstagram } from 'react-icons/si';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clear previous toasts
    toast.dismiss();

    try {
      const response = await fetch('/api/store-data/messages', {
        method: 'POST',
        headers: {
            'user-agent': 'Mozilla/.*',
            'accept': 'application/json',
            'content-type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل إرسال الرسالة، يرجى المحاولة مرة أخرى');
      }

      // Success notification
      toast.success('تم إرسال رسالتك بنجاح، شكراً لتواصلك معنا!', {
        duration: 5000,
        position: 'top-center',
        style: {
          backgroundColor: '#16a34a',
          color: '#fff',
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif'
        }
      });
      
      setFormData({ name: '', mobile: '', message: '' });
    } catch (error) {
      // Error notification
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع', {
        duration: 5000,
        position: 'top-center',
        style: {
          backgroundColor: '#dc2626',
          color: '#fff',
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add mobile number validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate mobile number input
    if (name === 'mobile') {
      const isValid = /^[0-9]*$/.test(value);
      if (!isValid) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Toast Notifications Container */}
      <Toaster
        containerStyle={{
          top: 40,
          right: 20,
          left: 20,
        }}
        toastOptions={{
          className: 'font-noto-arabic',
        }}
      />
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 relative overflow-hidden rounded-3xl shadow-2xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-400 opacity-95 z-0" />
          <div className="relative z-10 py-20 px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6 drop-shadow-xl font-cairo">
              تواصل معنا
            </h1>
            <div className="inline-flex items-center justify-center space-x-4">
              <div className="h-1 w-16 bg-amber-300 rounded-full" />
              <p className="text-xl font-medium text-amber-100 italic font-noto-arabic">
              نحن هنا لمساعدتك في أي استفسار
              </p>
              <div className="h-1 w-16 bg-amber-300 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <FaPhone className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-cairo">الهاتف</h3>
            <p className="text-gray-600 font-noto-arabic">+967 78 181 4365</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <FaEnvelope className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-cairo">البريد الإلكتروني</h3>
            <p className="text-gray-600 font-noto-arabic">alialamri.work@gmail.com</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <FaMapMarkerAlt className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-cairo">العنوان</h3>
            <p className="text-gray-600 font-noto-arabic">عرماء, شبوة, الجمهورية اليمنية</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center font-cairo">
            أرسل رسالتك
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            <div>
              <label className="block text-gray-700 mb-3 font-noto-arabic">الاسم الكامل</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="text-slate-700 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 text-right"
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

         <div>
            <label className="block text-gray-700 mb-3 font-noto-arabic">رقم الجوال</label>
            <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="text-slate-700 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 text-right"
            placeholder="777123456"
            pattern="^(?:00967|967|\+967|0)?7[0-9]{8}$"
            required
            />
            <p className="text-sm text-gray-500 mt-1 font-noto-arabic">الرجاء إدخال رقم يمني صحيح (مثال: 777123456)</p>
      </div>


            <div>
              <label className="block text-gray-700 mb-3 font-noto-arabic">الرسالة</label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className=" text-slate-700 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 text-right"
                placeholder="أدخل رسالتك هنا..."
                required
              ></textarea>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  جاري الإرسال...
                </span>
              ) : (
                'إرسال الرسالة'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Social Media */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 font-cairo">تواصل عبر وسائل التواصل الاجتماعي</h3>
          <div className="flex justify-center items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="p-3 bg-green-600 rounded-full text-white transition-colors"
            >
              <SiWhatsapp className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="p-3 bg-blue-600 rounded-full text-white  transition-colors"
            >
              <SiFacebook className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="p-3 bg-gray-300 rounded-full text-orange-600  transition-colors"
            >
              <SiInstagram className="w-6 h-6" />
            </motion.a>
          </div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl shadow-xl overflow-hidden"
        >
        <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15809.55298918309!2d47.250634!3d15.3439951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDIwJzM4LjQiTiA0N8KwMTUnMTMuMSJF!5e1!3m2!1sen!2sye!4v1684912345678&t=k"
  width="100%"
  height="450"
  className="border-0"
  allowFullScreen
  loading="lazy"
></iframe>
        </motion.div>
      </div>
    </div>
  );
}