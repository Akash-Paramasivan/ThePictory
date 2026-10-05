import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Offers from './pages/Offers';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AdminOverview from './pages/admin/AdminOverview';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import MediaAdmin from './pages/admin/MediaAdmin';
import OffersAdmin from './pages/admin/OffersAdmin';
import BlogAdmin from './pages/admin/BlogAdmin';
import MovieAdmin from './pages/admin/MovieAdmin';
import ContactsAdmin from './pages/admin/ContactsAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="media" element={<MediaAdmin />} />
          <Route path="offers" element={<OffersAdmin />} />
          <Route path="blog" element={<BlogAdmin />} />
          <Route path="movies" element={<MovieAdmin />} />
          <Route path="contacts" element={<ContactsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

