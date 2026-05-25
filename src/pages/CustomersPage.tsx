import { useEffect, useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Customer, TransactionDetails } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { createCustomer, deleteCustomer, getCustomerById, getCustomers, updateCustomer } from '../services/customersService';
import { getTransactionsByCustomerId, getTransactionDetails } from '../services/transactionsService';
import { addPayment } from '../services/paymentsService';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/SearchInput';
import { GlassCard } from '../components/ui/GlassCard';
import { CustomerForm } from '../components/customers/CustomerForm';
import { CustomerProfile } from '../components/customers/CustomerProfile';
import { CustomerTable } from '../components/customers/CustomerTable';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { TransactionDetails as TransactionDetailsModal } from '../components/transactions/TransactionDetails';

export const CustomersPage = () => {
  const { shopId, user } = useAuth();
  const { canDelete, canEdit } = useRole();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Array<Customer & { totalPurchases: number; totalPaid: number; remaining: number; lastTransactionDate: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionDetails[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    if (!shopId) return;
    setLoading(true);
    const result = await getCustomers(shopId);
    setCustomers(result.customers);
    setLoading(false);
  };

  useEffect(() => {
    void loadCustomers();
  }, [shopId]);

  const filteredCustomers = useMemo(
    () => customers.filter((customer) => [customer.name, customer.phone, customer.city].join(' ').toLowerCase().includes(search.toLowerCase())),
    [customers, search]
  );

  const openCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    if (!shopId) return;
    const result = await getTransactionsByCustomerId(shopId, customer.id);
    setSelectedTransactions(result.transactions);
  };

  const openTransaction = async (transaction: TransactionDetails) => {
    const details = await getTransactionDetails(transaction.id);
    if (details.transaction) setSelectedTransaction(details.transaction);
  };

  const handleAddPayment = async (transactionId: string, payload: { amount: number; date: string; method: any; note: string }) => {
    if (!shopId || !user) return;
    const result = await addPayment({ shopId, transactionId, userId: user.id, ...payload });
    if (result.error) {
      window.alert(result.error);
      return;
    }
    if (result.warning) window.alert(result.warning);
    const details = await getTransactionDetails(transactionId);
    if (details.transaction) setSelectedTransaction(details.transaction);
    await loadCustomers();
  };

  const saveCustomer = async (payload: { name: string; phone: string; city: string; notes: string }) => {
    if (!shopId || !user) return;
    if (!payload.name.trim()) return;
    if (editingCustomer) {
      const result = await updateCustomer(editingCustomer.id, payload);
      if (!result.error) {
        setFormOpen(false);
        setEditingCustomer(null);
        await loadCustomers();
      }
      return;
    }
    const result = await createCustomer({ shopId, userId: user.id, ...payload });
    if (!result.error) {
      setFormOpen(false);
      await loadCustomers();
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    await deleteCustomer(customerToDelete.id);
    setCustomerToDelete(null);
    await loadCustomers();
  };

  if (loading) return <LoadingState label="جاري تحميل الزبائن..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">الزبائن</h1>
          <p className="mt-1 text-sm text-slate-400">إدارة الزبائن، حساباتهم، وأرصدتهم في كل المتجر.</p>
        </div>
        {canEdit ? <button className="glass-button-primary" onClick={() => setFormOpen(true)}><Plus size={16} /> إضافة زبون</button> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث باسم الزبون أو الهاتف أو المدينة" />
        <GlassCard className="flex items-center gap-3 px-5 py-4 text-slate-300"><Users size={18} /> {filteredCustomers.length} زبون</GlassCard>
      </div>

      {filteredCustomers.length ? (
        <CustomerTable
          customers={filteredCustomers}
          onSelect={openCustomer}
          onEdit={(customer) => {
            setEditingCustomer(customer);
            setFormOpen(true);
          }}
          onDelete={(customer) => setCustomerToDelete(customer)}
          canDelete={canDelete}
        />
      ) : (
        <EmptyState icon={Users} title="لا توجد بيانات" description="ابدأ بإضافة أول زبون كي يظهر في السجل والحسابات." action={canEdit ? <button className="glass-button-primary" onClick={() => setFormOpen(true)}>إضافة زبون</button> : null} />
      )}

      <Modal open={formOpen} title={editingCustomer ? 'تعديل الزبون' : 'إضافة زبون جديد'} onClose={() => { setFormOpen(false); setEditingCustomer(null); }}>
        <CustomerForm initial={editingCustomer} onSubmit={saveCustomer} onCancel={() => { setFormOpen(false); setEditingCustomer(null); }} />
      </Modal>

      <Modal open={Boolean(selectedCustomer)} title="ملف الزبون" onClose={() => setSelectedCustomer(null)} widthClass="max-w-5xl">
        <CustomerProfile
          customer={selectedCustomer}
          transactions={selectedTransactions}
          onEdit={() => {
            if (!selectedCustomer) return;
            setEditingCustomer(selectedCustomer);
            setFormOpen(true);
          }}
          onViewTransaction={(transaction) => void openTransaction(transaction)}
          onAddPayment={(transaction) => void openTransaction(transaction)}
        />
      </Modal>

      <Modal open={Boolean(selectedTransaction)} title="تفاصيل العملية" onClose={() => setSelectedTransaction(null)} widthClass="max-w-5xl">
        <TransactionDetailsModal transaction={selectedTransaction} onAddPayment={handleAddPayment} onClose={() => setSelectedTransaction(null)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(customerToDelete)}
        title="حذف الزبون"
        description={`هل تريد حذف الزبون ${customerToDelete?.name ?? ''}؟ هذا الإجراء نهائي.`}
        confirmLabel="حذف"
        onConfirm={() => void handleDelete()}
        onClose={() => setCustomerToDelete(null)}
      />
    </div>
  );
};