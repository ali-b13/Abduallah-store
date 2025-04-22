import { Package, Link2Icon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table';
import  Button  from '../Button';
import { Order } from '../../types';
import Link from 'next/link';
import { OrderStatusBadge } from '../Badge';
import  Card from '../card/Card';
import  CardContent from '../card/CardContent';
import  CardHeader from '../card/CardHeader';
import CardTitle  from '../card/CardTitle';

interface LatestOrdersProps {
  title: string;
  orders: Order[];
  onConfirm: (orderId: string) => void;
  onDeliver: (orderId: string) => void;
  onDecline?: (orderId: string) => void;
}

 const LatestOrders = ({
  title,
  orders,
  onConfirm,
  onDeliver,
  onDecline,
}: LatestOrdersProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package className="w-5 h-5" />
        {title} ({orders.length})
      </CardTitle>
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
            <TableHead data-label="Actions">الاجراء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
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
              <TableCell data-label="ألاجراء" className="text-right">
                <div className="flex gap-2 justify-end">
                  {order.status === 'pending' && (
                    <>
                      <Button variant="success" onClick={() => onConfirm(order.id)}>
                        تأكيد
                      </Button>
                      <Button variant="destructive" onClick={() => onDecline?.(order.id)}>
                        رفض
                      </Button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <Button variant="success" onClick={() => onDeliver(order.id)}>
                      تم التسليم
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default LatestOrders