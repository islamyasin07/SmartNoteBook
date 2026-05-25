import { toNumber } from '../lib/calculations';
import { DashboardStats } from '../types';
import { getCustomers } from './customersService';
import { getProducts } from './productsService';
import { getTransactions } from './transactionsService';

export const getDashboardStats = async (shopId: string) => {
  const [{ customers }, { products }, { transactions }] = await Promise.all([
    getCustomers(shopId),
    getProducts(shopId),
    getTransactions(shopId)
  ]);

  const totalSales = Number(transactions.reduce((sum, transaction) => sum + toNumber(transaction.subtotal), 0).toFixed(2));
  const totalPaid = Number(transactions.reduce((sum, transaction) => sum + toNumber(transaction.paid_total), 0).toFixed(2));
  const totalRemaining = Number(transactions.reduce((sum, transaction) => sum + toNumber(transaction.remaining), 0).toFixed(2));
  const lowStockCount = products.filter((product) => product.stock <= product.low_stock_threshold).length;
  const today = new Date().toISOString().slice(0, 10);
  const monthPrefix = today.slice(0, 7);
  const todaySales = Number(transactions.filter((transaction) => transaction.date === today).reduce((sum, transaction) => sum + toNumber(transaction.subtotal), 0).toFixed(2));
  const monthSales = Number(transactions.filter((transaction) => transaction.date.startsWith(monthPrefix)).reduce((sum, transaction) => sum + toNumber(transaction.subtotal), 0).toFixed(2));

  const topCustomers = customers
    .map((customer) => ({ ...customer, totalRemaining: customer.remaining }))
    .sort((left, right) => right.totalRemaining - left.totalRemaining)
    .slice(0, 5);

  return {
    totalSales,
    totalPaid,
    totalRemaining,
    customerCount: customers.length,
    productCount: products.length,
    transactionCount: transactions.length,
    lowStockCount,
    todaySales,
    monthSales,
    latestTransactions: transactions.slice(0, 6),
    topCustomers
  } as DashboardStats;
};
