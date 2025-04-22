import { ChevronLeft, ChevronRight, Loader2, Link2Icon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table';
import Button  from '../Button';
import { Order, Pagination } from '../../types';
import Link from 'next/link';
import { OrderStatusBadge } from '../Badge';
import  Card from '../card/Card';
import  CardContent from '../card/CardContent';
import  CardHeader from '../card/CardHeader';
import CardTitle  from '../card/CardTitle';

interface AllOrdersProps {
  orders: Order[];
  isLoading: boolean;
  pagination: Pagination;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: string) => void;
  onOrderClick: (orderId: string) => void;
}

 const AllOrders = ({
  orders,
  isLoading,
  pagination,
  totalPages,
  onPageChange,
  onPerPageChange,
  onOrderClick
}: AllOrdersProps) => (
  <Card className="lg:col-span-2 relative">
    {isLoading && (
      <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    )}
    
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>جميع الطلبات ({pagination.total})</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">عناصر لكل صفحة:</span>
          <select
            value={pagination.perPage}
            onChange={(e) => onPerPageChange(e.target.value)}
            className="border rounded p-1 text-sm"
          >
            {[10, 20, 50].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-label="Order ID">رقم الطلب</TableHead>
            <TableHead data-label="Date">التاريخ</TableHead>
            <TableHead data-label="Address">العنوان</TableHead>
            <TableHead data-label="Products">المنتجات</TableHead>
            <TableHead data-label="Link">المزيد</TableHead>
            <TableHead data-label="Status">الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} onClick={() => onOrderClick(order.id)} >
              <TableCell data-label="رقم الطلب">{order.id}</TableCell>
              <TableCell data-label="التاريخ">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell data-label="العنوان">{order.address}</TableCell>
              <TableCell data-label="المنتجات">
                {order.products.map((product, index) => (
                  <div key={product.id}>
                    {index + 1}. {product.product.name} (x{product.quantity})
                  </div>
                ))}
              </TableCell>
              <TableCell data-label="رابط">
                <Link href={`/admin-panel/orders/${order.id}`}><Link2Icon color='blue'/></Link>
              </TableCell>
              <TableCell data-label="الحالة">
                <OrderStatusBadge status={order.status}/>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          عرض {((pagination.page - 1) * pagination.perPage) + 1} إلى {Math.min(pagination.page * pagination.perPage, pagination.total)} من {pagination.total} طلب
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (pagination.page <= 3) pageNum = i + 1;
            else if (pagination.page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = pagination.page - 2 + i;
            
            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            disabled={pagination.page >= totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AllOrders