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
import type { Category } from '../../types';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
}

const EMPTY_FORM: CategoryForm = { name: '', slug: '', description: '' };

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Category[] }>('/admin/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() =>
        api
          .get<{ success: boolean; data: Category[] }>('/categories')
          .then((res) => setCategories(res.data.data))
          .catch(() => setError('Gagal memuat kategori.'))
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '' });
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
    if (!form.name) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
    };
    try {
      if (editTarget) {
        await api.put(`/admin/categories/${editTarget.id}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
      setModalOpen(false);
      fetchCategories();
    } catch {
      setFormError('Gagal menyimpan kategori. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Hapus kategori "${cat.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${cat.id}`);
      fetchCategories();
    } catch {
      alert('Gagal menghapus kategori.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kategori produk CloudMart</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Kategori Baru
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
                <TableHeadCell>Nama</TableHeadCell>
                <TableHeadCell>Slug</TableHeadCell>
                <TableHeadCell>Jumlah Produk</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell className="text-right">Aksi</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                    Belum ada kategori.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium text-gray-900">{cat.name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-gray-500">{cat.slug}</span>
                    </TableCell>
                    <TableCell>{cat._count?.products ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={cat.is_active ? 'success' : 'danger'}>
                        {cat.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
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
        title={editTarget ? 'Edit Kategori' : 'Kategori Baru'}
      >
        <div className="space-y-4">
          <Input
            label="Nama Kategori"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Masukkan nama kategori"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="slug-kategori"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi kategori (opsional)"
            />
          </div>
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
              {editTarget ? 'Simpan' : 'Tambah Kategori'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
