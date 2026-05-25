export type Role = 'admin' | 'staff' | 'viewer';
export type PaymentMethod = 'Cash' | 'Bank' | 'Jawwal Pay' | 'Other';
export type TransactionStatus = 'Paid' | 'Partial' | 'Unpaid';

export interface Shop {
  id: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  shop_id: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string | null;
  city: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  category: string | null;
  sku: string | null;
  price: number;
  stock: number;
  low_stock_threshold: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Payment {
  id: string;
  shop_id: string;
  transaction_id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  shop_id: string;
  customer_id: string;
  date: string;
  subtotal: number;
  paid_total: number;
  remaining: number;
  status: TransactionStatus;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
}

export interface TransactionDetails extends Transaction {
  customer?: Customer | null;
  items: TransactionItem[];
  payments: Payment[];
}

export interface DashboardStats {
  totalSales: number;
  totalPaid: number;
  totalRemaining: number;
  customerCount: number;
  productCount: number;
  transactionCount: number;
  lowStockCount: number;
  todaySales: number;
  monthSales: number;
  latestTransactions: TransactionDetails[];
  topCustomers: Array<Customer & { totalRemaining: number }>;
}

export interface SaleDraftItem {
  productId: string;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  stock: number;
}

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank', 'Jawwal Pay', 'Other'];
export const PRODUCT_CATEGORIES = ['Camera', 'DVR', 'NVR', 'Cable', 'Connector', 'Power Supply', 'Monitor', 'Hard Disk', 'Adapter', 'Other'];