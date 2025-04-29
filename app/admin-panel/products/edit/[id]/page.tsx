'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Button from '@/app/admin-panel/components/Button';
import Card from '@/app/admin-panel/components/card/Card';
import CardHeader from '@/app/admin-panel/components/card/CardHeader';
import CardTitle from '@/app/admin-panel/components/card/CardTitle';
import CardContent from '@/app/admin-panel/components/card/CardContent';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { Select } from '@/components/ui/Select';
import ImageUpload from '@/app/admin-panel/components/ImageUploader';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice: number;
  images: string[];
  description: string;
  currencyId:string
  categoryId:string
  discount:{
    price:number;
  }
  
}

const EditProductPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencies,setCurrencies]=useState([])
  const [categories,setCategories]=useState([])
  const [imageUrls, setImageUrls] = useState<string[]>([]); // Cloudinary URLs


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        if(!data.product?.discount){
          setProduct({...data.product,discount:{price:0}})
        }else{
          setProduct(data.product)
        }
        setCategories(data.categories)
        setCurrencies(data.currencies)
        setImageUrls(data.product.images)
      } catch (error) {
        console.log(error)
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

 

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
  
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          description: product.description,
          discountPrice: product.discount.price,
          categoryId: product.categoryId,
          currencyId: product.currencyId,
          images: imageUrls // Send Cloudinary URLs directly
        }),
      });
  
      if (!response.ok) throw new Error('Failed to update product');
      
      toast.success('Product updated successfully');
      router.push('/admin-panel/products');
    } catch (error) {
      console.log(error);
      toast.error('Failed to update product');
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

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-800">المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-4 text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        رجوع
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">تعديل المنتج</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">اسم المنتج</label>
                  <Input
                    value={product.name}
                    onChange={(e) => setProduct({...product, name: e.target.value})}
                    required
                    className='text-gray-800'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800"> سعر الشراء</label>
                  <Input
                    type="number"
                    value={product.salePrice||0.00}
                    onChange={(e) => setProduct({...product, salePrice: parseFloat(e.target.value)})}
                    required
                    min="0"
                    step="0.01"
                    className='text-gray-800'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800"> سعر البيع</label>
                  <Input
                    type="number"
                    value={product.price||0.00}
                    onChange={(e) => setProduct({...product, price: parseFloat(e.target.value)})}
                    required
                    min="0"
                    step="0.01"
                    className='text-gray-800'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">الفئة</label>
                  <Select
                    options={categories}
                    value={product.categoryId}
                    onChange={(e) => setProduct({...product, categoryId:e.target.value})}
                    required
                    className='text-gray-800'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">العملة</label>
                  <Select
                  options={currencies}
                    value={product.currencyId}
                    onChange={(e) => setProduct({...product, currencyId: e.target.value})}
                    required
                    className='text-gray-800'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800"> السعر المخفض</label>
                  <Input
                    type='number'
                    value={product.discount?.price||0}
                    onChange={(e) => setProduct({...product, discount: {price:parseFloat(e.target.value)}})}
                     min="0"
                    step="0.01"
                    className='text-gray-800'
                  />
                </div>
                

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">الوصف</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                    className="w-full border rounded-md p-2 min-h-[100px] resize-none text-gray-800"
                    required
                    
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <ImageUpload
                setImageUrls={setImageUrls}
                values={imageUrls}
                maxFiles={5}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3 ">
              <Button
                type="button"
                variant="outline"
                className='text-gray-800'
                onClick={() => router.push('/admin/products')}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductPage;