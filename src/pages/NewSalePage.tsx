import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Customer, Product, SaleDraftItem, PaymentMethod } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getCustomers } from '../services/customersService';
import { getProducts } from '../services/productsService';
import { createTransaction } from '../services/transactionsService';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { NewSaleForm } from '../components/sales/NewSaleForm';
import { Modal } from '../components/ui/Modal';
import { CustomerForm } from '../components/customers/CustomerForm';
import { createCustomer } from '../services/customersService';

export const NewSalePage = () => {
  const { shopId, user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    Promise.all([getCustomers(shopId), getProducts(shopId)]).then(([customerResult, productResult]) => {
      setCustomers(customerResult.customers);
      setProducts(productResult.products);
      setLoading(false);
    });
  }, [shopId]);

  const handleCreateSale = async (payload: {
    customerId: string;
    date: string;
    note: string;
    items: SaleDraftItem[];
    paidAmount: number;
    paymentMethod: PaymentMethod;
    paymentNote: string;
  }) => {
    if (!shopId || !user) return;
    if (!payload.customerId) return;
    setSaving(true);

    const createResult = await createTransaction({
      shopId,
      userId: user.id,
      customerId: payload.customerId,
      date: payload.date,
      note: payload.note,
      items: payload.items,
      paidAmount: payload.paidAmount,
      paymentMethod: payload.paymentMethod,
      paymentNote: payload.paymentNote,
      overrideStock: false
    });

    if (createResult.error && createResult.error.includes('أكبر من الكمية المتاحة')) {
      const confirmOverride = window.confirm('هناك نقص في المخزون. هل تريد المتابعة كمدير وتجاوز الحد؟');
      if (confirmOverride) {
        const retry = await createTransaction({ ...payload, shopId, userId: user.id, overrideStock: true });
        if (!retry.error) {
          navigate('/ledger');
        } else {
          window.alert(retry.error);
        }
      }
      setSaving(false);
      return;
    }

    if (createResult.error) {
      window.alert(createResult.error);
      setSaving(false);
      return;
    }

    navigate('/ledger');
    setSaving(false);
  };

  const quickCustomer = async (payload: { name: string; phone: string; city: string; notes: string }) => {
    if (!shopId || !user) return;
    const result = await createCustomer({ shopId, userId: user.id, ...payload });
    if (result.customer) {
      setCustomers((current) => [result.customer!, ...current]);
      setQuickCustomerOpen(false);
    }
  };

  if (loading) return <LoadingState label="جاري تحميل صفحة البيع..." />;
  if (!customers.length || !products.length) return <EmptyState icon={Plus} title="تحتاج إلى زبائن وبضائع أولاً" description="أضف زبائن وبضائع قبل إنشاء أول عملية بيع." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">عملية بيع جديدة</h1>
        <p className="mt-1 text-sm text-slate-400">أنشئ فاتورة متعددة البنود مع دفعة أولية وتحديث فوري للمخزون.</p>
      </div>

      <NewSaleForm customers={customers} products={products} loading={saving} onSubmit={handleCreateSale} onQuickAddCustomer={() => setQuickCustomerOpen(true)} />

      <Modal open={quickCustomerOpen} title="إضافة زبون سريع" onClose={() => setQuickCustomerOpen(false)}>
        <CustomerForm onSubmit={quickCustomer} onCancel={() => setQuickCustomerOpen(false)} />
      </Modal>
    </div>
  );
};