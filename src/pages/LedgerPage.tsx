import { useEffect, useMemo, useState } from 'react';
import { FileClock, Search } from 'lucide-react';
import { TransactionDetails as TransactionDetailsType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { deleteTransaction, getTransactionDetails, getTransactions } from '../services/transactionsService';
import { addPayment } from '../services/paymentsService';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/SearchInput';
import { GlassCard } from '../components/ui/GlassCard';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { Modal } from '../components/ui/Modal';
import { TransactionDetails } from '../components/transactions/TransactionDetails';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const LedgerPage = () => {
  const { shopId, user } = useAuth();
  const { canDelete } = useRole();
  const [transactions, setTransactions] = useState<TransactionDetailsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionToView, setTransactionToView] = useState<TransactionDetailsType | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionDetailsType | null>(null);

  const loadTransactions = async () => {
    if (!shopId) return;
    setLoading(true);
    const result = await getTransactions(shopId);
    setTransactions(result.transactions);
    setLoading(false);
  };

  useEffect(() => {
    void loadTransactions();
  }, [shopId]);

  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const text = [transaction.id, transaction.customer?.name, transaction.customer?.phone, transaction.note, ...transaction.items.map((item) => `${item.product_name} ${item.sku ?? ''}`)].join(' ').toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }), [transactions, search, statusFilter]);

  const openTransaction = async (transaction: TransactionDetailsType) => {
    const details = await getTransactionDetails(transaction.id);
    if (details.transaction) setTransactionToView(details.transaction);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    await deleteTransaction(transactionToDelete.id);
    setTransactionToDelete(null);
    await loadTransactions();
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
    if (details.transaction) setTransactionToView(details.transaction);
    await loadTransactions();
  };

  if (loading) return <LoadingState label="جاري تحميل السجل..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">السجل</h1>
          <p className="mt-1 text-sm text-slate-400">تصفح كل العمليات، وابحث بالزبون أو المنتج أو المعرف أو الملاحظات.</p>
        </div>
        <GlassCard className="flex items-center gap-3 px-5 py-4 text-slate-300"><FileClock size={18} /> {filteredTransactions.length} عملية</GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto]">
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث في السجل" />
        <select className="glass-input min-w-40" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="paid">مدفوع</option>
          <option value="partial">جزئي</option>
          <option value="unpaid">غير مدفوع</option>
        </select>
      </div>

      {filteredTransactions.length ? (
        <TransactionTable
          transactions={filteredTransactions}
          onView={(transaction) => void openTransaction(transaction)}
          onDelete={(transaction) => setTransactionToDelete(transaction)}
          onAddPayment={(transaction) => void openTransaction(transaction)}
          canDelete={canDelete}
        />
      ) : (
        <EmptyState icon={Search} title="لا توجد عمليات مطابقة" description="جرّب كلمات بحث مختلفة أو أزل المرشح الحالي." />
      )}

      <Modal open={Boolean(transactionToView)} title="تفاصيل العملية" onClose={() => setTransactionToView(null)} widthClass="max-w-5xl">
        <TransactionDetails transaction={transactionToView} onAddPayment={handleAddPayment} onClose={() => setTransactionToView(null)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(transactionToDelete)}
        title="حذف العملية"
        description="هل تريد حذف هذه العملية؟ سيتم أيضًا إرجاع المخزون إلى المنتجات المرتبطة بها."
        confirmLabel="حذف"
        onConfirm={() => void handleDelete()}
        onClose={() => setTransactionToDelete(null)}
      />
    </div>
  );
};