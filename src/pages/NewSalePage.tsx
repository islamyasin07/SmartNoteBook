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
  const { shopId, user, session } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quickCustomerSaving, setQuickCustomerSaving] = useState(false);
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([getCustomers(shopId), getProducts(shopId)]).then(([customerResult, productResult]) => {
      setCustomers(customerResult.customers);
      setProducts(productResult.products);
      setLoading(false);
    });
  }, [shopId]);

  const handleCreateSale = async (payload: {
    customerId: string;
    // when customerId is empty, customerName can be provided
    customerName?: string;
    date: string;
    note: string;
    items: SaleDraftItem[];
    paidAmount: number;
    paymentMethod: PaymentMethod;
    paymentNote: string;
  }) => {
    const actorId = user?.id ?? session?.user?.id ?? null;
    if (!shopId) {
      window.alert('لا يوجد متجر مرتبط الآن. أعد تحميل الصفحة ثم حاول مرة أخرى.');
      return;
    }
    setSaving(true);
    setSubmitMessage('جاري حفظ العملية...');

    try {
      let customerIdToUse = payload.customerId;
      const customerNameToUse = (payload.customerName || '').trim();

      if (!customerIdToUse) {
        const createdCustomer = await createCustomer({ shopId, userId: actorId, name: customerNameToUse });
        if (createdCustomer.error) {
          throw new Error(createdCustomer.error);
        }
        customerIdToUse = createdCustomer.customer?.id ?? '';
      }

      const productsService = await import('../services/productsService');
      const itemsWithIds = [] as typeof payload.items;

      for (const [index, item] of payload.items.entries()) {
        if (item.productId) {
          itemsWithIds.push(item);
          continue;
        }

        const productNameToUse = (item.productName || '').trim();
        if (!productNameToUse) {
          throw new Error(`البند ${index + 1}: اكتب اسم المنتج أولاً`);
        }
        const createdProduct = await productsService.createProduct({
          shopId,
          userId: actorId,
          name: productNameToUse,
          price: item.unitPrice || 0,
          stock: item.quantity || 0,
          low_stock_threshold: 5
        });

        if (createdProduct.error) {
          throw new Error(createdProduct.error);
        }

        itemsWithIds.push({
          ...item,
          productId: createdProduct.product?.id || '',
          productName: productNameToUse
        });
      }

      const createResult = await createTransaction({
        shopId,
        userId: actorId,
        customerId: customerIdToUse,
        date: payload.date,
        note: payload.note,
        items: itemsWithIds,
        paidAmount: payload.paidAmount,
        paymentMethod: payload.paymentMethod,
        paymentNote: payload.paymentNote,
        overrideStock: false
      });

      if (createResult.error && createResult.error.includes('أكبر من الكمية المتاحة')) {
        const confirmOverride = window.confirm('هناك نقص في المخزون. هل تريد المتابعة كمدير وتجاوز الحد؟');
        if (confirmOverride) {
          const retry = await createTransaction({ ...payload, shopId, userId: actorId, overrideStock: true });
          if (!retry.error) {
            navigate('/ledger');
            return;
          }
          window.alert(retry.error);
        }
        return;
      }

      if (createResult.error) {
        window.alert(createResult.error);
        return;
      }

      setSubmitMessage('تم حفظ العملية، جارٍ الانتقال...');
      navigate('/ledger');
    } catch (error) {
      console.error('handleCreateSale failed:', error);
      const message = error instanceof Error ? error.message : 'تعذر حفظ العملية. تأكد من الاتصال ثم حاول مرة أخرى.';
      setSubmitMessage(message);
      window.alert(message);
    } finally {
      setSaving(false);
    }
  };

  const quickCustomer = async (payload: { name: string; phone: string; city: string; notes: string }) => {
    const actorId = user?.id ?? session?.user?.id ?? null;
    if (!shopId) {
      window.alert('لا يوجد متجر مرتبط الآن. أعد تحميل الصفحة ثم حاول مرة أخرى.');
      return;
    }

    setQuickCustomerSaving(true);
    setSubmitMessage('جاري إضافة الزبون...');
    try {
      const result = await createCustomer({ shopId, userId: actorId, ...payload });
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.customer) {
        setCustomers((current) => [result.customer!, ...current]);
        setSubmitMessage(`تمت إضافة الزبون: ${result.customer.name}`);
        setQuickCustomerOpen(false);
      }
    } catch (error) {
      console.error('quickCustomer failed:', error);
      const message = error instanceof Error ? error.message : 'تعذر إضافة الزبون.';
      setSubmitMessage(message);
      window.alert(message);
    } finally {
      setQuickCustomerSaving(false);
    }
  };

  if (loading) return <LoadingState label="جاري تحميل صفحة البيع..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">عملية بيع جديدة</h1>
        <p className="mt-1 text-sm text-slate-400">أنشئ فاتورة متعددة البنود مع دفعة أولية وتحديث فوري للمخزون.</p>
        {submitMessage ? <p className="mt-2 text-sm text-cyan-200">{submitMessage}</p> : null}
      </div>

      <NewSaleForm customers={customers} products={products} loading={saving} onSubmit={handleCreateSale} onQuickAddCustomer={() => setQuickCustomerOpen(true)} />

      <Modal open={quickCustomerOpen} title="إضافة زبون سريع" onClose={() => setQuickCustomerOpen(false)}>
        <CustomerForm loading={quickCustomerSaving} onSubmit={quickCustomer} onCancel={() => setQuickCustomerOpen(false)} />
      </Modal>
    </div>
  );
};