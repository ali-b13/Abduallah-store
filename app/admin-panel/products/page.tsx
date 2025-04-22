'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Plus, Trash, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/card/Card';
import CardHeader from '../components/card/CardHeader';
import CardTitle from '../components/card/CardTitle';
import CardContent from '../components/card/CardContent';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import ConfirmationModal, { ModalStatus } from '../components/ConfirmModal';
import productImage from "@/public/product-img.jpg"
interface Discount {
  isValid: boolean;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice: number;
  category: {
    type: string;
    name: string;
  };
  discount: Discount;
  images: string[];
  createdAt: string;
  currency: {
    code: string;
    name: string;
  };
}

const AdminProductsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // For delete confirmation modal
  const [deleteModalStatus, setDeleteModalStatus] = useState<ModalStatus>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>('');

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `/api/admin/products?page=${currentPage}&search=${searchQuery}`
        );

        if (!response.ok) throw new Error('فشل في جلب المنتجات');

        const data = await response.json();
        setProducts(data.products);
        setTotalItems(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.log(err)
        setError('فشل في تحميل المنتجات');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [session, router, currentPage, searchQuery]);

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalStatus('confirming');
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setDeleteModalStatus('processing');
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
        setTotalItems(prev => prev - 1);
        setDeleteModalStatus('success');
        setTimeout(() => {
          setDeleteModalStatus(null);
          setSelectedProduct(null);
        }, 1500);
      } else {
        throw new Error('Deletion failed');
      }
    } catch (err) {
      console.log(err)
      setDeleteErrorMessage('حدث خطأ أثناء عملية الحذف');
      setDeleteModalStatus('error');
    }
  };

  const handleEditProduct = (id: string) => {
    router.push(`/admin-panel/products/edit/${id}`);
  };

  const handleAddProduct = () => {
    router.push('/admin-panel/products/new');
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (loading) return <ProductsSkeleton />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">المنتجات ({totalItems})</h1>
        <div className="w-full md:w-auto flex flex-col-reverse md:flex-row gap-3">
          <Input
            placeholder="ابحث عن منتج بالاسم..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full md:w-64"
          />
          <Button variant="default" onClick={handleAddProduct} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>قائمة المنتجات</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصورة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>سعر الشراء</TableHead>
                <TableHead>سعر البيع</TableHead>
                <TableHead>التخفيض</TableHead>
                <TableHead>تاريخ الإضافة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products?.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <PackageOpen className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-600">لا توجد منتجات متاحة</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell data-label="الصورة">
                      <Image
                        alt={product.name}
                        src={ product.images.length?`${process.env.NEXT_PUBLIC_API_URL}/${product.images[0]}`: productImage}
                        width={60}
                        height={60}
                        className="rounded-md"
                      />
                    </TableCell>
                    <TableCell data-label="الاسم" className="font-medium text-gray-500">{product.name}</TableCell>
                    <TableCell data-label="الفئة" className="text-gray-500">{product.category.name}</TableCell>
                    <TableCell data-label="سعر الشراء">
                      <span className="text-gray-500">
                        {product.salePrice} {product.currency.code}
                      </span>
                    </TableCell>
                    <TableCell data-label="سعر البيع">
                      <span className="text-gray-500">
                        {product.price} {product.currency.code}
                      </span>
                    </TableCell>
                    <TableCell data-label="التخفيض">
                      {product?.discount?.isValid ? (
                        <span className="text-red-500">
                          {product.discount.price} {product.currency.name}
                        </span>
                      ) : (
                        <span className="text-gray-500">لا يوجد</span>
                      )}
                    </TableCell>
                    <TableCell data-label="تاريخ الإضافة" className="text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell  data-label="الإجراءات">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditProduct(product.id)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <span>تعديل</span>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openDeleteModal(product)}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <span>حذف</span>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        status={deleteModalStatus}
        onClose={() => {
          setDeleteModalStatus(null);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        description={
          <>
            هل أنت متأكد من رغبتك في حذف المنتج{' '}
            <strong>{selectedProduct?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
          </>
        }
        processingTitle="جارٍ حذف المنتج"
        processingDescription="يرجى الانتظار أثناء عملية الحذف"
        successTitle="تم الحذف بنجاح"
        successDescription="تم حذف المنتج بنجاح"
        errorTitle="فشل الحذف"
        errorDescription="حدث خطأ أثناء عملية الحذف"
        errorMessage={deleteErrorMessage}
        confirmLabel="تأكيد الحذف"
        cancelLabel="إلغاء"
        retryLabel="حاول مجدداً"
      />
    </div>
  );
};

export default AdminProductsPage;

const ProductsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border-b">
        <div className="h-12 w-12 bg-gray-200 rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    ))}
  </div>
);
