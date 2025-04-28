"use client";
import { useState } from 'react';
import { ChevronDownCircle, ChevronUpCircle } from 'lucide-react';


interface Question {
  id: number;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      question: "ما هي سياسة الدفع عند الاستلام؟",
      answer: "نحن نقدم خدمة الدفع نقدًا عند الاستلام فقط. سيتم تسليم الطلب وتسليمه إليك أولاً، ثم تقوم بدفع المبلغ نقدًا لموظف التوصيل."
    },
    {
      id: 2,
      question: "ما هي المناطق التي تخدمونها في التوصيل؟",
      answer: "نقوم بالتوصيل إلى جميع المناطق داخل عرماء . للتوصيل خارج عرما يرجى التواصل مع خدمة العملاء للتحقق من التوفر."
    },
    {
      id: 3,
      question: "كم تستغرق مدة التوصيل؟",
      answer: "مدة التوصيل القياسية من اسبوع الئ ثلاثة اسابيع "
    },
    {
      id: 4,
      question: "كيف يمكنني تتبع طلبي؟",
      answer: " بعد تأكيد الطلب،  سيظهر لك خيار حالة الطلب سيتم تحديثها عبر البائع  .   تابع حالة الطلب من خلال حسابك على الموقع باستمرار"
    },
    {
      id: 5,
      question: "ما هي سياسة الإرجاع والاستبدال؟",
      answer: "لايمكن ان تسترد البضايع بمجرد ان استلمها العميل  "
    },
    {
      id: 6,
      question: "هل لديكم خدمة عملاء على مدار الساعة؟",
      answer: "خدمة العملاء متاحة من الساعة 8 صباحًا حتى 10 مساءً طوال أيام الأسبوع، عبر الهاتف أو الواتساب أو البريد الإلكتروني."
    },
    {
      id: 7,
      question: "كيف يمكنني التأكد من جودة المنتجات؟",
      answer: "جميع منتجاتنا أصلية ومضمونة مع وجود فواتير ضمان."
    },
    {
      id: 8,
      question: "ما هي أوقات عمل الفروع؟",
      answer: "الفروع الرئيسية تعمل من السبت إلى الخميس من الساعة 9 صباحًا حتى 9 مساءً، والجمعة من 4 مساءً حتى 10 مساءً."
    }
  ];

  const toggleQuestion = (id: number) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-slate-900" dir="rtl">
      <h1 className="text-3xl font-bold text-center mb-8 ">الأسئلة الشائعة</h1>
      
      <div className="space-y-4">
        {questions.map((q) => (
          <div 
            key={q.id}
            className="border rounded-lg shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleQuestion(q.id)}
              className="w-full px-6 py-4 text-right flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              aria-expanded={openQuestion === q.id}
              aria-controls={`answer-${q.id}`}
            >
              <span className="font-medium text-gray-900">{q.question}</span>
              {openQuestion === q.id ? (
                <ChevronUpCircle className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDownCircle className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            <div
              id={`answer-${q.id}`}
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openQuestion === q.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 py-4 bg-white border-t">
                <p className="text-gray-600">{q.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}