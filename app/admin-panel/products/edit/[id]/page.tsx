'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Save, Trash2, ArrowLeft, Plus } from 'lucide-react';
import Button from '@/app/admin-panel/components/Button';
import Card from '@/app/admin-panel/components/card/Card';
import CardHeader from '@/app/admin-panel/components/card/CardHeader';
import CardTitle from '@/app/admin-panel/components/card/CardTitle';
import CardContent from '@/app/admin-panel/components/card/CardContent';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Select } from '@/components/ui/Select';

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
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

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
        setImagePreview(data.product.images.map((img:string) => 
          `${process.env.NEXT_PUBLIC_API_URL}/${img}`
        ));
      } catch (error) {
        console.log(error)
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    if (!product) return;
    const existingCount = product.images.length;
    // Remove existing image
    if (index < existingCount) {
      const updatedImages = product.images.filter((_, i) => i !== index);
      setProduct({ ...product, images: updatedImages });
    } else {
      // Remove new image
      const removeIdx = index - existingCount;
      setNewImages(prev => prev.filter((_, i) => i !== removeIdx));
    }
    // Always remove preview
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      const formData = new FormData();
      const remainingExistingImages = imagePreview
      .filter(img => product.images.includes(img.replace(`${process.env.NEXT_PUBLIC_API_URL}/`, '')))
      .map(img => img.replace(`${process.env.NEXT_PUBLIC_API_URL}/`, ''));

    formData.append('existingImages', remainingExistingImages.join(','));
      formData.append('name', product.name);
      formData.append('price', product.price.toString());
      formData.append('salePrice', product.salePrice.toString());
      formData.append('description', product.description);
      formData.append('discountPrice', product.discount.price.toString());

      formData.append('categoryId', product.categoryId);
      formData.append('currencyId', product.currencyId);
      
      newImages.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update product');
      
      toast.success('Product updated successfully');
      router.push('/admin-panel/products');
    } catch (error) {
      console.log(error)
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
        <p className="text-xl">المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
          <CardTitle className="text-lg">تعديل المنتج</CardTitle>
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
                  <label className="block text-sm font-medium mb-1"> سعر الشراء</label>
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
                  <label className="block text-sm font-medium mb-1"> سعر البيع</label>
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
                    options={categories}
                    value={product.categoryId}
                    onChange={(e) => setProduct({...product, categoryId:e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">العملة</label>
                  <Select
                  options={currencies}
                    value={product.currencyId}
                    onChange={(e) => setProduct({...product, currencyId: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1"> السعر المخفض</label>
                  <Input
                    type='number'
                    value={product.discount?.price||0}
                    onChange={(e) => setProduct({...product, discount: {price:parseFloat(e.target.value)}})}
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
                <div className="grid grid-cols-2  lg:grid-cols-2 gap-3 mb-4">
                {imagePreview.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <div className="relative w-full h-full rounded-md overflow-hidden border hover:shadow-lg transition-all duration-200">
                      <Image
                        src={img}
                        alt={`Product preview ${index}`}
                        fill
                        unoptimized
                        className="object-contain p-1 bg-white"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1.5 
                                  opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity
                                  backdrop-blur-sm hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <Plus className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">إضافة صور</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <Button
                type="button"
                variant="outline"
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