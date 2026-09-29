import { useEffect, useState, type FormEvent } from 'react';
import { createCategory, deleteCategory, getCategories, updateCategory, type Category } from '../../api/categories';
import { ApiError } from '../../api/client';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => getCategories().then(setCategories).catch(() => setCategories([]));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, name, sortOrder);
      } else {
        await createCategory(name, sortOrder);
      }
      setName('');
      setSortOrder(0);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save category.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete category.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end mb-8 bg-white p-4 rounded-lg border border-neutral-200">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sort order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="rounded-md border border-neutral-300 px-3 py-2 w-24"
          />
        </div>
        <button type="submit" className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium">
          {editingId ? 'Update' : 'Add'} category
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName('');
              setSortOrder(0);
            }}
            className="text-sm text-neutral-500"
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg border border-neutral-200 divide-y">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3">
            <span>
              {cat.name} <span className="text-neutral-400 text-sm">(order {cat.sortOrder})</span>
            </span>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEditingId(cat.id);
                  setName(cat.name);
                  setSortOrder(cat.sortOrder);
                }}
                className="text-neutral-600 hover:underline"
              >
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="px-4 py-6 text-neutral-500 text-sm">No categories yet.</p>}
      </div>
    </div>
  );
}
