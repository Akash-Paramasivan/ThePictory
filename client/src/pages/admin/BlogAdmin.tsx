import { useEffect, useState, type FormEvent } from 'react';
import { deleteBlogPost, getActiveBlogPosts, createBlogPost, type BlogPost } from '../../api/blogposts';
import { ApiError } from '../../api/client';

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => getActiveBlogPosts().then(setPosts).catch(() => setPosts([]));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      if (file) form.append('file', file);
      await createBlogPost(form);
      setTitle(''); setDescription(''); setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create post.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete post?')) return;
    await deleteBlogPost(id);
    await load();
  };

  return (
    <div className="bg-stone-50 min-h-screen p-8">
      <h1 className="font-serif text-3xl text-stone-900 mb-8">Blog Posts</h1>
      <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 mb-8 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div><label className="block text-sm font-medium mb-1">Title</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-md border border-stone-300 px-3 py-2"/></div>
        <div><label className="block text-sm font-medium mb-1">Description</label><input value={description} onChange={e=>setDescription(e.target.value)} className="w-full rounded-md border border-stone-300 px-3 py-2"/></div>
        <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Image (JPEG/PNG/WEBP)</label><input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]??null)} className="w-full text-sm"/></div>
        {error&&<p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
        <button type="submit" disabled={submitting} className="sm:col-span-2 bg-stone-900 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">{submitting?'Saving...':'Create post'}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map(p=>(
          <div key={p.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover mb-3 rounded-lg"/>}
            <h3 className="font-serif text-xl text-stone-800">{p.title}</h3>
            <p className="text-sm text-stone-500 mt-1">{p.description}</p>
            <button onClick={()=>handleDelete(p.id)} className="text-red-600 text-sm underline mt-2">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
