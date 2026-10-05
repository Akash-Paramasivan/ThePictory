import { useEffect, useState, type FormEvent } from 'react';
import { deleteMovie, getActiveMovies, createMovie, type Movie } from '../../api/movies';
import { ApiError } from '../../api/client';

export default function MovieAdmin() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => getActiveMovies().then(setMovies).catch(() => setMovies([]));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(null);
    try {
      const form = new FormData();
      form.append('title', title); form.append('description', description); form.append('videoUrl', videoUrl);
      await createMovie(form); setTitle(''); setDescription(''); setVideoUrl(''); await load();
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Failed.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteMovie(id); await load(); };

  return (
    <div className="bg-stone-50 min-h-screen p-8">
      <h1 className="font-serif text-3xl text-stone-900 mb-8">Movies</h1>
      <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 mb-8 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div><label className="block text-sm font-medium mb-1">Title</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-md border border-stone-300 px-3 py-2"/></div>
        <div><label className="block text-sm font-medium mb-1">Video URL (YouTube)</label><input required value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} className="w-full rounded-md border border-stone-300 px-3 py-2"/></div>
        <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><input value={description} onChange={e=>setDescription(e.target.value)} className="w-full rounded-md border border-stone-300 px-3 py-2"/></div>
        {error&&<p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
        <button type="submit" disabled={submitting} className="sm:col-span-2 bg-stone-900 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">{submitting?'Saving...':'Create movie'}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {movies.map(m=>(
          <div key={m.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="font-serif text-xl text-stone-800">{m.title}</h3>
            <p className="text-sm text-stone-500 mt-1">{m.description}</p>
            <p className="text-xs text-stone-400 mt-2">{m.videoUrl}</p>
            <button onClick={()=>handleDelete(m.id)} className="text-red-600 text-sm underline mt-2">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
