export interface OrderProduct {
    id: string;
    productId: string;
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }
  
  export interface Order {
    id: string;
    createdAt: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'processing' | 'declined';
    address: string;
    products: OrderProduct[];
  }
  
  export interface OrdersStats {
    newOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
  }
  
  export interface Pagination {
    page: number;
    perPage: number;
    total: number;
  }
  
  export type StatusFilter = 'all' | Order['status'];
  export type SortOrder = 'latest' | 'oldest';