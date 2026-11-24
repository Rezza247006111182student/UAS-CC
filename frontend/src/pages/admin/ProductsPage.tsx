import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from '../../components/ui/Table';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import type { Product, Category } from '../../types';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  imageUrl: string;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  categoryId: '',
  stock: '',
  imageUrl: '',
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Product[] }>('/admin/products')
      .then((res) => setProducts(res.data.data))
      .catch(() => setError('Gagal memuat produk.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api
      .get<{ success: boolean; data: Category[] }>('/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => {/* kategori tidak kritis */});
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditTarget(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      price: String(product.price),
      categoryId: product.category_id,
      stock: String(product.inventory?.quantity ?? 0),
      imageUrl: product.image_urls[0] ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editTarget ? prev.slug : toSlug(name),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      setFormError('Nama, harga, dan kategori wajib diisi.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      category_id: form.categoryId,
      stock: Number(form.stock),
      image_urls: form.imageUrl ? [form.imageUrl] : [],
    };
    try {
      if (editTarget) {
        await api.put(`/admin/products/${editTarget.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch {
      setFormError('Gagal menyimpan produk. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      fetchProducts();
    } catch {
      alert('Gagal menghapus produk.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola katalog produk CloudMart</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Produk Baru
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeadCell>Produk</TableHeadCell>
                <TableHeadCell>Kategori</TableHeadCell>
                <TableHeadCell>Harga</TableHeadCell>
                <TableHeadCell>Stok</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell className="text-right">Aksi</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                    Belum ada produk.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_urls[0] ? (
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <span className="font-medium text-gray-900 line-clamp-2 max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name ?? '-'}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>{product.inventory?.quantity ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'success' : 'danger'}>
                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Produk' : 'Produk Baru'}
      >
        <div className="space-y-4">
          <Input
            label="Nama Produk"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Masukkan nama produk"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="slug-produk"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi produk"
            />
          </div>
          <Input
            label="Harga"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            placeholder="150000"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
              value={form.categoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Stok"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            placeholder="0"
          />
          <Input
            label="URL Gambar"
            value={form.imageUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button className="flex-1" onClick={handleSubmit} loading={submitting}>
              {editTarget ? 'Simpan' : 'Tambah Produk'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
