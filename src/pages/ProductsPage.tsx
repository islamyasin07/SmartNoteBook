import { useEffect, useMemo, useState } from 'react';
import { Plus, PackageSearch } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/productsService';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/SearchInput';
import { ProductForm } from '../components/products/ProductForm';
import { ProductTable } from '../components/products/ProductTable';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { GlassCard } from '../components/ui/GlassCard';

export const ProductsPage = () => {
  const { shopId, user } = useAuth();
  const { canDelete, canEdit } = useRole();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadProducts = async () => {
    if (!shopId) return;
    setLoading(true);
    const result = await getProducts(shopId);
    setProducts(result.products);
    setLoading(false);
  };

  useEffect(() => {
    void loadProducts();
  }, [shopId]);

  const filteredProducts = useMemo(
    () => products.filter((product) => [product.name, product.category, product.sku].join(' ').toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const saveProduct = async (payload: { name: string; category: string; sku: string; price: number; stock: number; low_stock_threshold: number; notes: string }) => {
    if (!shopId || !user) return;
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, payload);
      if (!result.error) {
        setEditingProduct(null);
        setFormOpen(false);
        await loadProducts();
      }
      return;
    }
    const result = await createProduct({ shopId, userId: user.id, ...payload });
    if (!result.error) {
      setFormOpen(false);
      await loadProducts();
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete.id);
    setProductToDelete(null);
    await loadProducts();
  };

  if (loading) return <LoadingState label="جاري تحميل البضائع..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">البضائع</h1>
          <p className="mt-1 text-sm text-slate-400">إدارة الأصناف، المخزون، والتنبيه عند انخفاض الكمية.</p>
        </div>
        {canEdit ? <button className="glass-button-primary" onClick={() => setFormOpen(true)}><Plus size={16} /> إضافة منتج</button> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث باسم المنتج أو SKU أو الفئة" />
        <GlassCard className="flex items-center gap-3 px-5 py-4 text-slate-300"><PackageSearch size={18} /> {filteredProducts.length} منتج</GlassCard>
      </div>

      {filteredProducts.length ? <ProductTable products={filteredProducts} onEdit={(product) => { setEditingProduct(product); setFormOpen(true); }} onDelete={(product) => setProductToDelete(product)} canDelete={canDelete} /> : <EmptyState icon={PackageSearch} title="لا توجد بضائع" description="أضف أول منتج لبدء إدارة المخزون والبيع." action={canEdit ? <button className="glass-button-primary" onClick={() => setFormOpen(true)}>إضافة منتج</button> : null} />}

      <Modal open={formOpen} title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج'} onClose={() => { setFormOpen(false); setEditingProduct(null); }}>
        <ProductForm initial={editingProduct} onSubmit={saveProduct} onCancel={() => { setFormOpen(false); setEditingProduct(null); }} />
      </Modal>

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="حذف المنتج"
        description={`هل تريد حذف المنتج ${productToDelete?.name ?? ''}؟`}
        confirmLabel="حذف"
        onConfirm={() => void handleDelete()}
        onClose={() => setProductToDelete(null)}
      />
    </div>
  );
};