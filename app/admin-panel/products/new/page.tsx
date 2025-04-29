'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import Card from '@/app/admin-panel/components/card/Card';
import CardHeader from '@/app/admin-panel/components/card/CardHeader';
import CardTitle from '@/app/admin-panel/components/card/CardTitle';
import CardContent from '@/app/admin-panel/components/card/CardContent';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { Select } from '@/components/ui/Select';
import ImageUpload from '../../components/ImageUploader';

interface Currency {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const NewProductPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    salePrice: 0,
    description: '',
    currencyId: '',
    categoryId: '',
    discount: { price: 0 }
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]); // Cloudinary URLs
    const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currRes, catRes] = await Promise.all([
          fetch('/api/admin/currencies'),
          fetch('/api/admin/categories')
        ]);

        if (!currRes.ok || !catRes.ok) throw new Error('Failed to fetch data');
        
        const currenciesData = await currRes.json();
        const categoriesData = await catRes.json();

        setCurrencies(currenciesData.currencies);
        setCategories(categoriesData.categories);

        if (currenciesData.currencies.length > 0) {
          setProduct(prev => ({
            ...prev,
            currencyId: currenciesData.currencies[0].id,
            categoryId: categoriesData.categories[0]?.id || ''
          }));
        }
      } catch (error) {
        console.log(error)
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        ...product,
        images: imageUrls, // Send Cloudinary URLs directly
        discount: product.discount.price > 0 ? { price: product.discount.price } : null
      };
 console.log(productData,'data')
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error('Failed to create product');
      toast.success('Product created successfully');
      router.push('/admin-panel/products');
    } catch (error) {
      console.log(error);
      toast.error('Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }
  
 console.log(imageUrls,'data')
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto text-gray-800">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        رجوع
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">منتج جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                  <Input
                    value={product.name}
                    onChange={(e) => setProduct({...product, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">سعر الشراء</label>
                  <Input
                    type="number"
                    value={product.salePrice||0.00}
                    onChange={(e) => setProduct({...product, salePrice: parseFloat(e.target.value)})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">سعر البيع</label>
                  <Input
                    type="number"
                    value={product.price||0.00}
                    onChange={(e) => setProduct({...product, price: parseFloat(e.target.value)})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">الفئة</label>
                  <Select
                    options={categories.map(c => ({ label: c.name, value: c.id }))}
                    value={product.categoryId}
                    onChange={(e) => setProduct({...product, categoryId: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">العملة</label>
                  <Select
                    options={currencies.map(c => ({ label: c.name, value: c.id }))}
                    value={product.currencyId}
                    onChange={(e) => setProduct({...product, currencyId: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">السعر المخفض</label>
                  <Input
                    type="number"
                    value={product.discount.price||0.00}
                    onChange={(e) => setProduct({
                      ...product,
                      discount: { price: parseFloat(e.target.value) }
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                    className="w-full border rounded-md p-2 min-h-[100px] resize-none"
                    required
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-1">الصور</label>
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 mb-4">
                </div>
                  <ImageUpload 
                    values={imageUrls}
                    setImageUrls={setImageUrls}
                    maxFiles={5} // Set your desired max files
                    />
                    
              </div>
             </div>

            <div className="flex justify-end mt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin-panel/products')}
              >
                إلغاء
              </Button>
              <Button 
             
              type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                انشاء المنتج
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProductPage;