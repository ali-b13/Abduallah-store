import Logo from "./Logo";

// components/footer/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="flex flex-col gap-3">
            <Logo white/>
            <p className="text-sm">
              وجهتك الرئيسية لتجارب التسوق الحديثة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
                      {[
            { name: 'اتصل بنا', path: '/contact-us' },
            { name: 'الأسئلة المتكررة', path: '/about' },
            { name: 'سياسة الشحن', path: '/about' }
          ].map((link) => (
            <li key={link.name}>
              <a 
                href={link.path} 
                className="hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            </li>
          ))}
            </ul>
          </div>

        

          </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()}  جميع الحقوق محفوظة || متجر عبدالله
          </p>
        </div>
      </div>
    </footer>
  )
}
